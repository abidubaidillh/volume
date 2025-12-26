'use client'

interface ProgressBarProps {
  value: number
  max: number
  label?: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
}

export function ProgressBar({ 
  value, 
  max, 
  label, 
  color = 'blue', 
  size = 'md',
  showPercentage = false 
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  }
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-zinc-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-zinc-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-zinc-200 rounded-full ${sizeClasses[size]}`}>
        <div 
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-zinc-500 mt-1">
        <span>{value}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}