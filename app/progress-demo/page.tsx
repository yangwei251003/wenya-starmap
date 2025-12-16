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
import { AchievementCelebration } from '@/components/exercise/AchievementCelebration'

export default function ProgressDemoPage() {
  const {
    stats,
    trends,
    analysis,
    isLoading,
    error,
    refreshData
  } = useProgressTracking('demo-user')

  const [isShareOpen, setIsShareOpen] = useState(false)
  const [selectedAchievement, setSelectedAchievement] = useState<StarAchievement | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  // 模拟成就数据
  const mockAchievements: StarAchievement[] = [
    {
      id: 'ach-1',
      userId: 'demo-user',
      type: 'first_lesson',
      title: '初次启程',
      description: '完成第一节课程',
      earnedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      starPosition: { x: 100, y: 300 },
      metadata: { icon: '🌱' }
    },
    {
      id: 'ach-2',
      userId: 'demo-user',
      type: 'daily_streak',
      title: '坚持不懈',
      description: '连续学习7天',
      earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      starPosition: { x: 200, y: 250 },
      metadata: { icon: '⭐' }
    },
    {
      id: 'ach-3',
      userId: 'demo-user',
      type: 'vocabulary_master',
      title: '词汇达人',
      description: '掌握100个新单词',
      earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      starPosition: { x: 300, y: 200 },
      metadata: { icon: '📚' }
    },
    {
      id: 'ach-4',
      userId: 'demo-user',
      type: 'perfect_score',
      title: '完美表现',
      description: '练习获得满分',
      earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      starPosition: { x: 400, y: 280 },
      metadata: { icon: '💯' }
    },
    {
      id: 'ach-5',
      userId: 'demo-user',
      type: 'grammar_expert',
      title: '语法专家',
      description: '完成所有语法练习',
      earnedAt: new Date(),
      starPosition: { x: 500, y: 220 },
      metadata: { icon: '✍️' }
    }
  ]

  const handleShareAchievement = (achievement: StarAchievement) => {
    setSelectedAchievement(achievement)
    setIsShareOpen(true)
  }

  const handleTestCelebration = () => {
    setShowCelebration(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cosmos-900 to-cosmos-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cosmos-300">加载进度数据...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cosmos-900 to-cosmos-800">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={refreshData}>重试</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-cosmos-900 to-cosmos-800">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent mb-2">
            学习进度追踪演示
          </h1>
          <p className="text-cosmos-300 mb-4">
            全面了解你的学习情况 - 统计、趋势、分析、分享
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="sprout" onClick={refreshData}>
              🔄 刷新数据
            </Button>
            <Button variant="star" onClick={handleTestCelebration}>
              🎉 测试庆祝动画
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">📊 学习统计</h2>
            <StatsCard stats={stats} />
          </section>
        )}

        {/* 趋势图表 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">📈 学习趋势</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressChart trends={trends} type="studyTime" />
            <ProgressChart trends={trends} type="lessons" />
          </div>
          <div className="mt-6">
            <ProgressChart trends={trends} type="score" />
          </div>
        </section>

        {/* 星图和分析 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">⭐ 成长星图与分析</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StarMap
              achievements={mockAchievements}
              width={600}
              height={400}
              onAchievementClick={handleShareAchievement}
            />
            {analysis && <ProgressAnalysis analysis={analysis} />}
          </div>
          <p className="text-cosmos-400 text-sm mt-4 text-center">
            💡 提示：点击星图中的星星可以分享成就
          </p>
        </section>

        {/* 成就列表 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">🏆 我的成就</h2>
          <div className="bg-cosmos-800/50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {mockAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className="bg-cosmos-700/50 rounded-lg p-4 hover:bg-cosmos-700 transition-all duration-200 cursor-pointer transform hover:scale-105"
                  onClick={() => handleShareAchievement(achievement)}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-2">
                      {achievement.metadata?.icon || '⭐'}
                    </div>
                    <h3 className="text-white font-semibold mb-1 text-sm">
                      {achievement.title}
                    </h3>
                    <p className="text-cosmos-300 text-xs mb-2">
                      {achievement.description}
                    </p>
                    <p className="text-cosmos-400 text-xs">
                      {new Date(achievement.earnedAt).toLocaleDateString('zh-CN', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 功能说明 */}
        <section className="bg-gradient-to-r from-sprout-900/30 to-star-900/30 rounded-lg p-6 border border-sprout-400/30">
          <h2 className="text-2xl font-bold text-white mb-4">✨ 功能特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sprout-400 font-semibold mb-2">📊 学习统计</h3>
              <ul className="text-cosmos-300 text-sm space-y-1">
                <li>• 学习时长追踪</li>
                <li>• 完成课程和练习统计</li>
                <li>• 平均分数计算</li>
                <li>• 连续学习天数</li>
                <li>• 成就数量统计</li>
              </ul>
            </div>
            <div>
              <h3 className="text-star-400 font-semibold mb-2">📈 趋势分析</h3>
              <ul className="text-cosmos-300 text-sm space-y-1">
                <li>• 学习时长趋势图</li>
                <li>• 完成课程趋势图</li>
                <li>• 平均分数趋势图</li>
                <li>• 动画效果展示</li>
                <li>• 悬停显示详情</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sprout-400 font-semibold mb-2">🎯 智能分析</h3>
              <ul className="text-cosmos-300 text-sm space-y-1">
                <li>• 优势识别</li>
                <li>• 劣势分析</li>
                <li>• 个性化建议</li>
                <li>• 完成时间预测</li>
                <li>• 学习表现评估</li>
              </ul>
            </div>
            <div>
              <h3 className="text-star-400 font-semibold mb-2">🎉 成就系统</h3>
              <ul className="text-cosmos-300 text-sm space-y-1">
                <li>• 成长星图可视化</li>
                <li>• 成就庆祝动画</li>
                <li>• 成就分享功能</li>
                <li>• 社交媒体分享</li>
                <li>• 下载分享图片</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* 成就分享对话框 */}
      {selectedAchievement && (
        <AchievementShare
          achievement={selectedAchievement}
          isOpen={isShareOpen}
          onClose={() => {
            setIsShareOpen(false)
            setSelectedAchievement(null)
          }}
        />
      )}

      {/* 成就庆祝动画 */}
      {showCelebration && (
        <AchievementCelebration
          achievements={[mockAchievements[mockAchievements.length - 1]]}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </div>
  )
}
