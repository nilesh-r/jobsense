import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { extractTextFromResume } from '../services/resumeParser';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  }
});

// Upload resume
router.post('/', authenticate, upload.single('resume'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from resume
    const parsedText = await extractTextFromResume(req.file);

    // Save to database
    const resume = await prisma.resume.create({
      data: {
        userId: req.userId!,
        originalFileName: req.file.originalname,
        parsedText
      }
    });

    res.status(201).json(resume);
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// Get all resumes for user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' }
    });

    res.json(resumes);
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// Get single resume
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!
      }
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json(resume);
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

export default router;

