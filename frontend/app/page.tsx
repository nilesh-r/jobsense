'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';
import CrystalElements from '@/components/CrystalElements';
import DarkModeToggle from '@/components/DarkModeToggle';

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAuthenticated(isAuthenticated());
  }, []);

  return (
    <div className="crystal-bg relative">
      <CrystalElements />
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div>
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-glow">
            JobSense <span className="gradient-text bg-white">AI</span>
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 mb-4 font-light">
            Smart Job Matcher & ATS Analyzer
          </p>
          <p className="text-lg md:text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Upload your resume, paste a job description, and get instant AI-powered 
            ATS scoring, keyword gap analysis, and personalized improvement suggestions.
          </p>
          
          {mounted && authenticated ? (
            <Link
              href="/dashboard"
              className="inline-block glass-strong text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:scale-105 transition-all duration-300 glow-hover"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <div className="space-x-4">
              <Link
                href="/login"
                className="inline-block glass-strong text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:scale-105 transition-all duration-300 glow-hover"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-block glass text-white px-10 py-4 rounded-2xl text-lg font-semibold border-2 border-white/30 hover:scale-105 transition-all duration-300"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="glass-card p-8 rounded-3xl float-animation">
            <div className="w-16 h-16 bg-white/20 rounded-2xl mb-6 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">ATS Scoring</h3>
            <p className="text-white/80 leading-relaxed">
              Get a comprehensive ATS compatibility score with detailed breakdowns and insights
            </p>
          </div>
          
          <div className="glass-card p-8 rounded-3xl float-animation-delayed">
            <div className="w-16 h-16 bg-white/20 rounded-2xl mb-6 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Gap Analysis</h3>
            <p className="text-white/80 leading-relaxed">
              Identify missing keywords and skills to improve your resume's effectiveness
            </p>
          </div>
          
          <div className="glass-card p-8 rounded-3xl float-animation-delayed-2">
            <div className="w-16 h-16 bg-white/20 rounded-2xl mb-6 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">AI Suggestions</h3>
            <p className="text-white/80 leading-relaxed">
              Receive personalized recommendations powered by AI to optimize your resume
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="glass-strong p-12 rounded-3xl text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Why Choose JobSense AI?</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/90">AI-powered semantic matching for accurate scoring</p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/90">Real-time keyword gap analysis</p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/90">Comprehensive analytics dashboard</p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/90">Track your progress over time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
