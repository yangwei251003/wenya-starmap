'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Lesson } from '@/types'
import { SproutIcon } from './GrowthAnimation'

interface RecommendedLessonsProps {
  lessons: Lesson[]
  onStartLesson?: (lessonId: string) => void
}

export function RecommendedLessons({ lessons, onStartLesson }: RecommendedLessonsProps) {
  const levelBadgeColors = {
    beginner: 'bg-sprout-500/20 text-sprout-400 border-sprout-400/30',
    intermediate: 'bg-star-500/20 text-star-400 border-star-400/30',
    advanced: 'bg-purple-500/20 text-purple-400 border-purple-400/30'
  }

  const levelNames = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  }

  return (
    <Card variant="cosmos">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <SproutIcon className="text-sprout-400" />
          <span>推荐课程</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lessons.length === 0 ? (
          <div className="text-center py-8 text-cosmos-400">
            暂无推荐课程
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="bg-cosmos-800/50 rounded-lg p-4 hover:bg-cosmos-700/50 transition-all duration-200 border border-cosmos-600/30 hover:border-sprout-400/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-cosmos-400 font-mono text-sm">
                        #{index + 1}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs border ${levelBadgeColors[lesson.level]}`}>
                        {levelNames[lesson.level]}
                      </span>
                    </div>
                    <h4 className="text-white font-semibold mb-1">
                      {lesson.title}
                    </h4>
                    <p className="text-sm text-cosmos-300 mb-2">
                      {lesson.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-cosmos-400">
                      <span className="flex items-center space-x-1">
                        <span>⏱️</span>
                        <span>{lesson.estimatedTime}分钟</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>📝</span>
                        <span>{lesson.exercises.length}个练习</span>
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="sprout"
                  size="sm"
                  className="w-full"
                  onClick={() => onStartLesson?.(lesson.id)}
                >
                  开始学习
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
