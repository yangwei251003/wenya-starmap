// 学习进度追踪服务

import {
  Progress,
  LearningStats,
  LearningSession,
  User,
  StarAchievement,
  EnglishLevel
} from '@/types'

/**
 * 进度追踪数据接口
 */
export interface ProgressData {
  userId: string
  sessions: LearningSession[]
  progress: Progress[]
  achievements: StarAchievement[]
}

/**
 * 学习趋势数据
 */
export interface LearningTrend {
  date: string
  studyTime: number
  lessonsCompleted: number
  averageScore: number
}

/**
 * 进度分析结果
 */
export interface ProgressAnalysis {
  stats: LearningStats
  trends: LearningTrend[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  projectedCompletion?: Date
}

/**
 * 进度追踪服务类
 */
export class ProgressTrackingService {
  /**
   * 计算学习统计数据
   */
  calculateStats(data: ProgressData): LearningStats {
    const { sessions, progress, achievements } = data

    // 计算总学习时长
    const totalStudyTime = sessions.reduce((sum, session) => sum + session.timeSpent, 0)

    // 计算完成的课程数
    const lessonsCompleted = progress.filter(p => p.status === 'completed').length

    // 计算完成的练习数
    const exercisesCompleted = sessions.reduce(
      (sum, session) => sum + session.exercisesCompleted.length,
      0
    )

    // 计算平均分数
    const completedProgress = progress.filter(p => p.status === 'completed' && p.score !== undefined)
    const averageScore = completedProgress.length > 0
      ? completedProgress.reduce((sum, p) => sum + (p.score || 0), 0) / completedProgress.length
      : 0

    // 计算连续学习天数
    const currentStreak = this.calculateStreak(sessions)

    // 计算等级进度
    const levelProgress = this.calculateLevelProgress(progress, lessonsCompleted)

    return {
      totalStudyTime,
      lessonsCompleted,
      exercisesCompleted,
      averageScore: Math.round(averageScore),
      currentStreak,
      totalAchievements: achievements.length,
      levelProgress
    }
  }

  /**
   * 计算连续学习天数
   */
  private calculateStreak(sessions: LearningSession[]): number {
    if (sessions.length === 0) return 0

    // 按日期排序
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.startTime)
      sessionDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor(
        (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDiff === streak) {
        streak++
      } else if (daysDiff > streak) {
        break
      }
    }

    return streak
  }

  /**
   * 计算等级进度
   */
  private calculateLevelProgress(progress: Progress[], lessonsCompleted: number): number {
    // 简单实现：基于完成的课程数
    // 假设每个等级需要完成30节课
    const lessonsPerLevel = 30
    const progressInLevel = lessonsCompleted % lessonsPerLevel
    return Math.round((progressInLevel / lessonsPerLevel) * 100)
  }

  /**
   * 分析学习趋势
   */
  analyzeTrends(sessions: LearningSession[], days: number = 7): LearningTrend[] {
    const trends: Map<string, LearningTrend> = new Map()
    const now = new Date()
    let anchorDate = now

    if (sessions.length > 0) {
      const latestSessionDate = new Date(Math.max(
        ...sessions.map(session => new Date(session.startTime).getTime())
      ))
      const windowStart = new Date(now)
      windowStart.setHours(0, 0, 0, 0)
      windowStart.setDate(windowStart.getDate() - (days - 1))

      if (latestSessionDate < windowStart || latestSessionDate > now) {
        anchorDate = latestSessionDate
      }
    }

    // 初始化最近N天的数据
    for (let i = 0; i < days; i++) {
      const date = new Date(anchorDate)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      trends.set(dateStr, {
        date: dateStr,
        studyTime: 0,
        lessonsCompleted: 0,
        averageScore: 0
      })
    }

    // 聚合会话数据
    const scoresByDate: Map<string, number[]> = new Map()

    sessions.forEach(session => {
      const dateStr = new Date(session.startTime).toISOString().split('T')[0]
      const trend = trends.get(dateStr)

      if (trend) {
        trend.studyTime += session.timeSpent
        trend.lessonsCompleted += session.lessonsCompleted.length

        // 收集分数
        if (!scoresByDate.has(dateStr)) {
          scoresByDate.set(dateStr, [])
        }
        scoresByDate.get(dateStr)!.push(session.totalScore)
      }
    })

    // 计算平均分数
    scoresByDate.forEach((scores, dateStr) => {
      const trend = trends.get(dateStr)
      if (trend && scores.length > 0) {
        trend.averageScore = Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length
        )
      }
    })

    return Array.from(trends.values()).reverse()
  }

  /**
   * 执行完整的进度分析
   */
  analyzeProgress(data: ProgressData): ProgressAnalysis {
    const stats = this.calculateStats(data)
    const trends = this.analyzeTrends(data.sessions)

    // 分析优势和劣势
    const { strengths, weaknesses } = this.analyzePerformance(data.progress)

    // 生成建议
    const recommendations = this.generateRecommendations(stats, strengths, weaknesses)

    // 预测完成时间
    const projectedCompletion = this.projectCompletion(trends, data.progress.length)

    return {
      stats,
      trends,
      strengths,
      weaknesses,
      recommendations,
      projectedCompletion
    }
  }

  /**
   * 分析学习表现
   */
  private analyzePerformance(progress: Progress[]): {
    strengths: string[]
    weaknesses: string[]
  } {
    const strengths: string[] = []
    const weaknesses: string[] = []

    // 按课程类型分组分析（这里简化处理）
    const completedProgress = progress.filter(p => p.status === 'completed' && p.score !== undefined)

    if (completedProgress.length === 0) {
      return { strengths, weaknesses }
    }

    const averageScore = completedProgress.reduce((sum, p) => sum + (p.score || 0), 0) / completedProgress.length

    // 分析完成速度
    const averageTime = completedProgress.reduce((sum, p) => sum + p.timeSpent, 0) / completedProgress.length

    if (averageScore >= 85) {
      strengths.push('整体表现优秀')
    } else if (averageScore < 60) {
      weaknesses.push('需要加强基础知识')
    }

    if (averageTime < 1800) { // 30分钟
      strengths.push('学习效率高')
    }

    // 分析一致性
    const scores = completedProgress.map(p => p.score || 0)
    const variance = this.calculateVariance(scores)

    if (variance < 100) {
      strengths.push('学习表现稳定')
    } else if (variance > 400) {
      weaknesses.push('学习表现波动较大')
    }

    return { strengths, weaknesses }
  }

  /**
   * 计算方差
   */
  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0

    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2))
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / numbers.length
  }

  /**
   * 生成学习建议
   */
  private generateRecommendations(
    stats: LearningStats,
    strengths: string[],
    weaknesses: string[]
  ): string[] {
    const recommendations: string[] = []

    // 基于学习时长
    if (stats.totalStudyTime < 3600) { // 少于1小时
      recommendations.push('建议增加每日学习时间，保持至少30分钟的学习')
    }

    // 基于连续学习
    if (stats.currentStreak < 3) {
      recommendations.push('尝试建立每日学习习惯，连续学习能显著提升效果')
    } else if (stats.currentStreak >= 7) {
      recommendations.push('保持良好的学习习惯！继续坚持')
    }

    // 基于平均分数
    if (stats.averageScore < 70) {
      recommendations.push('建议复习已学内容，巩固基础知识')
    } else if (stats.averageScore >= 90) {
      recommendations.push('表现优秀！可以尝试更高难度的内容')
    }

    // 基于劣势
    if (weaknesses.includes('需要加强基础知识')) {
      recommendations.push('专注于基础课程，打好基础很重要')
    }

    if (weaknesses.includes('学习表现波动较大')) {
      recommendations.push('保持稳定的学习节奏，避免过度疲劳')
    }

    // 如果没有特别建议，给出通用建议
    if (recommendations.length === 0) {
      recommendations.push('继续保持当前的学习节奏')
      recommendations.push('尝试挑战新的学习内容')
    }

    return recommendations
  }

  /**
   * 预测完成时间
   */
  private projectCompletion(trends: LearningTrend[], totalLessons: number): Date | undefined {
    if (trends.length < 3) return undefined

    // 计算最近的学习速度（课程/天）
    const recentTrends = trends.slice(-7)
    const averageLessonsPerDay = recentTrends.reduce(
      (sum, t) => sum + t.lessonsCompleted,
      0
    ) / recentTrends.length

    if (averageLessonsPerDay === 0) return undefined

    // 假设还需要完成的课程数
    const remainingLessons = Math.max(0, totalLessons - trends.reduce((sum, t) => sum + t.lessonsCompleted, 0))

    // 预测天数
    const daysToComplete = Math.ceil(remainingLessons / averageLessonsPerDay)

    const completionDate = new Date()
    completionDate.setDate(completionDate.getDate() + daysToComplete)

    return completionDate
  }

  /**
   * 记录学习会话
   */
  recordSession(session: LearningSession): void {
    // 在实际应用中，这里应该保存到数据库或本地存储
    console.log('Recording session:', session)
  }

  /**
   * 更新进度
   */
  updateProgress(progress: Progress): void {
    // 在实际应用中，这里应该保存到数据库或本地存储
    console.log('Updating progress:', progress)
  }
}

/**
 * 创建进度追踪服务实例
 */
export function createProgressTrackingService(): ProgressTrackingService {
  return new ProgressTrackingService()
}

/**
 * 默认进度追踪服务实例
 */
export const progressTrackingService = createProgressTrackingService()
