'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';
import DarkModeToggle from '@/components/DarkModeToggle';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setAuthenticated(isAuthenticated());

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const cards = containerRef.current.getElementsByClassName('spotlight-card');
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
  }, []);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="premium-bg animated-bg relative overflow-hidden selection:bg-indigo-500/30">
      <div className="fixed top-6 right-6 z-50">
        <DarkModeToggle />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-24 md:pt-48 md:pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              AI Core v3.0 Powered
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-foreground leading-[0.9]">
              JobSense <span className="text-primary text-glow">AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted mb-12 font-medium leading-relaxed max-w-xl text-reveal">
              The professional edge for your career. AI-powered ATS scoring, 
              keyword gap analysis, and personalized resume optimization.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {authenticated ? (
                <Link
                  href="/dashboard"
                  className="btn-primary text-lg px-12 py-4 w-full sm:w-auto text-center"
                >
                  Enter Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="btn-primary text-lg px-12 py-4 shadow-primary/20 w-full sm:w-auto text-center"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/register"
                    className="px-12 py-4 rounded-xl text-lg font-semibold border border-premium hover:bg-foreground/5 transition-all text-foreground w-full sm:w-auto text-center"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          {/* Hero Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full animate-pulse" />
            <div className="relative premium-card p-2 overflow-hidden aspect-square flex items-center justify-center border-indigo-500/30">
              <Image 
                src="/images/hero_ai.png" 
                alt="AI Neural Network" 
                width={800} 
                height={800}
                className="rounded-2xl object-cover hover:scale-105 transition-transform duration-1000"
                priority
              />
            </div>
          </motion.div>
        </div>

        <div className="mt-48 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { 
              title: 'ATS Scoring', 
              desc: 'Deep semantic analysis to ensure your resume passes any modern Applicant Tracking System.',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            },
            { 
              title: 'Gap Analysis', 
              desc: 'Pinpoint exactly which keywords and skills are missing compared to high-performing candidates.',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            },
            { 
              title: 'AI Optimization', 
              desc: 'Tailored improvement suggestions generated by world-class AI models specifically for your profile.',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.6 }}
              className="premium-card spotlight-card p-10 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl mb-8 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {feature.icon}
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-muted leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

