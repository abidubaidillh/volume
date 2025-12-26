'use client'

import { TrendingUp, BookOpen, Star, Flame } from 'lucide-react'
import { DashboardCard } from './ui/dashboard-card'
import { ProgressBar } from './ui/progress-bar'
import { AnimatedCounter } from './ui/animated-counter'
import { useDashboardData } from '@/hooks/use-dashboard-data'

interface ReadingStatsWidgetProps {
  userId: string
}

export function ReadingStatsWidget({ userId }: ReadingStatsWidgetProps) {
  const { stats, loading, errors } = useDashboardData(userId)

  if (loading.stats) {
    return (
      <DashboardCard
        title="Statistik Membaca"
        subtitle="Progres Anda"
        icon={TrendingUp}
        iconColor="bg-green-100 text-green-600"
        loading={true}
      >
        <div />
      </DashboardCard>
    )
  }

  if (errors.stats || !stats) {
    return (
      <DashboardCard
        title="Statistik Membaca"
        subtitle="Progres Anda"
        icon={TrendingUp}
        iconColor="bg-green-100 text-green-600"
      >
        <div className="text-center py-4 text-zinc-500">
          <p className="text-sm">{errors.stats || 'Tidak dapat memuat statistik'}</p>
        </div>
      </DashboardCard>
    )
  }

  const yearlyGoal = 24 // Default yearly goal
  const monthlyGoal = 2 // Default monthly goal

  return (
    <DashboardCard
      title="Statistik Membaca"
      subtitle="Progres Anda"
      icon={TrendingUp}
      iconColor="bg-green-100 text-green-600"
    >
      <div className="space-y-4">
        {/* Total Reviews */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-zinc-500" />
            <span className="text-sm text-zinc-600">Buku direview</span>
          </div>
          <span className="font-semibold text-lg">
            <AnimatedCounter value={stats.totalReviews} />
          </span>
        </div>

        {/* Average Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-zinc-600">Rating rata-rata</span>
          </div>
          <span className="font-semibold text-lg">
            {stats.averageRating > 0 ? `${stats.averageRating}★` : '-'}
          </span>
        </div>

        {/* Reading Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-zinc-600">Streak membaca</span>
          </div>
          <span className="font-semibold text-lg">
            <AnimatedCounter value={stats.readingStreak} suffix=" hari" />
          </span>
        </div>

        {/* Monthly Progress */}
        <div className="pt-2">
          <ProgressBar
            value={stats.booksThisMonth}
            max={monthlyGoal}
            label="Bulan ini"
            color="blue"
            showPercentage={true}
          />
        </div>

        {/* Yearly Progress */}
        <div>
          <ProgressBar
            value={stats.booksThisYear}
            max={yearlyGoal}
            label="Tahun ini"
            color="green"
            showPercentage={true}
          />
        </div>
      </div>
    </DashboardCard>
  )
}