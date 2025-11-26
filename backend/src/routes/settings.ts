import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Change password
router.post('/change-password', authenticate, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has a password (Google users might not)
    if (!user.passwordHash) {
      return res.status(400).json({ error: 'You signed in with Google. Please set a password first.' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.userId! },
      data: { passwordHash: newPasswordHash },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Update profile
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        preferences: true,
      },
    });

    res.json({ user, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update preferences
router.put('/preferences', authenticate, async (req: AuthRequest, res) => {
  try {
    const { defaultResumeId, defaultJobRole, experienceLevel, analysisDetailLevel, language, tone } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentPreferences = (user.preferences as any) || {};
    const updatedPreferences = {
      ...currentPreferences,
      defaultResumeId: defaultResumeId || currentPreferences.defaultResumeId,
      defaultJobRole: defaultJobRole || currentPreferences.defaultJobRole,
      experienceLevel: experienceLevel || currentPreferences.experienceLevel,
      analysisDetailLevel: analysisDetailLevel || currentPreferences.analysisDetailLevel || 'standard',
      language: language || currentPreferences.language || 'english',
      tone: tone || currentPreferences.tone,
    };

    await prisma.user.update({
      where: { id: req.userId! },
      data: { preferences: updatedPreferences },
    });

    res.json({ message: 'Preferences updated successfully', preferences: updatedPreferences });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Clear all analyses
router.delete('/clear-analyses', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.analysis.deleteMany({
      where: { userId: req.userId! },
    });

    res.json({ message: 'All analyses cleared successfully' });
  } catch (error) {
    console.error('Clear analyses error:', error);
    res.status(500).json({ error: 'Failed to clear analyses' });
  }
});

// Delete account (soft delete)
router.delete('/delete-account', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.user.update({
      where: { id: req.userId! },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
