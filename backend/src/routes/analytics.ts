import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get analytics summary
router.get('/summary', authenticate, async (req: AuthRequest, res) => {
  try {
    // Aggregate basic stats
    const stats = await prisma.analysis.aggregate({
      where: { userId: req.userId! },
      _avg: { atsScore: true },
      _count: { id: true }
    });

    if (stats._count.id === 0) {
      return res.json({
        avgScore: 0,
        totalAnalyses: 0,
        topRoles: [],
        commonMissingKeywords: [],
        scoreTrend: []
      });
    }

    // Top roles (we still need to fetch many for this manual aggregation as Prisma can't easily group by a relation field and count in one go efficiently without raw queries, but we can at least only select Title)
    const analysesForRoles = await prisma.analysis.findMany({
      where: { userId: req.userId! },
      select: {
        job: { select: { title: true } }
      }
    });

    const roleCounts: Record<string, number> = {};
    analysesForRoles.forEach(analysis => {
      const role = analysis.job.title;
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    const topRoles = Object.entries(roleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([title, count]) => ({ title, count }));

    // Common missing keywords
    const analysesForKeywords = await prisma.analysis.findMany({
      where: { 
        userId: req.userId!,
        NOT: { missingKeywords: { equals: Prisma.AnyNull } }
      },
      select: { missingKeywords: true }
    });

    const keywordCounts: Record<string, number> = {};
    analysesForKeywords.forEach(analysis => {
      const missing = analysis.missingKeywords as string[];
      if (Array.isArray(missing)) {
        missing.forEach(keyword => {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        });
      }
    });

    const commonMissingKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    // Score trend (last 10 analyses) - efficient fetch
    const scoreTrendData = await prisma.analysis.findMany({
      where: { userId: req.userId! },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { job: { select: { title: true } } }
    });

    const scoreTrend = scoreTrendData
      .map(a => ({
        date: a.createdAt.toISOString(),
        score: a.atsScore,
        jobTitle: a.job.title
      }))
      .reverse(); // Chronological for the chart

    res.json({
      avgScore: Math.round(stats._avg.atsScore || 0),
      totalAnalyses: stats._count.id,
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

