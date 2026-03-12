import api from './api';

export const advancedAiApi = {
  extractSkills: async (text: string) => {
    const response = await api.post('/api/advanced-ai/extract-skills', { text });
    return response.data;
  },

  predictAtsScore: async (features: Record<string, number>) => {
    const response = await api.post('/api/advanced-ai/predict-ats', { features });
    return response.data;
  },

  rewriteResume: async (bullets: string[]) => {
    const response = await api.post('/api/advanced-ai/rewrite-resume', { bullets });
    return response.data;
  },

  recommendJobs: async (resume_embedding: number[], job_postings: any[]) => {
    const response = await api.post('/api/advanced-ai/recommend-jobs', {
      resume_embedding,
      job_postings,
    });
    return response.data;
  },

  analyzeCareerGap: async (resume_text: string, target_job: string) => {
    const response = await api.post('/api/advanced-ai/career-gap', {
      resume_text,
      target_job,
    });
    return response.data;
  },

  generateInterviewQuestions: async (resume_text: string) => {
    const response = await api.post('/api/advanced-ai/interview-questions', {
      resume_text,
    });
    return response.data;
  },
};
