import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { analyzeResumeSchema } from '../schemas';
import { analyzeResume } from '../services/atsScoring';
import axios from 'axios';

const router = express.Router();
const prisma = new PrismaClient();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Create analysis
router.post('/', authenticate, validateRequest(analyzeResumeSchema), async (req: AuthRequest, res) => {
  try {
    const { resumeId, jobId } = req.body;

    // Fetch resume and job
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: req.userId!
      }
    });

    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        userId: req.userId!
      }
    });

    if (!resume || !job) {
      return res.status(404).json({ error: 'Resume or Job not found' });
    }

    if (!resume.parsedText) {
      return res.status(400).json({ error: 'Resume text not parsed' });
    }

    // Basic ATS scoring
    const basicScore = analyzeResume(resume.parsedText, job.jdText);

    // Call AI service for embeddings and advanced analysis
    let embeddingSimilarity = null;
    let detailedAnalysis = null;

    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/score-resume-vs-jd`, {
        resume_text: resume.parsedText,
        job_description: job.jdText
      });

      embeddingSimilarity = aiResponse.data.similarity;
      detailedAnalysis = aiResponse.data.detailed_analysis;
    } catch (error: any) {
      if (error.response?.status === 429) {
        return res.status(429).json({ error: 'AI Service rate limit reached. Please wait a minute and try again.' });
      }
      console.warn('AI service unavailable, using basic scoring only');
    }

    // Combine scores
    let finalAtsScore = basicScore.overallScore;
    let keywordScore = basicScore.keywordScore;
    let skillsScore = basicScore.skillsScore;
    let experienceScore = basicScore.experienceScore;

    if (detailedAnalysis) {
      finalAtsScore = detailedAnalysis.overall_score !== undefined ? detailedAnalysis.overall_score : Math.round(embeddingSimilarity! * 100);
      keywordScore = detailedAnalysis.keyword_score !== undefined ? detailedAnalysis.keyword_score : keywordScore;
      skillsScore = detailedAnalysis.skills_score !== undefined ? detailedAnalysis.skills_score : skillsScore;
      experienceScore = detailedAnalysis.experience_score !== undefined ? detailedAnalysis.experience_score : experienceScore;
    }

    // Create analysis
    const analysis = await prisma.analysis.create({
      data: {
        userId: req.userId!,
        resumeId,
        jobId,
        atsScore: finalAtsScore,
        keywordMatchScore: keywordScore,
        skillsMatchScore: skillsScore,
        experienceMatchScore: experienceScore,
        embeddingSimilarity,
        missingKeywords: basicScore.missingKeywords,
        partialMatchKeywords: basicScore.partialMatches,
        suggestions: detailedAnalysis || basicScore.suggestions
      },
      include: {
        resume: true,
        job: true
      }
    });

    res.status(201).json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to create analysis' });
  }
});

// Get all analyses for user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const analyses = await prisma.analysis.findMany({
      where: { userId: req.userId! },
      include: {
        resume: {
          select: {
            id: true,
            originalFileName: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            companyName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(analyses);
  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

// Get single analysis
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!
      },
      include: {
        resume: true,
        job: true
      }
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

export default router;

