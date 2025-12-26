'use client'

import { useAuth } from '@/lib/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export default function TestAuthPage() {
  const { user, session, loading } = useAuth()
  const [testResult, setTestResult] = useState('')

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      if (error) {
        setTestResult(`Database Error: ${error.message}`)
      } else {
        setTestResult('Database connection successful!')
      }
    } catch (error: any) {
      setTestResult(`Connection Error: ${error.message}`)
    }
  }

  const testAuth = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        setTestResult(`Auth Error: ${error.message}`)
      } else {
        setTestResult(`Auth working! User: ${data.session?.user?.email || 'Not logged in'}`)
      }
    } catch (error: any) {
      setTestResult(`Auth Connection Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Auth State</h2>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
            <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={testConnection}
              className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
            >
              Test Database Connection
            </button>
            <button
              onClick={testAuth}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Test Auth
            </button>
          </div>

          {testResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <strong>Test Result:</strong> {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}