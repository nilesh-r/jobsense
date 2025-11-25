'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CrystalElements from '@/components/CrystalElements';
import DarkModeToggle from '@/components/DarkModeToggle';
import api from '@/lib/api';
import { setAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

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
      const response = await api.post('/api/auth/login', formData);
      setAuth(response.data.token, response.data.user);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 backdrop-blur-sm border border-white/20"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-white/80">
          Don't have an account?{' '}
          <Link href="/register" className="text-white font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
