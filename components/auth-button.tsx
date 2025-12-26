'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AuthButton() {
  const pathname = usePathname()
  const loginUrl = `/login${pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : ''}`

  return (
    <div className="space-y-4">
      <p className="text-zinc-600 text-center">
        Join Volume to write reviews and discover new books
      </p>
      <div className="space-y-2">
        <Link 
          href={loginUrl}
          className="block w-full bg-zinc-900 text-white px-6 py-2 rounded-md hover:bg-zinc-800 transition-colors duration-200 text-center font-medium"
        >
          Sign In
        </Link>
        <Link 
          href="/signup"
          className="block w-full border border-zinc-300 text-zinc-900 px-6 py-2 rounded-md hover:bg-zinc-50 transition-colors duration-200 text-center font-medium"
        >
          Sign Up
        </Link>
      </div>
    </div>
  )
}