'use client'

import { SearchBar } from './ui/search-bar'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center mb-8">
          <BookOpen className="h-12 w-12 text-zinc-900 mr-3" />
          <h1 className="text-6xl font-bold text-zinc-900 tracking-tight">
            Volume
          </h1>
        </div>
        
        {/* Tagline */}
        <p className="text-xl text-zinc-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Discover your next great read. Share reviews, explore recommendations, 
          and connect with fellow book lovers.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar 
            placeholder="Search for books by title, author, or ISBN..."
            className="w-full"
          />
        </div>
        
        {/* Popular searches */}
        <div className="flex flex-wrap justify-center gap-3 text-sm mb-12">
          <span className="text-zinc-500">Popular:</span>
          {['Fiction', 'Science Fiction', 'Biography', 'Self-Help', 'History'].map((genre) => (
            <Link
              key={genre}
              href={`/search?q=${encodeURIComponent(genre)}`}
              className="text-zinc-700 hover:text-zinc-900 underline underline-offset-2 hover:no-underline transition-all duration-200"
            >
              {genre}
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-8 max-w-md mx-auto">
          <h3 className="text-xl font-semibold text-zinc-900 mb-2">
            Join Volume Today
          </h3>
          <p className="text-zinc-600 mb-6">
            Create an account to write reviews and discover new books
          </p>
          <div className="space-y-3">
            <Link 
              href="/signup"
              className="block w-full bg-zinc-900 text-white px-6 py-3 rounded-lg hover:bg-zinc-800 transition-colors duration-200 text-center font-medium"
            >
              Sign Up Free
            </Link>
            <Link 
              href="/login"
              className="block w-full border border-zinc-300 text-zinc-900 px-6 py-3 rounded-lg hover:bg-zinc-50 transition-colors duration-200 text-center font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}