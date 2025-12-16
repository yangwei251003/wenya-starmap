/**
 * 进度追踪和可视化集成示例
 * 
 * 本文件展示如何使用进度追踪服务和相关组件
 */

'use client'

import React, { useState } from 'react'
import { useProgressTracking } from '@/hooks/useProgressTracking'
import {
  ProgressChart,
  ProgressAnalysis,
  AchievementShare,
  StatsCard,
  StarMap
} from '@/components/dashboard'
import { Button } from '@/components/ui/Button'
import { StarAchievement } from '@/types'

/**
 * 示例1: 基础进度追踪
 */
export function BasicProgressTrackingExample() {
  const { stats, isLoading, error } = useProgressTracking('user-123')

  if (isLoading) {
    return <div>加载中...</div>
  }

  if (error) {
    return <div>错误: {error}</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">基础进度追踪</h2>
      {stats && <StatsCard stats={stats} />}
    </div>
  )
}

/**
 * 示例2: 学习趋势可视化
 */
export function LearningTrendsExample() {
  const { trends, isLoading } = useProgressTracking('user-123')

  if (isLoading) {
    return <div>加载中...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">学习趋势</h2>
      
      {/* 学习时长趋势 */}
      <ProgressChart trends={trends} type="studyTime" />
      
      {/* 完成课程趋势 */}
      <ProgressChart trends={trends} type="lessons" />
      
      {/* 平均分数趋势 */}
      <ProgressChart trends={trends} type="score" />
    </div>
  )
}

/**
 * 示例3: 完整进度分析
 */
export function FullProgressAnalysisExample() {
  const { analysis, isLoading } = useProgressTracking('user-123')

  if (isLoading) {
    return <div>加载中...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">学习分析</h2>
      {analysis && <ProgressAnalysis analysis={analysis} />}
    </div>
  )
}

/**
 * 示例4: 成就分享功能
 */
export function AchievementShareExample() {
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [selectedAchievement, setSelectedAchievement] = useState<StarAchievement | null>(null)

  // 模拟成就数据
  const mockAchievements: StarAchievement[] = [
    {
      id: 'ach-1',
      userId: 'user-123',
      type: 'first_lesson',
      title: '初次启程',
      description: '完成第一节课程',
      earnedAt: new Date(),
      starPosition: { x: 100, y: 300 },
      metadata: { icon: '🌱' }
    },
    {
      id: 'ach-2',
      userId: 'user-123',
      type: 'perfect_score',
      title: '完美表现',
      description: '练习获得满分',
      earnedAt: new Date(),
      starPosition: { x: 200, y: 250 },
      metadata: { icon: '💯' }
    }
  ]

  const handleShareAchievement = (achievement: StarAchievement) => {
    setSelectedAchievement(achievement)
    setIsShareOpen(true)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">成就分享</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockAchievements.map(achievement => (
          <div
            key={achievement.id}
            className="bg-cosmos-800 rounded-lg p-6 border border-star-400/30"
          >
            <div className="text-center">
              <div className="text-6xl mb-3">
                {achievement.metadata?.icon || '⭐'}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {achievement.title}
              </h3>
              <p className="text-cosmos-300 text-sm mb-4">
                {achievement.description}
              </p>
              <Button
                variant="star"
                onClick={() => handleShareAchievement(achievement)}
              >
                分享成就
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 分享对话框 */}
      {selectedAchievement && (
        <AchievementShare
          achievement={selectedAchievement}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  )
}

/**
 * 示例5: 综合仪表板
 */
export function ComprehensiveDashboardExample() {
  const {
    stats,
    trends,
    analysis,
    isLoading,
    error,
    refreshData
  } = useProgressTracking('user-123')

  const [isShareOpen, setIsShareOpen] = useState(false)
  const [selectedAchievement, setSelectedAchievement] = useState<StarAchievement | null>(null)

  // 模拟成就数据
  const mockAchievements: StarAchievement[] = [
    {
      id: 'ach-1',
      userId: 'user-123',
      type: 'first_lesson',
      title: '初次启程',
      description: '完成第一节课程',
      earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      starPosition: { x: 100, y: 300 },
      metadata: { icon: '🌱' }
    },
    {
      id: 'ach-2',
      userId: 'user-123',
      type: 'daily_streak',
      title: '坚持不懈',
      description: '连续学习7天',
      earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      starPosition: { x: 200, y: 250 },
      metadata: { icon: '⭐' }
    },
    {
      id: 'ach-3',
      userId: 'user-123',
      type: 'perfect_score',
      title: '完美表现',
      description: '练习获得满分',
      earnedAt: new Date(),
      starPosition: { x: 300, y: 200 },
      metadata: { icon: '💯' }
    }
  ]

  const handleShareAchievement = (achievement: StarAchievement) => {
    setSelectedAchievement(achievement)
    setIsShareOpen(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cosmos-300">加载进度数据...</p>
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent mb-2">
            学习进度追踪
          </h1>
          <p className="text-cosmos-300">全面了解你的学习情况</p>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="mb-6">
            <StatsCard stats={stats} />
          </div>
        )}

        {/* 趋势图表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ProgressChart trends={trends} type="studyTime" />
          <ProgressChart trends={trends} type="score" />
        </div>

        {/* 星图和分析 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <StarMap
            achievements={mockAchievements}
            width={600}
            height={400}
          />
          {analysis && <ProgressAnalysis analysis={analysis} />}
        </div>

        {/* 成就列表 */}
        <div className="bg-cosmos-800/50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">我的成就</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockAchievements.map(achievement => (
              <div
                key={achievement.id}
                className="bg-cosmos-700/50 rounded-lg p-4 hover:bg-cosmos-700 transition-colors cursor-pointer"
                onClick={() => handleShareAchievement(achievement)}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {achievement.metadata?.icon || '⭐'}
                  </div>
                  <h3 className="text-white font-semibold mb-1">
                    {achievement.title}
                  </h3>
                  <p className="text-cosmos-300 text-xs mb-2">
                    {achievement.description}
                  </p>
                  <p className="text-cosmos-400 text-xs">
                    {new Date(achievement.earnedAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 刷新按钮 */}
        <div className="text-center">
          <Button variant="sprout" onClick={refreshData}>
            🔄 刷新数据
          </Button>
        </div>
      </div>

      {/* 成就分享对话框 */}
      {selectedAchievement && (
        <AchievementShare
          achievement={selectedAchievement}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  )
}

/**
 * 使用说明
 * 
 * 1. 基础进度追踪:
 *    - 使用 useProgressTracking hook 获取统计数据
 *    - 使用 StatsCard 组件显示统计信息
 * 
 * 2. 学习趋势可视化:
 *    - 使用 ProgressChart 组件显示不同类型的趋势
 *    - 支持学习时长、完成课程、平均分数三种类型
 * 
 * 3. 进度分析:
 *    - 使用 ProgressAnalysis 组件显示详细分析
 *    - 包括优势、劣势、建议和预计完成时间
 * 
 * 4. 成就分享:
 *    - 使用 AchievementShare 组件分享成就
 *    - 支持复制文本、下载图片、社交媒体分享
 * 
 * 5. 综合仪表板:
 *    - 整合所有功能的完整示例
 *    - 展示如何组合使用各个组件
 */
