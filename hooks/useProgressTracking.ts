'use client'

import { useState, useEffect } from 'react'
import {
  progressTrackingService,
  ProgressData,
  ProgressAnalysis as ProgressAnalysisType,
  LearningTrend
} from '@/lib/progress-tracking-service'
import {
  LearningSession,
  Progress,
  StarAchievement,
  LearningStats
} from '@/types'

interface UseProgressTrackingResult {
  stats: LearningStats | null
  trends: LearningTrend[]
  analysis: ProgressAnalysisType | null
  isLoading: boolean
  error: string | null
  refreshData: () => void
}

export function useProgressTracking(userId?: string): UseProgressTrackingResult {
  const [stats, setStats] = useState<LearningStats | null>(null)
  const [trends, setTrends] = useState<LearningTrend[]>([])
  const [analysis, setAnalysis] = useState<ProgressAnalysisType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProgressData()
  }, [userId])

  const loadProgressData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 在实际应用中，这里应该从API获取数据
      // 现在使用模拟数据
      const mockData = getMockProgressData(userId || 'demo-user')

      // 计算统计数据
      const calculatedStats = progressTrackingService.calculateStats(mockData)
      setStats(calculatedStats)

      // 分析趋势
      const calculatedTrends = progressTrackingService.analyzeTrends(mockData.sessions, 7)
      setTrends(calculatedTrends)

      // 执行完整分析
      const fullAnalysis = progressTrackingService.analyzeProgress(mockData)
      setAnalysis(fullAnalysis)

      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载进度数据失败')
      setIsLoading(false)
    }
  }

  const refreshData = () => {
    loadProgressData()
  }

  return {
    stats,
    trends,
    analysis,
    isLoading,
    error,
    refreshData
  }
}

// 生成模拟进度数据
function getMockProgressData(userId: string): ProgressData {
  const now = new Date()

  // 生成最近7天的学习会话
  const sessions: LearningSession[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(10 + Math.floor(Math.random() * 8), 0, 0, 0)

    // 随机决定是否有学习会话
    if (Math.random() > 0.2) {
      sessions.push({
        id: `session-${i}`,
        userId,
        startTime: date,
        endTime: new Date(date.getTime() + (30 + Math.random() * 60) * 60 * 1000),
        lessonsCompleted: [`lesson-${i * 2}`, `lesson-${i * 2 + 1}`],
        exercisesCompleted: Array.from(
          { length: Math.floor(Math.random() * 5) + 3 },
          (_, j) => `exercise-${i}-${j}`
        ),
        totalScore: Math.floor(Math.random() * 30) + 70,
        timeSpent: Math.floor((30 + Math.random() * 60) * 60),
        achievements: []
      })
    }
  }

  // 生成进度记录
  const progress: Progress[] = []
  for (let i = 0; i < 15; i++) {
    const completedDate = new Date(now)
    completedDate.setDate(completedDate.getDate() - Math.floor(Math.random() * 30))

    progress.push({
      id: `progress-${i}`,
      userId,
      lessonId: `lesson-${i}`,
      status: i < 10 ? 'completed' : 'in_progress',
      score: i < 10 ? Math.floor(Math.random() * 30) + 70 : undefined,
      timeSpent: Math.floor((20 + Math.random() * 40) * 60),
      completedAt: i < 10 ? completedDate : undefined,
      createdAt: new Date(completedDate.getTime() - 24 * 60 * 60 * 1000)
    })
  }

  // 生成成就
  const achievements: StarAchievement[] = [
    {
      id: 'ach-1',
      userId,
      type: 'first_lesson',
      title: '初次启程',
      description: '完成第一节课程',
      earnedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      starPosition: { x: 100, y: 300 },
      metadata: { icon: '🌱' }
    },
    {
      id: 'ach-2',
      userId,
      type: 'daily_streak',
      title: '坚持不懈',
      description: '连续学习7天',
      earnedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      starPosition: { x: 200, y: 250 },
      metadata: { icon: '⭐' }
    },
    {
      id: 'ach-3',
      userId,
      type: 'vocabulary_master',
      title: '词汇达人',
      description: '掌握100个新单词',
      earnedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      starPosition: { x: 300, y: 200 },
      metadata: { icon: '📚' }
    }
  ]

  return {
    userId,
    sessions,
    progress,
    achievements
  }
}
