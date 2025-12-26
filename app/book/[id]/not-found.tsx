import Link from 'next/link'
import { BookOpen, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="text-center">
        <BookOpen className="h-16 w-16 text-zinc-400 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-zinc-900 mb-4">
          Book Not Found
        </h1>
        <p className="text-zinc-600 mb-8 max-w-md">
          The book you're looking for doesn't exist or may have been removed.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center bg-zinc-900 text-white px-6 py-3 rounded-md hover:bg-zinc-800 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}