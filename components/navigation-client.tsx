'use client'

import { useAuth } from '@/components/auth-provider'
import { UserNav } from './user-nav'
import { AuthLoading } from './auth-loading'
import { BookOpen, Search, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function NavigationClient() {
  const { user, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-zinc-200 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <BookOpen className="h-8 w-8 text-zinc-900 group-hover:text-zinc-700 transition-colors duration-200" />
            <span className="text-xl font-bold text-zinc-900 group-hover:text-zinc-700 transition-colors duration-200">
              Volume
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/search" 
              className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-zinc-50"
            >
              <Search className="h-4 w-4" />
              Search Books
            </Link>
            {user && (
              <Link 
                href="/profile" 
                className="text-zinc-600 hover:text-zinc-900 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-zinc-50"
              >
                Profile
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <AuthLoading />
            ) : user ? (
              <UserNav user={user} />
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/login"
                  className="text-zinc-600 hover:text-zinc-900 transition-all duration-200 font-medium px-4 py-2 rounded-lg hover:bg-zinc-50"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup"
                  className="bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-all duration-200 font-medium transform hover:scale-105 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <div className="py-4 space-y-2 border-t border-zinc-200">
            <Link 
              href="/search" 
              className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-zinc-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className="h-4 w-4" />
              Search Books
            </Link>
            {user && (
              <Link 
                href="/profile" 
                className="block text-zinc-600 hover:text-zinc-900 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-zinc-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
            )}
            
            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-zinc-200">
              {loading ? (
                <div className="px-3 py-2">
                  <AuthLoading />
                </div>
              ) : user ? (
                <div className="px-3 py-2">
                  <UserNav user={user} />
                </div>
              ) : (
                <div className="space-y-2">
                  <Link 
                    href="/login"
                    className="block text-center text-zinc-600 hover:text-zinc-900 transition-all duration-200 font-medium px-4 py-2 rounded-lg hover:bg-zinc-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup"
                    className="block text-center bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-all duration-200 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}