'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LearningStats } from '@/types'

interface StatsCardProps {
  stats: LearningStats
}

export function StatsCard({ stats }: StatsCardProps) {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${minutes}分钟`
  }

  const statItems = [
    {
      label: '学习时长',
      value: formatTime(stats.totalStudyTime),
      icon: '⏱️',
      color: 'text-sprout-400'
    },
    {
      label: '完成课程',
      value: stats.lessonsCompleted,
      icon: '📚',
      color: 'text-star-400'
    },
    {
      label: '完成练习',
      value: stats.exercisesCompleted,
      icon: '✍️',
      color: 'text-sprout-400'
    },
    {
      label: '平均分数',
      value: `${stats.averageScore}分`,
      icon: '🎯',
      color: 'text-star-400'
    },
    {
      label: '连续学习',
      value: `${stats.currentStreak}天`,
      icon: '🔥',
      color: 'text-sprout-400'
    },
    {
      label: '获得成就',
      value: stats.totalAchievements,
      icon: '⭐',
      color: 'text-star-400'
    }
  ]

  return (
    <Card variant="cosmos">
      <CardHeader>
        <CardTitle className="text-white">学习统计</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statItems.map((item, index) => (
            <div
              key={index}
              className="bg-cosmos-800/50 rounded-lg p-4 hover:bg-cosmos-700/50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm text-cosmos-300">{item.label}</span>
              </div>
              <div className={`text-2xl font-bold ${item.color}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
