'use client'

import { useState, useEffect } from 'react'
import { LearningPath, StarAchievement, LearningStats, EnglishLevel } from '@/types'
import { learningPathService } from '@/lib/learning-path'

interface DashboardData {
  learningPath: LearningPath | null
  achievements: StarAchievement[]
  stats: LearningStats
  isLoading: boolean
  error: string | null
}

export function useDashboard(userId?: string) {
  const [data, setData] = useState<DashboardData>({
    learningPath: null,
    achievements: [],
    stats: {
      totalStudyTime: 0,
      lessonsCompleted: 0,
      exercisesCompleted: 0,
      averageScore: 0,
      currentStreak: 0,
      totalAchievements: 0,
      levelProgress: 0
    },
    isLoading: true,
    error: null
  })

  useEffect(() => {
    loadDashboardData()
  }, [userId])

  const loadDashboardData = async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }))

      // 在实际应用中，这里应该从API获取数据
      // 现在使用模拟数据
      const mockLearningPath = await getMockLearningPath(userId || 'demo-user')
      const mockAchievements = getMockAchievements(userId || 'demo-user')
      const mockStats = getMockStats()

      setData({
        learningPath: mockLearningPath,
        achievements: mockAchievements,
        stats: mockStats,
        isLoading: false,
        error: null
      })
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '加载数据失败'
      }))
    }
  }

  const refreshData = () => {
    loadDashboardData()
  }

  return {
    ...data,
    refreshData
  }
}

// 模拟数据函数
async function getMockLearningPath(userId: string): Promise<LearningPath> {
  // 使用学习路径服务创建模拟路径
  const path = await learningPathService.createPathForNewUser(userId, {
    level: 'beginner' as EnglishLevel,
    targetLevel: 'intermediate' as EnglishLevel,
    scores: {
      vocabulary: 65,
      grammar: 70,
      listening: 60,
      speaking: 55,
      reading: 68,
      writing: 62
    }
  })

  // 模拟一些已完成的课程
  return {
    ...path,
    completedLessons: ['lesson-1', 'lesson-2'],
    progress: 35
  }
}

function getMockAchievements(userId: string): StarAchievement[] {
  return [
    {
      id: 'ach-1',
      userId,
      type: 'first_lesson',
      title: '初次启程',
      description: '完成第一节课程',
      earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      starPosition: { x: 100, y: 300 }
    },
    {
      id: 'ach-2',
      userId,
      type: 'daily_streak',
      title: '坚持不懈',
      description: '连续学习3天',
      earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      starPosition: { x: 200, y: 250 }
    },
    {
      id: 'ach-3',
      userId,
      type: 'vocabulary_master',
      title: '词汇达人',
      description: '掌握100个新单词',
      earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      starPosition: { x: 300, y: 200 }
    },
    {
      id: 'ach-4',
      userId,
      type: 'perfect_score',
      title: '完美表现',
      description: '练习获得满分',
      earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      starPosition: { x: 400, y: 280 }
    },
    {
      id: 'ach-5',
      userId,
      type: 'grammar_expert',
      title: '语法专家',
      description: '完成所有语法练习',
      earnedAt: new Date(),
      starPosition: { x: 500, y: 220 }
    }
  ]
}

function getMockStats(): LearningStats {
  return {
    totalStudyTime: 7200, // 2小时
    lessonsCompleted: 8,
    exercisesCompleted: 45,
    averageScore: 87,
    currentStreak: 5,
    totalAchievements: 5,
    levelProgress: 35
  }
}
