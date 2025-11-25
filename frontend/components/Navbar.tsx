'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUser, clearAuth } from '@/lib/auth';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const router = useRouter();
  const user = getUser();

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
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="text-white/90 hover:text-white transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/analytics"
                  className="text-white/90 hover:text-white transition-colors font-medium"
                >
                  Analytics
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white/90 font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="glass text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
