'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Processing...')
  const [details, setDetails] = useState<string[]>([])

  const addDetail = (detail: string) => {
    setDetails(prev => [...prev, detail])
    console.log(detail)
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        addDetail(`Code present: ${!!code}`)
        
        if (!code) {
          setStatus('No confirmation code found')
          setTimeout(() => router.push('/login'), 2000)
          return
        }

        setStatus('Confirming your account...')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        addDetail(`Exchange result: success=${!!data.session}, error=${!!error}`)
        if (error) {
          addDetail(`Exchange error: ${error.message}`)
        }
        
        if (error || !data.session?.user) {
          setStatus('Failed to confirm account')
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        const user = data.session.user
        addDetail(`User ID: ${user.id}`)
        addDetail(`User email: ${user.email}`)
        
        setStatus('Checking your profile...')

        // Check if user profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        addDetail(`Profile check: found=${!!existingProfile}, error=${!!profileError}`)
        
        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows found
          addDetail(`Profile check error: ${profileError.message}`)
        }

        if (!existingProfile) {
          setStatus('Setting up your account...')
          addDetail('Creating household...')
          
          // Create household first
          const householdName = `${user.email?.split('@')[0]}'s Household`
          const { data: household, error: householdError } = await supabase
            .from('households')
            .insert({
              name: householdName
            })
            .select()
            .single()

          addDetail(`Household creation: success=${!!household}, error=${!!householdError}`)
          if (householdError) {
            addDetail(`Household error: ${householdError.message}`)
            setStatus('Account setup failed - household creation error')
            return
          }

          addDetail(`Created household ID: ${household.id}`)
          addDetail('Creating user profile...')

          // Create user profile
          const profileData = {
            id: user.id,
            household_id: household.id,
            full_name: user.email?.split('@')[0] || 'User',
            role: 'admin'
          }
          
          const { data: newProfile, error: newProfileError } = await supabase
            .from('user_profiles')
            .insert(profileData)
            .select()
            .single()

          addDetail(`Profile creation: success=${!!newProfile}, error=${!!newProfileError}`)
          if (newProfileError) {
            addDetail(`Profile error: ${newProfileError.message}`)
            setStatus('Account setup failed - profile creation error')
            return
          }
        }

        setStatus('Success! Redirecting to dashboard...')
        addDetail('Setup complete, redirecting...')
        setTimeout(() => router.push('/dashboard'), 2000)
        
      } catch (err) {
        console.error('Callback error:', err)
        addDetail(`Unexpected error: ${err}`)
        setStatus('Something went wrong. Please try again.')
        setTimeout(() => router.push('/login'), 5000)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-800 font-medium">{status}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Info:</h3>
          <div className="space-y-1 text-xs text-gray-600 max-h-40 overflow-y-auto">
            {details.map((detail, index) => (
              <div key={index}>{detail}</div>
            ))}
          </div>
        </div>
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