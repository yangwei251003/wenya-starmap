'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LearningTrend } from '@/lib/progress-tracking-service'

interface ProgressChartProps {
  trends: LearningTrend[]
  type?: 'studyTime' | 'lessons' | 'score'
}

export function ProgressChart({ trends, type = 'studyTime' }: ProgressChartProps) {
  const getChartData = () => {
    switch (type) {
      case 'studyTime':
        return {
          title: '学习时长趋势',
          data: trends.map(t => t.studyTime / 60), // 转换为分钟
          unit: '分钟',
          color: 'sprout'
        }
      case 'lessons':
        return {
          title: '完成课程趋势',
          data: trends.map(t => t.lessonsCompleted),
          unit: '节',
          color: 'star'
        }
      case 'score':
        return {
          title: '平均分数趋势',
          data: trends.map(t => t.averageScore),
          unit: '分',
          color: 'star'
        }
    }
  }

  const chartData = getChartData()
  const maxValue = Math.max(...chartData.data, 1)
  const labels = trends.map(t => {
    const date = new Date(t.date)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })

  return (
    <Card variant="cosmos">
      <CardHeader>
        <CardTitle className="text-white">{chartData.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between gap-2">
          {chartData.data.map((value, index) => {
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0
            const colorClass = chartData.color === 'sprout' 
              ? 'from-sprout-400 to-sprout-600'
              : 'from-star-400 to-star-600'

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                {/* 柱状图 */}
                <div className="w-full h-48 flex items-end justify-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`w-full bg-gradient-to-t ${colorClass} rounded-t-lg relative group cursor-pointer`}
                  >
                    {/* 悬停提示 */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-cosmos-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {Math.round(value)}{chartData.unit}
                    </div>
                  </motion.div>
                </div>

                {/* 日期标签 */}
                <div className="text-xs text-cosmos-400 mt-2">
                  {labels[index]}
                </div>
              </div>
            )
          })}
        </div>

        {/* 图例 */}
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-cosmos-300">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded bg-gradient-to-r ${chartData.color === 'sprout' ? 'from-sprout-400 to-sprout-600' : 'from-star-400 to-star-600'}`} />
            <span>{chartData.title}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
