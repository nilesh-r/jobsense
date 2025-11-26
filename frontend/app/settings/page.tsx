'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AIChat from '@/components/AIChat';
import { isAuthenticated, getUser, clearAuth } from '@/lib/auth';
import api, { API_URL } from '@/lib/api';
import toast from 'react-hot-toast';

interface Resume {
  id: string;
  originalFileName: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(getUser());
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [activeTab, setActiveTab] = useState('account');

  const [formData, setFormData] = useState({
    // Account & Security
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    // Resume & Profile Defaults
    defaultResumeId: '',
    defaultJobRole: '',
    experienceLevel: '',
    // AI & Analysis Preferences
    analysisDetailLevel: 'standard',
    language: 'english',
    tone: '',
    // Data & Privacy
    confirmDelete: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchUser();
    fetchResumes();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data.user);
      const prefs = response.data.user.preferences || {};
      setFormData((prev) => ({
        ...prev,
        name: response.data.user.name,
        email: response.data.user.email,
        defaultResumeId: prefs.defaultResumeId || '',
        defaultJobRole: prefs.defaultJobRole || '',
        experienceLevel: prefs.experienceLevel || '',
        analysisDetailLevel: prefs.analysisDetailLevel || 'standard',
        language: prefs.language || 'english',
        tone: prefs.tone || '',
      }));
    } catch (error) {
      toast.error('Failed to load user data');
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await api.get('/api/resume');
      setResumes(response.data);
    } catch (error: any) {
      console.error('Failed to fetch resumes', error);
      if (error?.response?.status === 401) {
        clearAuth();
        router.replace('/login');
        return;
      }
      if (error?.message === 'Network Error') {
        toast.error(
          `Cannot reach backend at ${API_URL}. Start the API server or set NEXT_PUBLIC_API_URL.`
        );
        return;
      }
      toast.error('Failed to load resumes');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/api/settings/profile', {
        name: formData.name,
      });
      setUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/settings/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Password changed successfully!');
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      await api.put('/api/settings/preferences', {
        defaultResumeId: formData.defaultResumeId,
        defaultJobRole: formData.defaultJobRole,
        experienceLevel: formData.experienceLevel,
        analysisDetailLevel: formData.analysisDetailLevel,
        language: formData.language,
        tone: formData.tone,
      });
      toast.success('Preferences saved successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAnalyses = async () => {
    if (!confirm('Are you sure you want to clear all analyses? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete('/api/settings/clear-analyses');
      toast.success('All analyses cleared successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to clear analyses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (formData.confirmDelete !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete('/api/settings/delete-account');
      clearAuth();
      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crystal-bg min-h-screen pb-32">
      <Navbar />
      <AIChat />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-white text-glow">Settings</h1>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {[
            { id: 'account', label: 'Account & Security' },
            { id: 'resume', label: 'Resume & Profile' },
            { id: 'ai', label: 'AI & Analysis' },
            { id: 'privacy', label: 'Data & Privacy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'glass-strong text-white'
                  : 'glass text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Account & Security */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl">
              <h2 className="text-2xl font-semibold mb-6 text-white">Profile Info</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 glass rounded-xl text-white/60 cursor-not-allowed"
                  />
                  <p className="text-xs text-white/60 mt-1">Email cannot be changed</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>

            <div className="glass-card p-6 rounded-3xl">
              <h2 className="text-2xl font-semibold mb-6 text-white">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">Current Password</label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">New Password</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">Confirm New Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Resume & Profile Defaults */}
        {activeTab === 'resume' && (
          <div className="glass-card p-6 rounded-3xl">
            <h2 className="text-2xl font-semibold mb-6 text-white">Resume & Profile Defaults</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Default Resume</label>
                <select
                  value={formData.defaultResumeId}
                  onChange={(e) => setFormData({ ...formData, defaultResumeId: e.target.value })}
                  className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                >
                  <option value="">Select a default resume</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id} className="bg-gray-800">
                      {resume.originalFileName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Default Job Role</label>
                <input
                  type="text"
                  value={formData.defaultJobRole}
                  onChange={(e) => setFormData({ ...formData, defaultJobRole: e.target.value })}
                  placeholder="e.g., Software Engineer, Product Manager"
                  className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Experience Level</label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                >
                  <option value="">Select experience level</option>
                  <option value="entry" className="bg-gray-800">Entry Level (0-2 years)</option>
                  <option value="mid" className="bg-gray-800">Mid Level (3-5 years)</option>
                  <option value="senior" className="bg-gray-800">Senior Level (6-10 years)</option>
                  <option value="executive" className="bg-gray-800">Executive (10+ years)</option>
                </select>
              </div>
              <button
                onClick={handleSavePreferences}
                disabled={loading}
                className="w-full bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}

        {/* AI & Analysis Preferences */}
        {activeTab === 'ai' && (
          <div className="glass-card p-6 rounded-3xl">
            <h2 className="text-2xl font-semibold mb-6 text-white">AI & Analysis Preferences</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Analysis Detail Level</label>
                <select
                  value={formData.analysisDetailLevel}
                  onChange={(e) => setFormData({ ...formData, analysisDetailLevel: e.target.value })}
                  className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                >
                  <option value="basic" className="bg-gray-800">Basic (Quick overview)</option>
                  <option value="standard" className="bg-gray-800">Standard (Recommended)</option>
                  <option value="detailed" className="bg-gray-800">Detailed (Comprehensive analysis)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                >
                  <option value="english" className="bg-gray-800">English</option>
                  <option value="hinglish" className="bg-gray-800">Hinglish</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Tone (Optional)</label>
                <input
                  type="text"
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  placeholder="e.g., Professional, Friendly, Casual"
                  className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                />
                <p className="text-xs text-white/60 mt-1">Customize the tone of AI suggestions</p>
              </div>
              <button
                onClick={handleSavePreferences}
                disabled={loading}
                className="w-full bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}

        {/* Data & Privacy */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl">
              <h2 className="text-2xl font-semibold mb-6 text-white">Clear All Analyses</h2>
              <p className="text-white/80 mb-4">
                This will permanently delete all your analysis history. This action cannot be undone.
              </p>
              <button
                onClick={handleClearAnalyses}
                disabled={loading}
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 border border-red-500/30"
              >
                {loading ? 'Clearing...' : 'Clear All Analyses'}
              </button>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-red-500/30">
              <h2 className="text-2xl font-semibold mb-6 text-red-400">Delete Account</h2>
              <p className="text-white/80 mb-4">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">
                    Type <span className="text-red-400">DELETE</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={formData.confirmDelete}
                    onChange={(e) => setFormData({ ...formData, confirmDelete: e.target.value })}
                    placeholder="DELETE"
                    className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                  />
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading || formData.confirmDelete !== 'DELETE'}
                  className="w-full bg-red-500/30 hover:bg-red-500/40 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 border border-red-500/50"
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
