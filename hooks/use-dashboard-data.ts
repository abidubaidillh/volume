'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ReadingStats, RecentActivity } from '@/services/dashboard'
import type { GoogleBook } from '@/services/books'

interface DashboardData {
  stats: ReadingStats | null
  activities: RecentActivity[]
  trendingBooks: GoogleBook[]
  loading: {
    stats: boolean
    activities: boolean
    trending: boolean
  }
  errors: {
    stats: string | null
    activities: string | null
    trending: string | null
  }
}

interface CombinedResponse {
  stats: ReadingStats
  activities: RecentActivity[]
  trending: GoogleBook[]
  errors: {
    stats: string | null
    activities: string | null
    trending: string | null
  }
  cached?: boolean
}

export function useDashboardData(userId: string) {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    activities: [],
    trendingBooks: [],
    loading: {
      stats: true,
      activities: true,
      trending: true
    },
    errors: {
      stats: null,
      activities: null,
      trending: null
    }
  })

  const fetchCombinedData = useCallback(async () => {
    if (!userId) return

    try {
      setData(prev => ({ 
        ...prev, 
        loading: { stats: true, activities: true, trending: true },
        errors: { stats: null, activities: null, trending: null }
      }))

      const response = await fetch(`/api/dashboard/combined?userId=${userId}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result: CombinedResponse = await response.json()
      
      setData(prev => ({ 
        ...prev, 
        stats: result.stats,
        activities: result.activities,
        trendingBooks: result.trending,
        loading: { stats: false, activities: false, trending: false },
        errors: result.errors
      }))
    } catch (error) {
      console.error('Error fetching combined dashboard data:', error)
      setData(prev => ({ 
        ...prev, 
        loading: { stats: false, activities: false, trending: false },
        errors: { 
          stats: 'Gagal memuat data', 
          activities: 'Gagal memuat data', 
          trending: 'Gagal memuat data' 
        }
      }))
    }
  }, [userId])

  useEffect(() => {
    fetchCombinedData()
  }, [fetchCombinedData])

  const refetch = useCallback(() => {
    fetchCombinedData()
  }, [fetchCombinedData])

  return {
    ...data,
    refetch
  }
}