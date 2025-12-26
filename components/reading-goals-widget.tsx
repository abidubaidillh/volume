'use client'

import { useState } from 'react'
import { Target, Edit3, Check, X } from 'lucide-react'
import { DashboardCard } from './ui/dashboard-card'
import { ProgressBar } from './ui/progress-bar'

interface ReadingGoalsWidgetProps {
  userId: string
  currentBooks: number
  yearlyGoal?: number
  monthlyGoal?: number
}

export function ReadingGoalsWidget({ 
  userId, 
  currentBooks, 
  yearlyGoal = 24, 
  monthlyGoal = 2 
}: ReadingGoalsWidgetProps) {
  const [isEditingYearly, setIsEditingYearly] = useState(false)
  const [isEditingMonthly, setIsEditingMonthly] = useState(false)
  const [tempYearlyGoal, setTempYearlyGoal] = useState(yearlyGoal)
  const [tempMonthlyGoal, setTempMonthlyGoal] = useState(monthlyGoal)

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthsRemaining = 12 - currentMonth
  const booksPerMonthNeeded = Math.ceil((yearlyGoal - currentBooks) / monthsRemaining)

  const handleSaveYearlyGoal = async () => {
    try {
      // API call to save yearly goal
      await fetch('/api/user/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, yearlyGoal: tempYearlyGoal })
      })
      setIsEditingYearly(false)
    } catch (error) {
      console.error('Error saving yearly goal:', error)
    }
  }

  const handleSaveMonthlyGoal = async () => {
    try {
      // API call to save monthly goal
      await fetch('/api/user/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, monthlyGoal: tempMonthlyGoal })
      })
      setIsEditingMonthly(false)
    } catch (error) {
      console.error('Error saving monthly goal:', error)
    }
  }

  return (
    <DashboardCard
      title="Reading Goals"
      subtitle="Track your progress"
      icon={Target}
      iconColor="bg-purple-100 text-purple-600"
    >
      <div className="space-y-6">
        {/* Yearly Goal */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-zinc-700">
              {currentYear} Goal
            </span>
            {!isEditingYearly ? (
              <button
                onClick={() => setIsEditingYearly(true)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700"
              >
                <Edit3 className="h-3 w-3" />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleSaveYearlyGoal}
                  className="text-green-600 hover:text-green-700"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditingYearly(false)
                    setTempYearlyGoal(yearlyGoal)
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          
          {isEditingYearly ? (
            <input
              type="number"
              value={tempYearlyGoal}
              onChange={(e) => setTempYearlyGoal(parseInt(e.target.value) || 0)}
              className="w-20 px-2 py-1 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="1"
              max="365"
            />
          ) : (
            <ProgressBar
              value={currentBooks}
              max={yearlyGoal}
              color="purple"
              showPercentage={true}
            />
          )}
          
          {!isEditingYearly && (
            <div className="mt-2 text-xs text-zinc-500">
              {currentBooks >= yearlyGoal ? (
                <span className="text-green-600 font-medium">🎉 Goal achieved!</span>
              ) : monthsRemaining > 0 ? (
                <span>
                  Need {booksPerMonthNeeded} books/month to reach goal
                </span>
              ) : (
                <span>Year ending soon</span>
              )}
            </div>
          )}
        </div>

        {/* Monthly Goal */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-zinc-700">
              Monthly Goal
            </span>
            {!isEditingMonthly ? (
              <button
                onClick={() => setIsEditingMonthly(true)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700"
              >
                <Edit3 className="h-3 w-3" />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleSaveMonthlyGoal}
                  className="text-green-600 hover:text-green-700"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditingMonthly(false)
                    setTempMonthlyGoal(monthlyGoal)
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          
          {isEditingMonthly ? (
            <input
              type="number"
              value={tempMonthlyGoal}
              onChange={(e) => setTempMonthlyGoal(parseInt(e.target.value) || 0)}
              className="w-20 px-2 py-1 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="1"
              max="31"
            />
          ) : (
            <ProgressBar
              value={0} // This month's books - would need to be calculated
              max={monthlyGoal}
              color="blue"
              showPercentage={true}
            />
          )}
        </div>

        {/* Quick Stats */}
        <div className="pt-4 border-t border-zinc-100">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-zinc-900">{currentBooks}</div>
              <div className="text-xs text-zinc-500">Books read</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-zinc-900">
                {Math.max(0, yearlyGoal - currentBooks)}
              </div>
              <div className="text-xs text-zinc-500">To go</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}