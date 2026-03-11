'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { isAuthenticated } from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Analytics {
  avgScore: number;
  totalAnalyses: number;
  topRoles: Array<{ title: string; count: number }>;
  commonMissingKeywords: Array<{ keyword: string; count: number }>;
  scoreTrend: Array<{ date: string; score: number; jobTitle: string }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
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
    fetchAnalytics();
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/analytics/summary');
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="premium-bg min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-foreground font-medium animate-pulse">Gathering Insights...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="premium-bg min-h-screen pb-32">
      <Navbar />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-foreground text-glow">Analytics Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="premium-card spotlight-card p-8 rounded-3xl text-center">
            <h3 className="text-lg font-semibold text-muted mb-3">Average ATS Score</h3>
            <p className="text-5xl font-bold gradient-text">{analytics.avgScore}%</p>
          </div>
          <div className="premium-card spotlight-card p-8 rounded-3xl text-center">
            <h3 className="text-lg font-semibold text-muted mb-3">Total Analyses</h3>
            <p className="text-5xl font-bold gradient-text">{analytics.totalAnalyses}</p>
          </div>
          <div className="premium-card spotlight-card p-8 rounded-3xl text-center">
            <h3 className="text-lg font-semibold text-muted mb-3">Job Roles Analyzed</h3>
            <p className="text-5xl font-bold gradient-text">{analytics.topRoles.length}</p>
          </div>
        </div>

        {/* Score Trend Chart */}
        {analytics.scoreTrend.length > 0 && (
          <div className="premium-card spotlight-card p-8 rounded-3xl mb-6">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Score Trend Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  stroke="var(--muted)"
                />
                <YAxis domain={[0, 100]} stroke="var(--muted)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '10px',
                    color: 'white'
                  }}
                />
                <Legend wrapperStyle={{ color: 'white' }} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Roles */}
        {analytics.topRoles.length > 0 && (
          <div className="premium-card spotlight-card p-8 rounded-3xl mb-6">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Most Analyzed Job Roles</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topRoles}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="title" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  stroke="var(--muted)"
                />
                <YAxis stroke="var(--muted)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)', 
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--foreground)'
                  }}
                />
                <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Common Missing Keywords */}
        {analytics.commonMissingKeywords.length > 0 && (
          <div className="premium-card spotlight-card p-8 rounded-3xl">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Most Common Missing Keywords</h2>
            <div className="space-y-3">
              {analytics.commonMissingKeywords.map((item, idx) => (
                <div key={idx} className="glass p-4 rounded-xl flex items-center justify-between hover:bg-foreground/5 transition-all">
                  <span className="font-medium text-foreground text-lg">{item.keyword}</span>
                  <span className="text-primary font-semibold">Missing in {item.count} analyses</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
