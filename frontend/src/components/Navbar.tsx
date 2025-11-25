'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUser, clearAuth } from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
            JobSense AI
          </Link>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Dashboard
                </Link>
                <Link
                  href="/analytics"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Analytics
                </Link>
                <span className="text-gray-600">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
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

