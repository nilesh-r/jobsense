'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuth } from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Authentication failed');
      router.push('/login');
      return;
    }

    if (token) {
      // Get user info with the token
      api
        .get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setAuth(token, response.data.user);
          toast.success('Login successful!');
          router.push('/dashboard');
        })
        .catch(() => {
          toast.error('Failed to authenticate');
          router.push('/login');
        });
    } else {
      router.push('/login');
    }
  }, [searchParams, router]);

  return (
    <div className="crystal-bg min-h-screen flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
}

