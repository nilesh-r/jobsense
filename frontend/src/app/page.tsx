import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';

export default function Home() {
  const authenticated = isAuthenticated();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            JobSense AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Smart Job Matcher & ATS Analyzer
          </p>
          <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
            Upload your resume, paste a job description, and get instant AI-powered 
            ATS scoring, keyword gap analysis, and personalized improvement suggestions.
          </p>
          
          {authenticated ? (
            <Link
              href="/dashboard"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="space-x-4">
              <Link
                href="/login"
                className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">ATS Scoring</h3>
            <p className="text-gray-600">
              Get a comprehensive ATS compatibility score with detailed breakdowns
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Gap Analysis</h3>
            <p className="text-gray-600">
              Identify missing keywords and skills to improve your resume
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">AI Suggestions</h3>
            <p className="text-gray-600">
              Receive personalized recommendations to optimize your resume
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

