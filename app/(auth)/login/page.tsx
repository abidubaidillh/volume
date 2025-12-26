import { LoginForm } from '@/components/login-form'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <BookOpen className="h-10 w-10 text-zinc-900 mr-3" />
            <span className="text-4xl font-bold text-zinc-900 tracking-tight">
              Volume
            </span>
          </Link>
          <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
            Welcome back
          </h1>
          <p className="text-zinc-600">
            Sign in to your account to continue reading and reviewing
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-zinc-500">
            Don't have an account?{' '}
            <Link 
              href="/signup"
              className="text-zinc-900 hover:text-zinc-700 font-medium transition-colors duration-200"
            >
              Sign up
            </Link>
          </p>
          <Link 
            href="/"
            className="block text-zinc-500 hover:text-zinc-700 transition-colors duration-200"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}