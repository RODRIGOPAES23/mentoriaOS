'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('test@example.com')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Try to sign in with email/password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email || 'test@example.com',
        password: password || 'test123456',
      })

      if (signInError) {
        // If user doesn't exist, create account
        const { error: signUpError } = await supabase.auth.signUp({
          email: email || 'test@example.com',
          password: password || 'test123456',
        })

        if (signUpError) {
          setError(signUpError.message)
          setLoading(false)
          return
        }

        // Sign in after signup
        const { error: secondSignInError } = await supabase.auth.signInWithPassword({
          email: email || 'test@example.com',
          password: password || 'test123456',
        })

        if (secondSignInError) {
          setError(secondSignInError.message)
          setLoading(false)
          return
        }
      }

      // Redirect to DOIT
      router.push('/doit')
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-teal-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DOIT Login</h1>
          <p className="text-gray-600">AI Execution Plan Orchestrator</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="test123456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? 'Logging in...' : 'Login & Access DOIT'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Default: test@example.com / test123456
          </p>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-700">
            <strong>Quick Start:</strong> Click login to create a test account and access DOIT immediately.
          </p>
        </div>
      </div>
    </div>
  )
}
