import { ForgotPasswordForm } from '@/components/forgot-password-form'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
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
        </div>

        {/* Forgot Password Form */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}