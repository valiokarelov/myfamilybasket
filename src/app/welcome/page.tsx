'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function WelcomePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    console.log('Welcome page - Auth state:', { user: !!user, profile: !!profile, loading });
    // Auto-redirect to dashboard after a delay when profile is loaded
    if (!loading && user && profile) {
        console.log('Profile loaded, starting redirect timer...');
        const timer = setTimeout(() => {
        console.log('Redirecting to dashboard...');
        router.push('/dashboard');
        }, 3000);

        return () => clearTimeout(timer);
    }
  }, [user, profile, loading, router]);

  const checkProfile = async () => {
    if (!user) return;
    
    console.log('Checking profile directly in database...');
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
    console.log('Direct DB check:', { data, error });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
          <Link 
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Header */}
          <div className="mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">MB</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to MyFamilyBasket!</h1>
          </div>

          {/* Welcome Message */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Account Created Successfully!
            </h2>
            <p className="text-gray-600 mb-4">
              Your account has been set up and you&apos;re ready to start managing your family budget.
            </p>
            
            {profile && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Name:</strong> {profile.full_name}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Email:</strong> {profile.email}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Role:</strong> {profile.role}
                </p>
              </div>
            )}
          </div>

          {/* Auto-redirect message */}
          <div className="mb-6">
            <div className="flex items-center justify-center mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-gray-600">Redirecting to dashboard in a few seconds...</span>
            </div>
        
          {/* Debug buttons */}
          <div className="space-y-2 mt-4">
              <button 
              onClick={() => {
                  console.log('Current auth state:', { user, profile, loading });
                  refreshProfile();
              }}
              className="text-xs text-blue-600 underline block mx-auto"
              >
              Refresh Profile (Debug)
              </button>
              
              <button 
              onClick={checkProfile}
              className="text-xs text-green-600 underline block mx-auto"
              >
              Check Database (Debug)
              </button>
          </div>
          </div>

          {/* Manual buttons */}
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="w-full inline-flex justify-center items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue to Dashboard
            </Link>
            
            <Link
              href="/income"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Start with Income Tracking
            </Link>
          </div>

          {/* Getting Started Tips */}
          <div className="mt-8 text-left">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Getting Started:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Set up your income sources</li>
              <li>• Add your first expenses</li>
              <li>• Upload receipts for tracking</li>
              <li>• Invite family members to join</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}