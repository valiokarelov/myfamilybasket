'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Processing...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        
        if (!code) {
          setStatus('No confirmation code found')
          setTimeout(() => router.push('/login'), 2000)
          return
        }

        setStatus('Confirming your account...')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error || !data.session?.user) {
          setStatus('Failed to confirm account')
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        const user = data.session.user
        setStatus('Checking your profile...')

        // Check if user profile exists
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!existingProfile) {
          setStatus('Setting up your account...')
          
          // Create household first
          const { data: household, error: householdError } = await supabase
            .from('households')
            .insert({
              name: `${user.email?.split('@')[0]}'s Household`
            })
            .select()
            .single()

          if (householdError) {
            console.error('Household creation failed:', householdError)
            setStatus('Account setup failed. Please contact support.')
            return
          }

          // Create user profile
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: user.id,
              household_id: household.id,
              full_name: user.email?.split('@')[0] || 'User',
              role: 'admin'
            })

          if (profileError) {
            console.error('Profile creation failed:', profileError)
            setStatus('Account setup failed. Please contact support.')
            return
          }
        }

        setStatus('Success! Redirecting to dashboard...')
        router.push('/dashboard')
        
      } catch (err) {
        console.error('Callback error:', err)
        setStatus('Something went wrong. Please try again.')
        setTimeout(() => router.push('/login'), 3000)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}