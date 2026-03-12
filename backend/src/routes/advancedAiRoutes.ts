import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  extractSkills,
  predictAtsScore,
  rewriteResume,
  recommendJobs,
  analyzeCareerGap,
  generateInterviewQuestions,
} from '../controllers/advancedAiController';

const router = express.Router();

router.post('/extract-skills', authenticate, extractSkills);
router.post('/predict-ats', authenticate, predictAtsScore);
router.post('/rewrite-resume', authenticate, rewriteResume);
router.post('/recommend-jobs', authenticate, recommendJobs);
router.post('/career-gap', authenticate, analyzeCareerGap);
router.post('/interview-questions', authenticate, generateInterviewQuestions);

export default router;
