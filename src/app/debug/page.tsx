// app/debug/page.tsx
'use client';

import { useAuth } from '../../contexts/AuthProvider';
import { debugFixUserAccount } from '../../utils/fixMissingProfiles';
import { useState } from 'react';

export default function DebugPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [isFixing, setIsFixing] = useState(false);

  const handleFixAccount = async () => {
    setIsFixing(true);
    try {
      await debugFixUserAccount();
      await refreshProfile();
    } catch (error) {
      console.error('Failed to fix account:', error);
    } finally {
      setIsFixing(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">User Status</h2>
          <p><strong>Authenticated:</strong> {user ? 'Yes' : 'No'}</p>
          {user && (
            <>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </>
          )}
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Profile Status</h2>
          <p><strong>Profile Exists:</strong> {profile ? 'Yes' : 'No'}</p>
          {profile && (
            <>
              <p><strong>Profile ID:</strong> {profile.id}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Household ID:</strong> {profile.household_id}</p>
            </>
          )}
        </div>

        {user && !profile && (
          <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
            <h2 className="text-lg font-semibold mb-2 text-red-700">Profile Missing!</h2>
            <p className="text-red-600 mb-4">
              Your user account exists but is missing the corresponding profile record.
            </p>
            <button
              onClick={handleFixAccount}
              disabled={isFixing}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isFixing ? 'Fixing Account...' : 'Fix Account'}
            </button>
          </div>
        )}

        {user && profile && (
          <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
            <h2 className="text-lg font-semibold mb-2 text-green-700">Account OK!</h2>
            <p className="text-green-600">
              Your account is properly set up. You should be able to access all features.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}