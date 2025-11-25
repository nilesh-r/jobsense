import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get analytics summary
router.get('/summary', authenticate, async (req: AuthRequest, res) => {
  try {
    const analyses = await prisma.analysis.findMany({
      where: { userId: req.userId! },
      include: {
        job: true
      }
    });

    if (analyses.length === 0) {
      return res.json({
        avgScore: 0,
        totalAnalyses: 0,
        topRoles: [],
        commonMissingKeywords: [],
        scoreTrend: []
      });
    }

    // Calculate average score
    const avgScore = Math.round(
      analyses.reduce((sum, a) => sum + a.atsScore, 0) / analyses.length
    );

    // Top roles
    const roleCounts: Record<string, number> = {};
    analyses.forEach(analysis => {
      const role = analysis.job.title;
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
    const topRoles = Object.entries(roleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([title, count]) => ({ title, count }));

    // Common missing keywords
    const keywordCounts: Record<string, number> = {};
    analyses.forEach(analysis => {
      if (analysis.missingKeywords) {
        const missing = analysis.missingKeywords as string[];
        missing.forEach(keyword => {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        });
      }
    });
    const commonMissingKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    // Score trend (last 10 analyses)
    const scoreTrend = analyses
      .slice(-10)
      .map(a => ({
        date: a.createdAt.toISOString(),
        score: a.atsScore,
        jobTitle: a.job.title
      }));

    res.json({
      avgScore,
      totalAnalyses: analyses.length,
      topRoles,
      commonMissingKeywords,
      scoreTrend
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;

