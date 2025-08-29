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

  // Move useEffect here - BEFORE any conditional returns
  useEffect(() => {
    console.log('Welcome page - Auth state:', { user: !!user, profile: !!profile, loading });
    
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

  // Force show debug info - TEMPORARY
  console.log('Welcome page render - Auth state:', { 
    user: !!user, 
    profile: !!profile, 
    loading,
    userEmail: user?.email 
  });

  // Show debug buttons even during loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
          
          {/* DEBUG BUTTONS IN LOADING STATE */}
          <div className="mt-8 space-y-2">
            <button 
              onClick={() => {
                console.log('LOADING STATE - Current auth state:', { user, profile, loading });
                if (refreshProfile) refreshProfile();
              }}
              className="block mx-auto px-4 py-2 bg-red-600 text-white rounded text-sm"
            >
              DEBUG: Refresh Profile (Loading State)
            </button>
            
            <button 
              onClick={async () => {
                if (!user) {
                  console.log('No user in loading state');
                  return;
                }
                console.log('LOADING STATE - Checking profile directly...');
                const { data, error } = await supabase
                  .from('user_profiles')
                  .select('*')
                  .eq('id', user.id)
                  .single();
                console.log('LOADING STATE - Direct DB check:', { data, error });
              }}
              className="block mx-auto px-4 py-2 bg-orange-600 text-white rounded text-sm"
            >
              DEBUG: Check Database (Loading State)
            </button>
          </div>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome to MyFamilyBasket!</h1>
          
          <p className="text-gray-600 mb-6">Account Created Successfully!</p>
          
          {profile && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p><strong>Name:</strong> {profile.full_name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Role:</strong> {profile.role}</p>
            </div>
          )}

          {/* Debug buttons - Always visible */}
          <div className="space-y-2 mb-6">
            <button 
              onClick={() => {
                console.log('Current auth state:', { user, profile, loading });
                refreshProfile();
              }}
              className="block mx-auto px-4 py-2 bg-blue-600 text-white rounded text-sm"
            >
              Refresh Profile (Debug)
            </button>
            
            <button 
              onClick={checkProfile}
              className="block mx-auto px-4 py-2 bg-green-600 text-white rounded text-sm"
            >
              Check Database (Debug)
            </button>
          </div>

          {/* Manual buttons */}
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Continue to Dashboard
            </Link>
            
            <Link
              href="/income"
              className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded"
            >
              Start with Income Tracking
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}