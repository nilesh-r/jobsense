import express from 'express';
import axios from 'axios';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Chat with AI
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call AI service for chat response
    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/chat`, {
        message,
        conversation_history: conversationHistory || [],
        user_id: req.userId,
      });

      res.json({
        response: aiResponse.data.response,
        suggestions: aiResponse.data.suggestions || [],
      });
    } catch (error: any) {
      // Fallback response if AI service is unavailable
      console.warn('AI service unavailable, using fallback');
      
      // Simple keyword-based fallback
      const lowerMessage = message.toLowerCase();
      let response = "I'm here to help you with your resume and job search! ";
      
      if (lowerMessage.includes('ats') || lowerMessage.includes('score')) {
        response += "Your ATS score is calculated based on keyword matching, skills alignment, and experience relevance. ";
        response += "To improve your score, make sure to include relevant keywords from the job description in your resume.";
      } else if (lowerMessage.includes('keyword') || lowerMessage.includes('missing')) {
        response += "Missing keywords are important terms from the job description that aren't in your resume. ";
        response += "Try to naturally incorporate these keywords into your experience and skills sections.";
      } else if (lowerMessage.includes('resume') || lowerMessage.includes('improve')) {
        response += "To improve your resume: 1) Match keywords from job descriptions, 2) Quantify your achievements, ";
        response += "3) Highlight relevant skills, and 4) Use action verbs to describe your experience.";
      } else {
        response += "You can ask me about ATS scores, missing keywords, resume improvements, or job search tips. ";
        response += "What would you like to know?";
      }

      res.json({
        response,
        suggestions: [
          "How can I improve my ATS score?",
          "What keywords am I missing?",
          "How do I optimize my resume?",
        ],
      });
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

export default router;

