'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CrystalElements from '@/components/CrystalElements';
import { isAuthenticated } from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Analysis {
  id: string;
  atsScore: number;
  keywordMatchScore: number;
  skillsMatchScore: number;
  experienceMatchScore: number;
  embeddingSimilarity: number | null;
  missingKeywords: string[];
  partialMatchKeywords: string[];
  suggestions: string[];
  createdAt: string;
  resume: {
    id: string;
    originalFileName: string;
    parsedText: string;
  };
  job: {
    id: string;
    title: string;
    companyName: string;
    jdText: string;
  };
}

export default function AnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchAnalysis();
  }, [params.id]);

  const fetchAnalysis = async () => {
    try {
      const response = await api.get(`/api/analysis/${params.id}`);
      setAnalysis(response.data);
    } catch (error) {
      toast.error('Failed to load analysis');
      router.push('/dashboard');
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

  if (!analysis) {
    return null;
  }

  return (
    <div className="crystal-bg min-h-screen">
      <CrystalElements />
      <Navbar />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="glass text-white px-6 py-2 rounded-xl hover:bg-white/20 transition-all font-medium"
          >
            ← Back
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Left: Resume & Job Info */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl">
              <h2 className="text-xl font-semibold mb-4 text-white">Resume</h2>
              <p className="text-sm text-white/80 mb-3 font-medium">
                {analysis.resume.originalFileName}
              </p>
              <div className="max-h-64 overflow-y-auto p-4 glass rounded-xl text-sm text-white/90">
                {analysis.resume.parsedText?.substring(0, 500)}...
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl">
              <h2 className="text-xl font-semibold mb-4 text-white">Job Description</h2>
              <p className="font-medium mb-3 text-white">
                {analysis.job.title} - {analysis.job.companyName}
              </p>
              <div className="max-h-64 overflow-y-auto p-4 glass rounded-xl text-sm text-white/90">
                {analysis.job.jdText.substring(0, 500)}...
              </div>
            </div>
          </div>

          {/* Right: Score & Analysis */}
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="glass-card p-8 rounded-3xl text-center">
              <h2 className="text-lg font-semibold mb-4 text-white">ATS Score</h2>
              <div className="text-7xl font-bold gradient-text mb-4">
                {analysis.atsScore}%
              </div>
              <div className="w-full glass rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${analysis.atsScore}%` }}
                />
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="glass-card p-6 rounded-3xl">
              <h2 className="text-xl font-semibold mb-6 text-white">Score Breakdown</h2>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/90">Keywords</span>
                    <span className="font-semibold text-white">{analysis.keywordMatchScore}%</span>
                  </div>
                  <div className="w-full glass rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${analysis.keywordMatchScore}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/90">Skills</span>
                    <span className="font-semibold text-white">{analysis.skillsMatchScore}%</span>
                  </div>
                  <div className="w-full glass rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${analysis.skillsMatchScore}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/90">Experience</span>
                    <span className="font-semibold text-white">{analysis.experienceMatchScore}%</span>
                  </div>
                  <div className="w-full glass rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${analysis.experienceMatchScore}%` }}
                    />
                  </div>
                </div>
                {analysis.embeddingSimilarity && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white/90">Semantic Similarity</span>
                      <span className="font-semibold text-white">
                        {Math.round(analysis.embeddingSimilarity * 100)}%
                      </span>
                    </div>
                    <div className="w-full glass rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${analysis.embeddingSimilarity * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Missing Keywords */}
        {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
          <div className="glass-card p-6 rounded-3xl mb-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Missing Keywords</h2>
            <div className="flex flex-wrap gap-3">
              {analysis.missingKeywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="bg-red-500/20 text-red-200 px-4 py-2 rounded-full text-sm font-medium border border-red-400/30"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Partial Matches */}
        {analysis.partialMatchKeywords && analysis.partialMatchKeywords.length > 0 && (
          <div className="glass-card p-6 rounded-3xl mb-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Partial Matches</h2>
            <div className="flex flex-wrap gap-3">
              {analysis.partialMatchKeywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="bg-yellow-500/20 text-yellow-200 px-4 py-2 rounded-full text-sm font-medium border border-yellow-400/30"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {analysis.suggestions && analysis.suggestions.length > 0 && (
          <div className="glass-card p-6 rounded-3xl">
            <h2 className="text-xl font-semibold mb-6 text-white">Improvement Suggestions</h2>
            <ul className="space-y-4">
              {analysis.suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start glass p-4 rounded-xl">
                  <span className="text-indigo-300 mr-3 text-xl">✨</span>
                  <span className="text-white/90 leading-relaxed">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
