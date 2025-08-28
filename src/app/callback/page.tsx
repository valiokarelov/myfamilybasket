'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        
        if (!code) {
          setStatus('No authentication code found')
          setTimeout(() => router.push('/login'), 2000)
          return
        }

        setStatus('Confirming your email...')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
          console.error('Auth error:', error)
          setStatus('Authentication failed')
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        if (!data.session?.user) {
          setStatus('No user session created')
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        // Check if profile exists
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single()

        if (!profile) {
          setStatus('Setting up your account...')
          
          // Create household
          const { data: household, error: householdError } = await supabase
            .from('households')
            .insert({
              name: `${data.session.user.email?.split('@')[0] || 'User'}'s Household`
            })
            .select()
            .single()

          if (householdError) {
            console.error('Household creation failed:', householdError)
            setStatus('Setup failed')
            return
          }

          // Create profile
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.session.user.id,
              household_id: household.id,
              full_name: data.session.user.email?.split('@')[0] || 'User',
              role: 'admin'
            })

          if (profileError) {
            console.error('Profile creation failed:', profileError)
            setStatus('Profile setup failed')
            return
          }
        }

        setStatus('Success! Redirecting to dashboard...')
        router.push('/dashboard')

      } catch (error) {
        console.error('Callback error:', error)
        setStatus('An error occurred')
        setTimeout(() => router.push('/login'), 3000)
      }
    }

    handleCallback()
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

export default function CallbackPage() {
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