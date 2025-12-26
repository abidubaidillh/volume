'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, BookOpen, Star, Calendar, Target, Flame } from 'lucide-react'
import { DashboardCard } from './ui/dashboard-card'
import { ProgressBar } from './ui/progress-bar'
import { AnimatedCounter } from './ui/animated-counter'
import type { ReadingStats } from '@/services/dashboard'

interface ReadingStatsWidgetProps {
  userId: string
}

export function ReadingStatsWidget({ userId }: ReadingStatsWidgetProps) {
  const [stats, setStats] = useState<ReadingStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/dashboard/stats?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId])

  if (loading) {
    return (
      <DashboardCard
        title="Reading Stats"
        subtitle="Your progress"
        icon={TrendingUp}
        iconColor="bg-green-100 text-green-600"
        loading={true}
      >
        <div />
      </DashboardCard>
    )
  }

  if (!stats) {
    return (
      <DashboardCard
        title="Reading Stats"
        subtitle="Your progress"
        icon={TrendingUp}
        iconColor="bg-green-100 text-green-600"
      >
        <div className="text-center py-4 text-zinc-500">
          <p className="text-sm">Unable to load stats</p>
        </div>
      </DashboardCard>
    )
  }

  const yearlyGoal = 24 // Default yearly goal
  const monthlyGoal = 2 // Default monthly goal

  return (
    <DashboardCard
      title="Reading Stats"
      subtitle="Your progress"
      icon={TrendingUp}
      iconColor="bg-green-100 text-green-600"
    >
      <div className="space-y-4">
        {/* Total Reviews */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-zinc-500" />
            <span className="text-sm text-zinc-600">Books reviewed</span>
          </div>
          <span className="font-semibold text-lg">
            <AnimatedCounter value={stats.totalReviews} />
          </span>
        </div>

        {/* Average Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-zinc-600">Average rating</span>
          </div>
          <span className="font-semibold text-lg">
            {stats.averageRating > 0 ? `${stats.averageRating}★` : '-'}
          </span>
        </div>

        {/* Reading Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-zinc-600">Reading streak</span>
          </div>
          <span className="font-semibold text-lg">
            <AnimatedCounter value={stats.readingStreak} suffix=" days" />
          </span>
        </div>

        {/* Monthly Progress */}
        <div className="pt-2">
          <ProgressBar
            value={stats.booksThisMonth}
            max={monthlyGoal}
            label="This month"
            color="blue"
            showPercentage={true}
          />
        </div>

        {/* Yearly Progress */}
        <div>
          <ProgressBar
            value={stats.booksThisYear}
            max={yearlyGoal}
            label="This year"
            color="green"
            showPercentage={true}
          />
        </div>
      </div>
    </DashboardCard>
  )
}