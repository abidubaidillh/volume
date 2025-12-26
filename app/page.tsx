'use client'

import { Suspense } from 'react'
import { useAuth } from '@/components/auth-provider'
import { HeroSection } from '@/components/hero-section'
import { DashboardSectionOptimized } from '@/components/dashboard-section-optimized'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ErrorBoundary } from '@/components/error-boundary'

export default function HomePage() {
  const { user, loading } = useAuth()

  // Show loading spinner only for initial auth check
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </main>
    )
  }

  return (
    <ErrorBoundary>
      <main>
        {user ? (
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner />
            </div>
          }>
            <DashboardSectionOptimized user={user} />
          </Suspense>
        ) : (
          <HeroSection />
        )}
      </main>
    </ErrorBoundary>
  )
}