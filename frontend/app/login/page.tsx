'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CrystalElements from '@/components/CrystalElements';
import DarkModeToggle from '@/components/DarkModeToggle';
import api, { API_URL } from '@/lib/api';
import { setAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

// 👇 BACKEND base URL – env ho to woh use karo, warna fallback
const API_BASE = API_URL;

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // username/password login
      const response = await api.post('/api/auth/login', formData);
      setAuth(response.data.token, response.data.user);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crystal-bg min-h-screen flex items-center justify-center px-4">
      <CrystalElements />
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div>
      <div className="glass-strong p-10 rounded-3xl shadow-2xl w-full max-w-md backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 text-glow">
            Welcome Back
          </h1>
          <p className="text-white/80">Sign in to your account</p>
        </div>

        {/* Email/password login */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white/20 hover:bg白/30 text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 backdrop-blur-sm border border-white/20"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-white/20" />
          <span className="px-4 text-white/60 text-sm">OR</span>
          <div className="flex-1 border-t border-white/20" />
        </div>

        {/* Google OAuth Button */}
        <a
          href={`${API_BASE}/api/auth/google`}
          className="w-full glass-strong flex items-center justify-center space-x-3 py-3 rounded-xl hover:bg-white/20 transition-all duration-300"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-white font-semibold">Continue with Google</span>
        </a>

        <p className="mt-6 text-center text-sm text-white/80">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-white font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
