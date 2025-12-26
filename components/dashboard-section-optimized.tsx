'use client'

import { Suspense } from 'react'
import { SearchBar } from './ui/search-bar'
import { BookOpen, Calendar, Sparkles, BarChart3 } from 'lucide-react'
import { ReadingStatsWidget } from './reading-stats-widget-optimized'
import { RecentActivityWidget } from './recent-activity-widget-optimized'
import { ReadingGoalsWidget } from './reading-goals-widget'
import { QuickActionsWidget } from './quick-actions-widget'
import { TrendingBooksWidget } from './trending-books-widget-optimized'
import { DashboardSkeleton } from './ui/dashboard-skeleton'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

interface DashboardSectionProps {
  user: User
}

export function DashboardSectionOptimized({ user }: DashboardSectionProps) {
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Selamat pagi' : currentHour < 18 ? 'Selamat siang' : 'Selamat malam'

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-blue-50/30 to-zinc-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 mb-2">
                {greeting}, {displayName}! 
                <span className="inline-block ml-2 animate-bounce">👋</span>
              </h1>
              <p className="text-xl text-zinc-600">
                Siap menemukan buku bacaan selanjutnya?
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-zinc-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-700">
                    {new Date().toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900">
                  Cari Buku Favorit
                </h2>
                <p className="text-sm text-zinc-600">
                  Temukan jutaan buku dari perpustakaan kami
                </p>
              </div>
            </div>
            
            <div className="max-w-2xl">
              <SearchBar 
                placeholder="Cari buku berdasarkan judul, penulis, atau ISBN..."
                className="w-full"
              />
            </div>
            
            {/* Quick Search Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-zinc-500">Pencarian populer:</span>
              {['Fiksi', 'Sains', 'Biografi', 'Pengembangan Diri', 'Sejarah', 'Romance', 'Misteri'].map((genre) => (
                <Link
                  key={genre}
                  href={`/search?q=${encodeURIComponent(genre)}`}
                  className="text-sm bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full hover:bg-zinc-200 hover:scale-105 transition-all duration-200"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard Widgets Grid with Suspense */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Stats & Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Suspense fallback={<DashboardSkeleton type="stats" />}>
                <ReadingStatsWidget userId={user.id} />
              </Suspense>
              
              <Suspense fallback={<DashboardSkeleton type="activity" />}>
                <RecentActivityWidget userId={user.id} />
              </Suspense>
            </div>
            
            <Suspense fallback={<DashboardSkeleton type="goals" />}>
              <ReadingGoalsWidget 
                userId={user.id} 
                currentBooks={0}
              />
            </Suspense>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            <QuickActionsWidget />
          </div>
        </div>

        {/* Trending Books Section with Suspense */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Suspense fallback={<DashboardSkeleton type="trending" />}>
              <TrendingBooksWidget limit={8} />
            </Suspense>
          </div>
          
          {/* Reading Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">Wawasan Membaca</h3>
                <p className="text-sm text-zinc-500">Pola membaca Anda</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="text-center py-8 text-zinc-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
                <p className="text-sm">Belum ada data</p>
                <p className="text-xs">Mulai membaca untuk melihat wawasan!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}