'use client'

import { Search, BookOpen, User, BookmarkPlus, TrendingUp, Heart, Award, Settings } from 'lucide-react'
import { DashboardCard } from './ui/dashboard-card'
import Link from 'next/link'

interface QuickAction {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  badge?: string
}

export function QuickActionsWidget() {
  const actions: QuickAction[] = [
    {
      title: 'Search Books',
      description: 'Find your next great read',
      href: '/search',
      icon: Search,
      color: 'text-blue-600 bg-blue-100',
      badge: 'Popular'
    },
    {
      title: 'My Reading List',
      description: 'Manage books to read',
      href: '/profile?tab=reading-list',
      icon: BookmarkPlus,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'My Wishlist',
      description: 'Books you want to read',
      href: '/profile?tab=wishlist',
      icon: Heart,
      color: 'text-red-600 bg-red-100'
    },
    {
      title: 'Browse Trending',
      description: 'See what\'s popular now',
      href: '/search?sort=trending',
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-100',
      badge: 'Hot'
    },
    {
      title: 'My Reviews',
      description: 'View your book reviews',
      href: '/profile?tab=reviews',
      icon: Award,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      title: 'Edit Profile',
      description: 'Update your information',
      href: '/profile',
      icon: User,
      color: 'text-zinc-600 bg-zinc-100'
    }
  ]

  return (
    <DashboardCard
      title="Quick Actions"
      subtitle="Get started quickly"
      icon={BookOpen}
      iconColor="bg-orange-100 text-orange-600"
    >
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group block p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                <action.icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-zinc-900 group-hover:text-zinc-700">
                    {action.title}
                  </h4>
                  {action.badge && (
                    <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                      {action.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 group-hover:text-zinc-600">
                  {action.description}
                </p>
              </div>
              
              <div className="text-zinc-400 group-hover:text-zinc-600 group-hover:translate-x-1 transition-all duration-200">
                →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </DashboardCard>
  )
}