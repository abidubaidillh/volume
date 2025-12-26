'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface DashboardCardProps {
  title: string
  subtitle?: string
  icon: LucideIcon
  iconColor: string
  children: ReactNode
  className?: string
  onClick?: () => void
  loading?: boolean
}

export function DashboardCard({ 
  title, 
  subtitle, 
  icon: Icon, 
  iconColor, 
  children, 
  className = "",
  onClick,
  loading = false
}: DashboardCardProps) {
  const isClickable = !!onClick

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-sm border border-zinc-200 p-6 
        transition-all duration-200 
        ${isClickable ? 'cursor-pointer hover:shadow-md hover:border-zinc-300 hover:-translate-y-1' : ''}
        ${loading ? 'animate-pulse' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-zinc-900">{title}</h3>
          {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
        </div>
      </div>
      {loading ? (
        <div className="space-y-3">
          <div className="h-4 bg-zinc-200 rounded animate-pulse"></div>
          <div className="h-4 bg-zinc-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-zinc-200 rounded animate-pulse w-1/2"></div>
        </div>
      ) : (
        children
      )}
    </div>
  )
}