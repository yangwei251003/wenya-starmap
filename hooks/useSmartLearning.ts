/**
 * 智能学习数据Hook
 * 提供实时学习数据追踪和自动刷新
 */

import { useState, useEffect, useCallback } from 'react'
import { smartLearningService, SmartLearningData } from '@/lib/smart-learning-service'

export function useSmartLearning(userId: string) {
  const [data, setData] = useState<SmartLearningData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 加载学习数据
  const loadData = useCallback(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      const learningData = smartLearningService.getUserLearningData(userId)
      setData(learningData)
      setError(null)
    } catch (err) {
      setError('加载学习数据失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // 初始加载
  useEffect(() => {
    if (userId) {
      loadData()
    }
  }, [userId, loadData])

  // 自动刷新（每30秒）
  useEffect(() => {
    if (!userId) return

    const interval = setInterval(() => {
      loadData()
    }, 30000)

    return () => clearInterval(interval)
  }, [userId, loadData])

  // 记录学习活动
  const recordActivity = useCallback((activity: {
    type: 'word' | 'lesson' | 'exercise'
    id: string
    duration: number
    success: boolean
  }) => {
    if (!userId) return
    smartLearningService.recordLearningActivity(userId, activity)
    // 立即刷新数据
    loadData()
  }, [userId, loadData])

  // 手动刷新
  const refresh = useCallback(() => {
    setLoading(true)
    loadData()
  }, [loadData])

  // 获取学习建议
  const getAdvice = useCallback(() => {
    if (!data) return []
    return smartLearningService.getStudyAdvice(data)
  }, [data])

  // 检查是否需要复习提醒
  const needsReviewReminder = useCallback(() => {
    if (!userId) return false
    return smartLearningService.shouldShowReviewReminder(userId)
  }, [userId])

  return {
    data,
    loading,
    error,
    recordActivity,
    refresh,
    getAdvice,
    needsReviewReminder
  }
}
