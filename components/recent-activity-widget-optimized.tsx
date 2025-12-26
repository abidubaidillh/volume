'use client'

import { Clock, Star, BookmarkPlus, BookOpen, Heart } from 'lucide-react'
import { DashboardCard } from './ui/dashboard-card'
import { StarRating } from './ui/star-rating'
import { normalizeImageUrl } from '@/lib/image-utils'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import Link from 'next/link'
import Image from 'next/image'
import type { RecentActivity } from '@/services/dashboard'

interface RecentActivityWidgetProps {
  userId: string
}

export function RecentActivityWidget({ userId }: RecentActivityWidgetProps) {
  const { activities, loading, errors } = useDashboardData(userId)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <Star className="h-4 w-4 text-yellow-500" />
      case 'wishlist':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'reading_list':
        return <BookmarkPlus className="h-4 w-4 text-blue-500" />
      default:
        return <BookOpen className="h-4 w-4 text-zinc-500" />
    }
  }

  const getActivityText = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'review':
        return `Mereview "${activity.book_title}"`
      case 'wishlist':
        return `Menambahkan "${activity.book_title}" ke wishlist`
      case 'reading_list':
        return `Menambahkan "${activity.book_title}" ke daftar baca`
      default:
        return `Aktivitas pada "${activity.book_title}"`
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Baru saja'
    if (diffInHours < 24) return `${diffInHours} jam lalu`
    if (diffInHours < 48) return 'Kemarin'
    return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
  }

  return (
    <DashboardCard
      title="Aktivitas Terbaru"
      subtitle="Aksi terbaru Anda"
      icon={Clock}
      iconColor="bg-blue-100 text-blue-600"
      loading={loading.activities}
    >
      {errors.activities ? (
        <div className="text-center py-4 text-zinc-500">
          <p className="text-sm">{errors.activities}</p>
        </div>
      ) : !loading.activities && activities.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
          <p className="text-sm">Belum ada aktivitas</p>
          <p className="text-xs">Mulai dengan mencari buku!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  {activity.book_cover && (
                    <div className="flex-shrink-0">
                      <Image
                        src={normalizeImageUrl(activity.book_cover) || '/placeholder-book.svg'}
                        alt={activity.book_title}
                        width={32}
                        height={48}
                        className="rounded object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {getActivityText(activity)}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      oleh {activity.book_author}
                    </p>
                    
                    {activity.type === 'review' && activity.rating && (
                      <div className="mt-1">
                        <StarRating rating={activity.rating} readonly size="sm" />
                      </div>
                    )}
                    
                    <p className="text-xs text-zinc-400 mt-1">
                      {formatDate(activity.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading.activities && activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-100">
          <Link
            href="/profile"
            className="text-sm text-zinc-600 hover:text-zinc-900 font-medium"
          >
            Lihat semua aktivitas →
          </Link>
        </div>
      )}
    </DashboardCard>
  )
}