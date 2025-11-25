'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CrystalElements from '@/components/CrystalElements';
import { isAuthenticated } from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Resume {
  id: string;
  originalFileName: string;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  companyName: string;
  createdAt: string;
}

interface Analysis {
  id: string;
  atsScore: number;
  createdAt: string;
  resume: { originalFileName: string };
  job: { title: string; companyName: string };
}

export default function DashboardPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resume' | 'job' | 'analyze'>('resume');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resumesRes, jobsRes, analysesRes] = await Promise.all([
        api.get('/api/resume'),
        api.get('/api/job'),
        api.get('/api/analysis'),
      ]);
      setResumes(resumesRes.data);
      setJobs(jobsRes.data);
      setAnalyses(analysesRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    try {
      await api.post('/api/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Resume uploaded successfully!');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed');
    }
  };

  const handleCreateJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      companyName: formData.get('companyName') as string,
      jdText: formData.get('jdText') as string,
    };

    try {
      await api.post('/api/job', data);
      toast.success('Job description saved!');
      fetchData();
      setActiveTab('analyze');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save job');
    }
  };

  const handleAnalyze = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const resumeId = formData.get('resumeId') as string;
    const jobId = formData.get('jobId') as string;

    if (!resumeId || !jobId) {
      toast.error('Please select both resume and job description');
      return;
    }

    try {
      const response = await api.post('/api/analysis', { resumeId, jobId });
      toast.success('Analysis complete!');
      router.push(`/analysis/${response.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Analysis failed');
    }
  };

  if (loading) {
    return (
      <div className="crystal-bg min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="crystal-bg min-h-screen">
      <CrystalElements />
      <Navbar />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-white text-glow">Dashboard</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 glass-strong p-2 rounded-2xl backdrop-blur-xl">
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === 'resume'
                ? 'bg-white/30 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Upload Resume
          </button>
          <button
            onClick={() => setActiveTab('job')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === 'job'
                ? 'bg-white/30 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Add Job Description
          </button>
          <button
            onClick={() => setActiveTab('analyze')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === 'analyze'
                ? 'bg-white/30 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Analyze
          </button>
        </div>

        {/* Resume Upload Tab */}
        {activeTab === 'resume' && (
          <div className="glass-card p-8 rounded-3xl mb-6">
            <h2 className="text-2xl font-bold mb-6 text-white">Upload Resume</h2>
            <div className="mb-6">
              <label className="block mb-4 text-white/90 font-medium">Choose File (PDF or DOCX)</label>
              <div className="glass p-8 rounded-2xl border-2 border-dashed border-white/30 text-center hover:border-white/50 transition-all cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <svg className="w-16 h-16 mx-auto mb-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-white/80">Click to upload or drag and drop</p>
                  <p className="text-sm text-white/60 mt-2">PDF, DOCX (MAX. 10MB)</p>
                </label>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="font-semibold mb-4 text-white text-lg">Your Resumes</h3>
              {resumes.length === 0 ? (
                <p className="text-white/60 glass p-4 rounded-xl text-center">No resumes uploaded yet</p>
              ) : (
                <div className="space-y-3">
                  {resumes.map((resume) => (
                    <div key={resume.id} className="glass p-4 rounded-xl flex justify-between items-center hover:bg-white/10 transition-all">
                      <span className="text-white font-medium">{resume.originalFileName}</span>
                      <span className="text-sm text-white/60">
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Job Description Tab */}
        {activeTab === 'job' && (
          <div className="glass-card p-8 rounded-3xl mb-6">
            <h2 className="text-2xl font-bold mb-6 text-white">Add Job Description</h2>
            <form onSubmit={handleCreateJob} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Job Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  placeholder="e.g., Google"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Job Description</label>
                <textarea
                  name="jdText"
                  required
                  rows={10}
                  className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all resize-none"
                  placeholder="Paste the full job description here..."
                />
              </div>
              <button
                type="submit"
                className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm border border-white/20"
              >
                Save Job Description
              </button>
            </form>
            <div className="mt-8">
              <h3 className="font-semibold mb-4 text-white text-lg">Saved Jobs</h3>
              {jobs.length === 0 ? (
                <p className="text-white/60 glass p-4 rounded-xl text-center">No job descriptions saved yet</p>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div key={job.id} className="glass p-4 rounded-xl hover:bg-white/10 transition-all">
                      <span className="font-medium text-white">{job.title}</span>
                      <span className="text-white/80"> at </span>
                      <span className="font-medium text-white">{job.companyName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <div className="glass-card p-8 rounded-3xl mb-6">
            <h2 className="text-2xl font-bold mb-6 text-white">Analyze Resume vs Job</h2>
            <form onSubmit={handleAnalyze} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Select Resume</label>
                <select
                  name="resumeId"
                  required
                  className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                >
                  <option value="" className="bg-gray-800">Choose a resume...</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id} className="bg-gray-800">
                      {resume.originalFileName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Select Job Description</label>
                <select
                  name="jobId"
                  required
                  className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                >
                  <option value="" className="bg-gray-800">Choose a job...</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id} className="bg-gray-800">
                      {job.title} - {job.companyName}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm border border-white/20 text-lg"
              >
                🚀 Analyze Now
              </button>
            </form>
          </div>
        )}

        {/* Recent Analyses */}
        <div className="glass-card p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-6 text-white">Recent Analyses</h2>
          {analyses.length === 0 ? (
            <p className="text-white/60 glass p-6 rounded-xl text-center">No analyses yet. Create one to get started!</p>
          ) : (
            <div className="space-y-4">
              {analyses.slice(0, 5).map((analysis) => (
                <Link
                  key={analysis.id}
                  href={`/analysis/${analysis.id}`}
                  className="block glass p-6 rounded-2xl hover:bg-white/15 transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white text-lg group-hover:text-white/90">
                        {analysis.job.title} - {analysis.job.companyName}
                      </p>
                      <p className="text-sm text-white/60 mt-1">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-4xl font-bold gradient-text">
                      {analysis.atsScore}%
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
