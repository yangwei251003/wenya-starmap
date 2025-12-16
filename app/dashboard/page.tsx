'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDashboard } from '@/hooks/useDashboard'
import { ProgressCard } from '@/components/dashboard/ProgressCard'
import { StarMap } from '@/components/dashboard/StarMap'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RecommendedLessons } from '@/components/dashboard/RecommendedLessons'
import { GrowthAnimation } from '@/components/dashboard/GrowthAnimation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { User, Star, Sparkles } from 'lucide-react'

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'
  const isWelcome = searchParams.get('welcome') === 'true'
  
  const { learningPath, achievements, stats, isLoading, error, refreshData } = useDashboard()
  const [showAnimation, setShowAnimation] = useState(isWelcome)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // 获取用户数据
    const storedUser = localStorage.getItem('wenya_user')
    if (storedUser) {
      setUserData(JSON.parse(storedUser))
    }
  }, [])

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
        {/* 欢迎横幅 */}
        {userData && (
          <Card className="mb-8 p-6 bg-gradient-to-r from-sprout-500/20 to-star-500/20 border-sprout-400/30">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-sprout-400 to-star-400 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  欢迎回来，{userData.username}！
                </h2>
                <p className="text-cosmos-300 flex items-center gap-2">
                  <Star className="w-4 h-4 text-star-400" />
                  {userData.level === 'beginner' && '初学者 - 让我们一起开始学习之旅'}
                  {userData.level === 'intermediate' && '中级学习者 - 继续提升你的英语水平'}
                  {userData.level === 'advanced' && '高级学习者 - 追求更高的语言境界'}
                  {isDemo && (
                    <span className="ml-2 px-2 py-1 bg-star-400/20 text-star-300 text-xs rounded-full">
                      演示模式
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-cosmos-400">当前等级</div>
                <div className="text-lg font-semibold text-sprout-400 capitalize">
                  {userData.level}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent mb-2">
            学习仪表板
          </h1>
          <p className="text-cosmos-300 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-star-400" />
            你的成长星图
            <Sparkles className="w-4 h-4 text-star-400" />
          </p>
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