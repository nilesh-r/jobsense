import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  companyName: z.string().min(1, 'Company Name is required'),
  jdText: z.string().min(10, 'Job Description must be robust')
});

export const analyzeResumeSchema = z.object({
  resumeId: z.string().cuid('Invalid Resume ID format'),
  jobId: z.string().cuid('Invalid Job ID format')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

export const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional()
});
