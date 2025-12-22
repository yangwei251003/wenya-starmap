/**
 * 智能学习服务 - 成长星图核心引擎
 * 统一管理所有学习数据，提供智能学习指引
 */

import { srsService } from './srs-service'
import { wordRecordService } from './word-record-service'
import { progressTrackingService } from './progress-tracking-service'

// 简单的课程服务替代
const getLessonProgress = (userId: string) => {
  if (typeof window === 'undefined') return { completed: [], inProgress: [] }
  const stored = localStorage.getItem(`wenya_lesson_progress_${userId}`)
  if (stored) {
    return JSON.parse(stored)
  }
  return { completed: [], inProgress: [] }
}

export interface SmartLearningData {
  userId: string
  // 单词学习数据
  wordStats: {
    total: number
    mastered: number
    learning: number
    needReview: number
    newToday: number
  }
  // 课程学习数据
  lessonStats: {
    total: number
    completed: number
    inProgress: number
    recommended: string[]
  }
  // 学习时间统计
  timeStats: {
    today: number
    week: number
    total: number
    streak: number
  }
  // 学习效率
  efficiency: {
    accuracy: number
    speed: number
    consistency: number
  }
  // 智能建议
  recommendations: {
    priority: 'review' | 'new' | 'rest'
    message: string
    actions: Array<{
      type: 'word' | 'lesson' | 'exercise'
      id: string
      reason: string
    }>
  }
  // 下次学习时间
  nextStudyTime: Date
  // 成就数据
  achievements: Array<{
    id: string
    title: string
    progress: number
    unlocked: boolean
  }>
}

class SmartLearningService {
  private readonly STORAGE_KEY = 'wenya_smart_learning'

  /**
   * 获取用户完整学习数据
   */
  getUserLearningData(userId: string): SmartLearningData {
    // 获取单词数据
    const userWords = srsService.getUserWords(userId)
    const reviewWords = srsService.getTodayReviewWords(userId)
    const newWords = srsService.getTodayNewWords(userId)
    const wordProgress = srsService.getProgress(userId)

    // 获取课程数据
    const lessonProgress = getLessonProgress(userId)
    const completedLessons = lessonProgress.completed || []
    const inProgressLessons = lessonProgress.inProgress || []

    // 获取今日学习会话
    const todaySession = srsService.getTodaySession(userId)

    // 计算单词统计
    const wordStats = {
      total: userWords.length,
      mastered: userWords.filter(w => w.interval >= 7).length,
      learning: userWords.filter(w => w.interval > 0 && w.interval < 7).length,
      needReview: reviewWords.length,
      newToday: newWords.length
    }

    // 计算课程统计
    const lessonStats = {
      total: completedLessons.length + inProgressLessons.length,
      completed: completedLessons.length,
      inProgress: inProgressLessons.length,
      recommended: this.getRecommendedLessons(userId, completedLessons.length)
    }

    // 计算时间统计
    const timeStats = {
      today: todaySession.studyTime,
      week: this.getWeekStudyTime(userId),
      total: this.getTotalStudyTime(userId),
      streak: wordProgress.streak
    }

    // 计算学习效率
    const efficiency = this.calculateEfficiency(userId, todaySession)

    // 生成智能建议
    const recommendations = this.generateSmartRecommendations(
      wordStats,
      lessonStats,
      timeStats,
      efficiency
    )

    // 计算下次学习时间
    const nextStudyTime = this.calculateNextStudyTime(userWords, timeStats.streak)

    // 获取成就数据
    const achievements = this.getAchievements(wordStats, lessonStats, timeStats)

    return {
      userId,
      wordStats,
      lessonStats,
      timeStats,
      efficiency,
      recommendations,
      nextStudyTime,
      achievements
    }
  }

  /**
   * 计算学习效率
   */
  private calculateEfficiency(userId: string, todaySession: any) {
    const total = todaySession.correctCount + todaySession.wrongCount
    const accuracy = total > 0 ? (todaySession.correctCount / total) * 100 : 0

    // 计算速度（每分钟学习单词数）
    const speed = todaySession.studyTime > 0 
      ? (todaySession.totalWords / (todaySession.studyTime / 60)) 
      : 0

    // 计算一致性（基于连续学习天数）
    const userWords = srsService.getUserWords(userId)
    const consistency = Math.min(100, (userWords.length / 100) * 100)

    return {
      accuracy: Math.round(accuracy),
      speed: Math.round(speed * 10) / 10,
      consistency: Math.round(consistency)
    }
  }

  /**
   * 生成智能学习建议
   */
  private generateSmartRecommendations(
    wordStats: any,
    lessonStats: any,
    timeStats: any,
    efficiency: any
  ) {
    const actions: Array<{ type: 'word' | 'lesson' | 'exercise'; id: string; reason: string }> = []
    
    // 判断学习优先级
    let priority: 'review' | 'new' | 'rest' = 'new'
    let message = ''

    // 如果有待复习单词，优先复习
    if (wordStats.needReview > 0) {
      priority = 'review'
      message = `你有 ${wordStats.needReview} 个单词需要复习，建议先完成复习以巩固记忆`
      actions.push({
        type: 'word',
        id: 'review',
        reason: '避免遗忘，巩固已学知识'
      })
    }
    // 如果今天学习时间过长，建议休息
    else if (timeStats.today > 7200) { // 超过2小时
      priority = 'rest'
      message = '今天学习时间已经很长了，建议休息一下，避免过度疲劳'
    }
    // 如果效率较低，建议复习
    else if (efficiency.accuracy < 60) {
      priority = 'review'
      message = '最近正确率较低，建议复习已学内容，打好基础'
      actions.push({
        type: 'word',
        id: 'review',
        reason: '提高准确率，巩固基础'
      })
    }
    // 否则学习新内容
    else {
      priority = 'new'
      if (wordStats.newToday > 0) {
        message = `今天还有 ${wordStats.newToday} 个新单词可以学习`
        actions.push({
          type: 'word',
          id: 'new',
          reason: '扩展词汇量'
        })
      }
      if (lessonStats.recommended.length > 0) {
        message += `，推荐学习课程：${lessonStats.recommended[0]}`
        actions.push({
          type: 'lesson',
          id: lessonStats.recommended[0],
          reason: '系统化学习新知识'
        })
      }
    }

    return { priority, message, actions }
  }

  /**
   * 获取推荐课程
   */
  private getRecommendedLessons(userId: string, completedCount: number): string[] {
    // 根据完成数量推荐下一个课程
    const allLessons = ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-5']
    return allLessons.slice(completedCount, completedCount + 3)
  }

  /**
   * 计算本周学习时间
   */
  private getWeekStudyTime(userId: string): number {
    if (typeof window === 'undefined') return 0
    
    let total = 0
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const stored = localStorage.getItem(`wenya_study_session_${userId}_${dateStr}`)
      if (stored) {
        const session = JSON.parse(stored)
        total += session.studyTime || 0
      }
    }
    
    return total
  }

  /**
   * 计算总学习时间
   */
  private getTotalStudyTime(userId: string): number {
    if (typeof window === 'undefined') return 0
    
    const data = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`)
    if (data) {
      const parsed = JSON.parse(data)
      return parsed.totalStudyTime || 0
    }
    return 0
  }

  /**
   * 计算下次学习时间
   */
  private calculateNextStudyTime(userWords: any[], streak: number): Date {
    const now = new Date()
    
    // 如果有待复习单词，返回最早的复习时间
    const nextReview = userWords
      .filter(w => new Date(w.nextReviewTime) > now)
      .sort((a, b) => new Date(a.nextReviewTime).getTime() - new Date(b.nextReviewTime).getTime())[0]
    
    if (nextReview) {
      return new Date(nextReview.nextReviewTime)
    }
    
    // 否则建议明天同一时间
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  }

  /**
   * 获取成就数据
   */
  private getAchievements(wordStats: any, lessonStats: any, timeStats: any) {
    return [
      {
        id: 'first-word',
        title: '初识单词',
        progress: Math.min(100, (wordStats.total / 10) * 100),
        unlocked: wordStats.total >= 10
      },
      {
        id: 'word-master',
        title: '单词大师',
        progress: Math.min(100, (wordStats.mastered / 100) * 100),
        unlocked: wordStats.mastered >= 100
      },
      {
        id: 'lesson-complete',
        title: '课程达人',
        progress: Math.min(100, (lessonStats.completed / 10) * 100),
        unlocked: lessonStats.completed >= 10
      },
      {
        id: 'streak-7',
        title: '坚持一周',
        progress: Math.min(100, (timeStats.streak / 7) * 100),
        unlocked: timeStats.streak >= 7
      },
      {
        id: 'streak-30',
        title: '坚持一月',
        progress: Math.min(100, (timeStats.streak / 30) * 100),
        unlocked: timeStats.streak >= 30
      }
    ]
  }

  /**
   * 记录学习活动（实时更新）
   */
  recordLearningActivity(userId: string, activity: {
    type: 'word' | 'lesson' | 'exercise'
    id: string
    duration: number
    success: boolean
  }): void {
    if (typeof window === 'undefined') return

    const key = `${this.STORAGE_KEY}_${userId}`
    const data = localStorage.getItem(key)
    const current = data ? JSON.parse(data) : { totalStudyTime: 0, activities: [] }

    current.totalStudyTime += activity.duration
    current.activities.push({
      ...activity,
      timestamp: new Date().toISOString()
    })

    // 只保留最近100条记录
    if (current.activities.length > 100) {
      current.activities = current.activities.slice(-100)
    }

    localStorage.setItem(key, JSON.stringify(current))
  }

  /**
   * 检查是否需要复习提醒
   */
  shouldShowReviewReminder(userId: string): boolean {
    const reviewWords = srsService.getTodayReviewWords(userId)
    const todaySession = srsService.getTodaySession(userId)
    
    // 如果有待复习单词且今天还没学习，显示提醒
    return reviewWords.length > 0 && todaySession.totalWords === 0
  }

  /**
   * 获取学习建议文本
   */
  getStudyAdvice(data: SmartLearningData): string[] {
    const advice: string[] = []

    // 基于效率给建议
    if (data.efficiency.accuracy < 70) {
      advice.push('💡 建议：放慢学习节奏，重点复习已学内容')
    } else if (data.efficiency.accuracy >= 90) {
      advice.push('🎉 太棒了！你的正确率很高，可以尝试更多新内容')
    }

    // 基于连续学习天数
    if (data.timeStats.streak === 0) {
      advice.push('🌱 开始你的学习之旅吧！')
    } else if (data.timeStats.streak >= 7) {
      advice.push(`🔥 已连续学习 ${data.timeStats.streak} 天，继续保持！`)
    }

    // 基于待复习单词
    if (data.wordStats.needReview > 10) {
      advice.push(`⏰ 有 ${data.wordStats.needReview} 个单词等待复习，及时复习效果更好`)
    }

    // 基于学习时间
    if (data.timeStats.today < 600) { // 少于10分钟
      advice.push('⏱️ 今天学习时间较短，建议至少学习20分钟')
    }

    return advice
  }
}

export const smartLearningService = new SmartLearningService()
