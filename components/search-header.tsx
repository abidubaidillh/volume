'use client'

import { SearchBar } from './ui/search-bar'
import { BookOpen, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface SearchHeaderProps {
  query: string
}

export function SearchHeader({ query }: SearchHeaderProps) {
  return (
    <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link 
            href="/"
            className="inline-flex items-center text-zinc-600 hover:text-zinc-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <BookOpen className="h-6 w-6 mr-2" />
            <span className="text-xl font-bold">Volume</span>
          </Link>
          
          <div className="flex-1 max-w-2xl mx-8">
            <SearchBar 
              placeholder="Search for books..."
              className="w-full"
              defaultValue={query}
            />
          </div>
        </div>
      </div>
    </div>
  )
}