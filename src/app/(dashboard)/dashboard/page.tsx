'use client'

import { useAuth } from '@/components/providers/AuthProvider'

export default function DashboardPage() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to MyFamilyBasket!
        </h1>
        {profile && (
          <p className="text-lg text-gray-600">
            Hello, {profile.full_name}! You&apos;re ready to start managing your household budget.
          </p>
        )}
      </div>
    </div>
  )
}