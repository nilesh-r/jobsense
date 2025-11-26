'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AIChat from '@/components/AIChat';
import CrystalElements from '@/components/CrystalElements';
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
    fetchAnalytics();
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
      <div className="crystal-bg min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="crystal-bg min-h-screen pb-32">
      <CrystalElements />
      <Navbar />
      <AIChat />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-white text-glow">Analytics Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-8 rounded-3xl text-center">
            <h3 className="text-lg font-semibold text-white/80 mb-3">Average ATS Score</h3>
            <p className="text-5xl font-bold gradient-text">{analytics.avgScore}%</p>
          </div>
          <div className="glass-card p-8 rounded-3xl text-center">
            <h3 className="text-lg font-semibold text-white/80 mb-3">Total Analyses</h3>
            <p className="text-5xl font-bold gradient-text">{analytics.totalAnalyses}</p>
          </div>
          <div className="glass-card p-8 rounded-3xl text-center">
            <h3 className="text-lg font-semibold text-white/80 mb-3">Job Roles Analyzed</h3>
            <p className="text-5xl font-bold gradient-text">{analytics.topRoles.length}</p>
          </div>
        </div>

        {/* Score Trend Chart */}
        {analytics.scoreTrend.length > 0 && (
          <div className="glass-card p-8 rounded-3xl mb-6">
            <h2 className="text-2xl font-semibold mb-6 text-white">Score Trend Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  stroke="rgba(255,255,255,0.7)"
                />
                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.7)" />
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
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Roles */}
        {analytics.topRoles.length > 0 && (
          <div className="glass-card p-8 rounded-3xl mb-6">
            <h2 className="text-2xl font-semibold mb-6 text-white">Most Analyzed Job Roles</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topRoles}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="title" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  stroke="rgba(255,255,255,0.7)"
                />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '10px',
                    color: 'white'
                  }}
                />
                <Legend wrapperStyle={{ color: 'white' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Common Missing Keywords */}
        {analytics.commonMissingKeywords.length > 0 && (
          <div className="glass-card p-8 rounded-3xl">
            <h2 className="text-2xl font-semibold mb-6 text-white">Most Common Missing Keywords</h2>
            <div className="space-y-3">
              {analytics.commonMissingKeywords.map((item, idx) => (
                <div key={idx} className="glass p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition-all">
                  <span className="font-medium text-white text-lg">{item.keyword}</span>
                  <span className="text-indigo-300 font-semibold">Missing in {item.count} analyses</span>
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
