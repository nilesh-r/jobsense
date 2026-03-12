'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'resume' | 'job' | 'analyze'>('resume');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      setIsAuthChecking(false);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.getElementsByClassName('spotlight-card');
      for (const card of cards as any) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [router]);

  // Queries
  const { data: resumes = [], isLoading: resumesLoading } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: async () => {
      const { data } = await api.get('/api/resume');
      return data;
    },
    enabled: !isAuthChecking,
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data } = await api.get('/api/job');
      return data;
    },
    enabled: !isAuthChecking,
  });

  const { data: analyses = [], isLoading: analysesLoading } = useQuery<Analysis[]>({
    queryKey: ['analyses'],
    queryFn: async () => {
      const { data } = await api.get('/api/analysis');
      return data;
    },
    enabled: !isAuthChecking,
  });

  // Mutations
  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      const { data } = await api.post('/api/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Resume uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
    onError: (error: any) => toast.error(error.response?.data?.error || 'Upload failed'),
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: { title: string; companyName: string; jdText: string }) => {
      const response = await api.post('/api/job', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Job description saved!');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setActiveTab('analyze');
    },
    onError: (error: any) => toast.error(error.response?.data?.error || 'Failed to save job'),
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: { resumeId: string; jobId: string }) => {
      const response = await api.post('/api/analysis', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Analysis complete!');
      router.push(`/analysis/${data.id}`);
    },
    onError: (error: any) => toast.error(error.response?.data?.error || 'Analysis failed'),
  });

  if (isAuthChecking) return null;

  return (
    <div className="premium-bg min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12">
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold text-foreground tracking-tight"
          >
            Dashboard
          </motion.h1>
          <p className="text-muted mt-2">Manage your career assets and launch deep scans.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Action Area - 8 columns */}
          <div className="lg:col-span-8 space-y-8">
            {/* Tabs Header */}
            <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-border-premium w-fit">
              {['resume', 'job', 'analyze'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                    activeTab === tab ? 'text-white' : 'text-muted hover:text-foreground'
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-indigo-500 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 capitalize">
                    {tab === 'job' ? 'Description' : tab}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab content wrapper */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {activeTab === 'resume' && (
                  <motion.div
                    key="resume"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="premium-card spotlight-card p-8"
                  >
                    <h2 className="text-xl font-bold text-foreground mb-6">Upload Resume</h2>
                    <label 
                      htmlFor="resume-upload" 
                      className={`group block p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center
                        ${uploadResumeMutation.isPending ? 'border-primary bg-primary/5' : 'border-border-premium hover:border-primary/50 hover:bg-black/5 dark:hover:bg-white/5'}
                      `}
                    >
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadResumeMutation.mutate(file);
                        }}
                        className="hidden"
                        id="resume-upload"
                      />
                      {uploadResumeMutation.isPending ? (
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                          <p className="text-foreground font-medium">Processing...</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 mx-auto mb-4 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className="text-foreground font-semibold">Drop your resume here</p>
                          <p className="text-muted text-sm mt-1">PDF or DOCX preferred (Max 10MB)</p>
                        </>
                      )}
                    </label>

                    <div className="mt-10">
                      <h3 className="text-sm font-bold text-muted uppercase tracking-widest mb-4">Your Recent Files</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resumesLoading ? (
                           [1, 2].map(i => <div key={i} className="h-16 bg-black/5 dark:bg-white/5 rounded-xl animate-pulse" />)
                        ) : resumes.length === 0 ? (
                           <p className="text-muted text-sm italic">No files uploaded yet.</p>
                        ) : resumes.map(r => (
                          <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border-premium hover:border-muted transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-foreground text-sm font-medium truncate">{r.originalFileName}</span>
                            </div>
                            <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'job' && (
                  <motion.div
                    key="job"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="premium-card spotlight-card p-8"
                  >
                    <h2 className="text-xl font-bold text-foreground mb-6">Target Profiling</h2>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      createJobMutation.mutate({
                        title: fd.get('title') as string,
                        companyName: fd.get('companyName') as string,
                        jdText: fd.get('jdText') as string,
                      });
                    }} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted uppercase ml-1">Job Title</label>
                          <input name="title" required placeholder="e.g. Lead Designer" className="w-full bg-body border border-border-premium rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted uppercase ml-1">Company</label>
                          <input name="companyName" required placeholder="e.g. OpenAI" className="w-full bg-body border border-border-premium rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted uppercase ml-1">Job Description</label>
                        <textarea name="jdText" required rows={6} placeholder="Paste requirements..." className="w-full bg-body border border-border-premium rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
                      </div>
                      <button 
                        type="submit" 
                        disabled={createJobMutation.isPending}
                        className="btn-primary w-full md:w-auto"
                      >
                        {createJobMutation.isPending ? 'Saving...' : 'Save Profile'}
                      </button>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'analyze' && (
                  <motion.div
                    key="analyze"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="premium-card spotlight-card p-8"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-xl font-bold text-foreground">Compare & Analyze</h2>
                      <div className="px-3 py-1 bg-primary/10 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest">AI Core v3.0</div>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      analyzeMutation.mutate({
                        resumeId: fd.get('resumeId') as string,
                        jobId: fd.get('jobId') as string,
                      });
                    }} className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="text-xs font-bold text-muted uppercase tracking-widest">Primary Source</div>
                          <select name="resumeId" required className="w-full bg-body border border-border-premium rounded-2xl px-5 py-4 text-foreground focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer shadow-xl transition-all">
                            <option value="">-- Choose Resume --</option>
                            {resumes.map(r => <option key={r.id} value={r.id}>{r.originalFileName}</option>)}
                          </select>
                        </div>
                        <div className="space-y-4">
                          <div className="text-xs font-bold text-muted uppercase tracking-widest">Target Context</div>
                          <select name="jobId" required className="w-full bg-body border border-border-premium rounded-2xl px-5 py-4 text-foreground focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer shadow-xl transition-all">
                            <option value="">-- Choose Job --</option>
                            {jobs.map(j => <option key={j.id} value={j.id}>{j.title} at {j.companyName}</option>)}
                          </select>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={analyzeMutation.isPending}
                        className="btn-primary w-full text-lg py-5 shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3 group"
                      >
                        {analyzeMutation.isPending ? (
                          <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span className="group-hover:translate-x-1 transition-transform">🚀</span>
                            Initialize Advanced Scan
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar - 4 columns (Bento Style) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="premium-card spotlight-card p-6">
              <h3 className="text-lg font-bold text-foreground mb-6">Recent Scans</h3>
              {analysesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse" />)}
                </div>
              ) : analyses.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-muted">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-muted text-sm">No analysis history found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analyses.slice(0, 5).map((a) => (
                    <Link
                      key={a.id}
                      href={`/analysis/${a.id}`}
                      className="block p-4 rounded-2xl bg-surface border border-border-premium hover:border-primary/30 hover:scale-[1.02] transition-all group"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-foreground font-bold truncate group-hover:text-primary transition-colors">{a.job.title}</p>
                          <p className="text-muted text-xs mt-1 truncate">{a.job.companyName}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className={`text-xl font-black ${a.atsScore > 75 ? 'text-emerald-400' : a.atsScore > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {a.atsScore}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {analyses.length > 5 && (
                    <Link href="/analytics" className="block text-center text-sm font-bold text-indigo-400 hover:text-indigo-300 py-2 transition-colors">
                      View All Reports →
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="premium-card spotlight-card p-6 bg-primary/10 border-primary/20 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-foreground font-bold mb-2">Pro Optimization</h3>
              <p className="text-primary/70 text-sm leading-relaxed mb-6">Unlock deep keyword mapping and real-time resume re-writing with Pro.</p>
              <button className="w-full py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-primary-hover transition-colors">Upgrade Now</button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
