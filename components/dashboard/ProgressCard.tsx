'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { EnglishLevel } from '@/types'

interface ProgressCardProps {
  currentLevel: EnglishLevel
  targetLevel: EnglishLevel
  progress: number
  completedLessons: number
  totalLessons: number
}

export function ProgressCard({
  currentLevel,
  targetLevel,
  progress,
  completedLessons,
  totalLessons
}: ProgressCardProps) {
  const levelNames = {
    beginner: '初学者',
    intermediate: '中级',
    advanced: '高级'
  }

  return (
    <Card variant="sprout" className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>学习进度</span>
          <span className="text-sm font-normal text-sprout-200">
            {levelNames[currentLevel]} → {levelNames[targetLevel]}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 进度条 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-sprout-100">整体进度</span>
            <span className="text-lg font-bold text-white">{progress}%</span>
          </div>
          <div className="h-4 bg-sprout-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sprout-400 to-sprout-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 课程统计 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-sprout-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-white mb-1">
              {completedLessons}
            </div>
            <div className="text-sm text-sprout-200">已完成课程</div>
          </div>
          <div className="bg-sprout-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-white mb-1">
              {totalLessons - completedLessons}
            </div>
            <div className="text-sm text-sprout-200">待学习课程</div>
          </div>
        </div>
      </CardContent>

      {/* 装饰性嫩芽图案 */}
      <div className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10">
        <svg viewBox="0 0 100 100" fill="currentColor" className="text-white">
          <path d="M50 10 Q30 30 50 50 Q70 30 50 10 M50 50 L50 90" strokeWidth="4" stroke="currentColor" fill="none" />
          <circle cx="50" cy="50" r="8" />
        </svg>
      </div>
    </Card>
  )
}
