import { Request, Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const extractSkills = async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/extract-skills`, { text });
    res.json(aiResponse.data);
  } catch (error: any) {
    console.error('Skill extraction error:', error.message);
    res.status(500).json({ error: 'Failed to extract skills' });
  }
};

export const predictAtsScore = async (req: AuthRequest, res: Response) => {
  try {
    const { features } = req.body;
    if (!features) return res.status(400).json({ error: 'Features object is required' });

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict-ats-score`, { features });
    res.json(aiResponse.data);
  } catch (error: any) {
    console.error('ATS Prediction error:', error.message);
    res.status(500).json({ error: 'Failed to predict ATS score' });
  }
};

export const rewriteResume = async (req: AuthRequest, res: Response) => {
  try {
    const { bullets } = req.body;
    if (!bullets || !Array.isArray(bullets)) return res.status(400).json({ error: 'Array of bullets is required' });

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/rewrite-resume`, { bullets });
    res.json(aiResponse.data);
  } catch (error: any) {
    console.error('Resume rewrite error:', error.message);
    res.status(500).json({ error: 'Failed to rewrite resume' });
  }
};

export const recommendJobs = async (req: AuthRequest, res: Response) => {
  try {
    const { resume_embedding, job_postings } = req.body;
    if (!resume_embedding || !job_postings) return res.status(400).json({ error: 'resume_embedding and job_postings are required' });

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/recommend-jobs`, {
      resume_embedding,
      job_postings,
    });
    res.json(aiResponse.data);
  } catch (error: any) {
    console.error('Job recommendation error:', error.message);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};

export const analyzeCareerGap = async (req: AuthRequest, res: Response) => {
  try {
    const { resume_text, target_job } = req.body;
    if (!resume_text || !target_job) return res.status(400).json({ error: 'resume_text and target_job are required' });

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/career-gap-analysis`, {
      resume_text,
      target_job,
    });
    res.json(aiResponse.data);
  } catch (error: any) {
    console.error('Career gap analysis error:', error.message);
    res.status(500).json({ error: 'Failed to analyze career gap' });
  }
};

export const generateInterviewQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { resume_text } = req.body;
    if (!resume_text) return res.status(400).json({ error: 'resume_text is required' });

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/generate-interview-questions`, {
      resume_text,
    });
    res.json(aiResponse.data);
  } catch (error: any) {
    console.error('Interview generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate interview questions' });
  }
};
