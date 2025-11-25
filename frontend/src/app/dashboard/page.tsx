'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('resume')}
            className={`pb-2 px-4 ${activeTab === 'resume' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
          >
            Upload Resume
          </button>
          <button
            onClick={() => setActiveTab('job')}
            className={`pb-2 px-4 ${activeTab === 'job' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
          >
            Add Job Description
          </button>
          <button
            onClick={() => setActiveTab('analyze')}
            className={`pb-2 px-4 ${activeTab === 'analyze' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
          >
            Analyze
          </button>
        </div>

        {/* Resume Upload Tab */}
        {activeTab === 'resume' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleResumeUpload}
              className="mb-4"
            />
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Your Resumes:</h3>
              {resumes.length === 0 ? (
                <p className="text-gray-500">No resumes uploaded yet</p>
              ) : (
                <ul className="space-y-2">
                  {resumes.map((resume) => (
                    <li key={resume.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{resume.originalFileName}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Job Description Tab */}
        {activeTab === 'job' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Add Job Description</h2>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job Description</label>
                <textarea
                  name="jdText"
                  required
                  rows={10}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Save Job Description
              </button>
            </form>
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Saved Jobs:</h3>
              {jobs.length === 0 ? (
                <p className="text-gray-500">No job descriptions saved yet</p>
              ) : (
                <ul className="space-y-2">
                  {jobs.map((job) => (
                    <li key={job.id} className="p-2 bg-gray-50 rounded">
                      <span className="font-medium">{job.title}</span> at{' '}
                      <span className="font-medium">{job.companyName}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Analyze Resume vs Job</h2>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Resume</label>
                <select
                  name="resumeId"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Choose a resume...</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.originalFileName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Select Job Description</label>
                <select
                  name="jobId"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Choose a job...</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} - {job.companyName}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Analyze
              </button>
            </form>
          </div>
        )}

        {/* Recent Analyses */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Analyses</h2>
          {analyses.length === 0 ? (
            <p className="text-gray-500">No analyses yet. Create one to get started!</p>
          ) : (
            <div className="space-y-2">
              {analyses.slice(0, 5).map((analysis) => (
                <Link
                  key={analysis.id}
                  href={`/analysis/${analysis.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {analysis.job.title} - {analysis.job.companyName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600">
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

