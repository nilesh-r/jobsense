import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Create job description
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, companyName, jdText } = req.body;

    if (!title || !companyName || !jdText) {
      return res.status(400).json({ error: 'Title, company name, and job description are required' });
    }

    const job = await prisma.job.create({
      data: {
        userId: req.userId!,
        title,
        companyName,
        jdText
      }
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job description' });
  }
});

// Get all jobs for user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' }
    });

    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get single job
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const job = await prisma.job.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

export default router;

