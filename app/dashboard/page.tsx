'use client'

import React, { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { ProgressCard } from '@/components/dashboard/ProgressCard'
import { StarMap } from '@/components/dashboard/StarMap'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RecommendedLessons } from '@/components/dashboard/RecommendedLessons'
import { GrowthAnimation } from '@/components/dashboard/GrowthAnimation'
import { Button } from '@/components/ui/Button'

export default function DashboardPage() {
  const { learningPath, achievements, stats, isLoading, error, refreshData } = useDashboard()
  const [showAnimation, setShowAnimation] = useState(false)

  const handleStartLesson = (lessonId: string) => {
    console.log('Starting lesson:', lessonId)
    // 这里应该导航到课程页面
    // router.push(`/lesson/${lessonId}`)
  }

  const handleTestAnimation = () => {
    setShowAnimation(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cosmos-300">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={refreshData}>重试</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-cosmos-900 to-cosmos-800">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent mb-2">
            学习仪表板
          </h1>
          <p className="text-cosmos-300">你的成长星图</p>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* 左侧列 - 进度和统计 */}
          <div className="lg:col-span-1 space-y-6">
            {learningPath && (
              <ProgressCard
                currentLevel={learningPath.currentLevel}
                targetLevel={learningPath.targetLevel}
                progress={learningPath.progress}
                completedLessons={learningPath.completedLessons.length}
                totalLessons={learningPath.recommendedNext.length + learningPath.completedLessons.length}
              />
            )}

            <StatsCard stats={stats} />
          </div>

          {/* 右侧列 - 星图和推荐课程 */}
          <div className="lg:col-span-2 space-y-6">
            <StarMap achievements={achievements} />

            {learningPath && (
              <RecommendedLessons
                lessons={learningPath.recommendedNext}
                onStartLesson={handleStartLesson}
              />
            )}
          </div>
        </div>

        {/* 测试按钮（开发用） */}
        <div className="text-center mt-8">
          <Button
            variant="star"
            onClick={handleTestAnimation}
          >
            🌟 测试成长动画
          </Button>
        </div>
      </div>

      {/* 成长动画 */}
      <GrowthAnimation
        isVisible={showAnimation}
        onComplete={() => setShowAnimation(false)}
        achievementTitle="恭喜！新成就解锁"
      />
    </div>
  )
}