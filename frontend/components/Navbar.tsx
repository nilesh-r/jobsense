'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUser, clearAuth } from '@/lib/auth';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  return (
    <nav className="glass-strong sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-2xl font-bold gradient-text">
            JobSense AI
          </Link>
          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            {mounted && user && (
              <>
                <div className="relative">
                  {/* Main Menu Button */}
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="glass-strong w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300"
                    aria-label="Toggle menu"
                  >
                    <svg
                      className={`w-6 h-6 text-white transition-transform duration-300 ${isMenuOpen ? 'rotate-45' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsMenuOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-64 glass-strong rounded-2xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-2">
                          <Link
                            href="/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-3 p-3 glass rounded-xl hover:bg-white/10 transition-all mb-2"
                          >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="text-white font-medium">Dashboard</span>
                          </Link>

                          <Link
                            href="/analytics"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-3 p-3 glass rounded-xl hover:bg-white/10 transition-all mb-2"
                          >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="text-white font-medium">Analytics</span>
                          </Link>

                          <Link
                            href="/settings"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-3 p-3 glass rounded-xl hover:bg-white/10 transition-all mb-2"
                          >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-white font-medium">Settings</span>
                          </Link>

                          <a
                            href="https://github.com/nilesh-r/jobsense"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-3 p-3 glass rounded-xl hover:bg-white/10 transition-all mb-2"
                          >
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            <span className="text-white font-medium">GitHub</span>
                          </a>

                          <div className="border-t border-white/10 my-2"></div>

                          <div className="flex items-center space-x-3 p-3 mb-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <span className="text-white text-sm font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-white/90 font-medium">{user.name}</span>
                          </div>

                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center space-x-3 p-3 glass rounded-xl hover:bg-red-500/20 transition-all text-red-400"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="font-medium">Logout</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
