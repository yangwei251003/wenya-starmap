/**
 * 增强版SRS服务 - 参考"不背单词"APP
 * 支持多组学习计划、自定义每组单词数、无限学习模式
 */

import { Word, UserWord, ReviewQuality } from '@/types'
import { wordsData, getWordById } from './words-data'
import { wordRecordService } from './word-record-service'

// 学习计划配置
export interface StudyPlanConfig {
  wordsPerGroup: number      // 每组单词数（默认20）
  newWordsPerGroup: number    // 每组新词数（默认10）
  reviewWordsPerGroup: number // 每组复习词数（默认10）
  unlimitedMode: boolean      // 无限学习模式
  autoNextGroup: boolean      // 自动进入下一组
}

// 学习组状态
export interface StudyGroup {
  groupId: string
  words: Word[]
  isNew: boolean[]
  completed: number
  total: number
  startTime: Date
  endTime?: Date
}

// 学习统计
export interface StudyStats {
  todayGroups: number         // 今日完成组数
  todayWords: number          // 今日学习单词数
  todayNewWords: number       // 今日新词数
  todayReviewWords: number    // 今日复习词数
  todayCorrect: number        // 今日正确数
  todayWrong: number          // 今日错误数
  accuracy: number            // 正确率
  streak: number              // 连续学习天数
  totalMastered: number       // 总掌握单词数
}

class EnhancedSRSService {
  private readonly STORAGE_PREFIX = 'wenya_enhanced_'
  private readonly DEFAULT_CONFIG: StudyPlanConfig = {
    wordsPerGroup: 20,
    newWordsPerGroup: 10,
    reviewWordsPerGroup: 10,
    unlimitedMode: true,
    autoNextGroup: false
  }

  // ==================== 配置管理 ====================

  /**
   * 获取用户学习配置
   */
  getConfig(userId: string): StudyPlanConfig {
    if (typeof window === 'undefined') return this.DEFAULT_CONFIG
    
    const stored = localStorage.getItem(`${this.STORAGE_PREFIX}config_${userId}`)
    return stored ? JSON.parse(stored) : this.DEFAULT_CONFIG
  }

  /**
   * 保存用户学习配置
   */
  saveConfig(userId: string, config: StudyPlanConfig): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(`${this.STORAGE_PREFIX}config_${userId}`, JSON.stringify(config))
  }

  // ==================== 单词管理 ====================

  /**
   * 获取用户所有单词记录
   */
  getUserWords(userId: string): UserWord[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(`${this.STORAGE_PREFIX}words_${userId}`)
    return stored ? JSON.parse(stored) : []
  }

  /**
   * 保存用户单词记录
   */
  private saveUserWords(userId: string, words: UserWord[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(`${this.STORAGE_PREFIX}words_${userId}`, JSON.stringify(words))
  }

  /**
   * 获取待复习单词（所有到期的）
   */
  getReviewWords(userId: string): Word[] {
    const userWords = this.getUserWords(userId)
    const now = new Date()
    
    const dueWords = userWords
      .filter(uw => new Date(uw.nextReviewTime) <= now)
      .sort((a, b) => new Date(a.nextReviewTime).getTime() - new Date(b.nextReviewTime).getTime())

    return dueWords
      .map(uw => getWordById(uw.wordId))
      .filter((w): w is Word => w !== undefined)
  }

  /**
   * 获取新词（未学习的）
   */
  getNewWords(userId: string, limit?: number): Word[] {
    const userWords = this.getUserWords(userId)
    const learnedWordIds = new Set(userWords.map(uw => uw.wordId))
    
    const newWords = wordsData.filter(w => !learnedWordIds.has(w.id))
    
    return limit ? newWords.slice(0, limit) : newWords
  }

  // ==================== 学习组管理 ====================

  /**
   * 创建新的学习组
   */
  createStudyGroup(userId: string): StudyGroup | null {
    const config = this.getConfig(userId)
    const reviewWords = this.getReviewWords(userId)
    const newWords = this.getNewWords(userId)

    // 优先复习词
    const reviewCount = Math.min(config.reviewWordsPerGroup, reviewWords.length)
    const newCount = Math.min(
      config.newWordsPerGroup,
      config.wordsPerGroup - reviewCount,
      newWords.length
    )

    // 如果没有单词可学，返回null
    if (reviewCount === 0 && newCount === 0) {
      return null
    }

    const groupWords: Word[] = []
    const isNewFlags: boolean[] = []

    // 添加复习词
    for (let i = 0; i < reviewCount; i++) {
      groupWords.push(reviewWords[i])
      isNewFlags.push(false)
    }

    // 添加新词
    for (let i = 0; i < newCount; i++) {
      groupWords.push(newWords[i])
      isNewFlags.push(true)
    }

    // 打乱顺序（可选）
    const shuffled = this.shuffleArray(groupWords.map((w, i) => ({ word: w, isNew: isNewFlags[i] })))

    const group: StudyGroup = {
      groupId: `group_${Date.now()}`,
      words: shuffled.map(s => s.word),
      isNew: shuffled.map(s => s.isNew),
      completed: 0,
      total: shuffled.length,
      startTime: new Date()
    }

    // 保存当前学习组
    this.saveCurrentGroup(userId, group)
    
    return group
  }

  /**
   * 获取当前学习组
   */
  getCurrentGroup(userId: string): StudyGroup | null {
    if (typeof window === 'undefined') return null
    
    const stored = localStorage.getItem(`${this.STORAGE_PREFIX}current_group_${userId}`)
    return stored ? JSON.parse(stored) : null
  }

  /**
   * 保存当前学习组
   */
  private saveCurrentGroup(userId: string, group: StudyGroup | null): void {
    if (typeof window === 'undefined') return
    
    if (group) {
      localStorage.setItem(`${this.STORAGE_PREFIX}current_group_${userId}`, JSON.stringify(group))
    } else {
      localStorage.removeItem(`${this.STORAGE_PREFIX}current_group_${userId}`)
    }
  }

  /**
   * 获取下一个待学习单词
   */
  getNextWordInGroup(userId: string): { word: Word; isNew: boolean; progress: { current: number; total: number } } | null {
    const group = this.getCurrentGroup(userId)
    
    if (!group || group.completed >= group.total) {
      return null
    }

    return {
      word: group.words[group.completed],
      isNew: group.isNew[group.completed],
      progress: {
        current: group.completed + 1,
        total: group.total
      }
    }
  }

  /**
   * 提交单词复习结果
   */
  submitWordReview(userId: string, wordId: string, quality: ReviewQuality): void {
    // 更新用户单词记录
    let userWords = this.getUserWords(userId)
    let userWord = userWords.find(uw => uw.wordId === wordId)

    if (!userWord) {
      userWord = {
        userId,
        wordId,
        nextReviewTime: new Date(),
        interval: 1,
        quality: 0,
        easeFactor: 2.5,
        repetitions: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      userWords.push(userWord)
    }

    // 使用SuperMemo-2算法计算下次复习时间
    userWord = this.calculateNextReview(userWord, quality)
    
    const index = userWords.findIndex(uw => uw.wordId === wordId)
    if (index !== -1) {
      userWords[index] = userWord
    }
    
    this.saveUserWords(userId, userWords)

    // 更新当前学习组进度
    const group = this.getCurrentGroup(userId)
    if (group) {
      group.completed++
      
      if (group.completed >= group.total) {
        group.endTime = new Date()
      }
      
      this.saveCurrentGroup(userId, group)
    }

    // 更新今日统计
    this.updateTodayStats(userId, quality)

    // 同步到FSRS系统
    const fsrsGrade = this.mapQualityToGrade(quality)
    wordRecordService.updateWordRecordAfterReview(userId, wordId, fsrsGrade, 0)
    
    // 同步到智能学习系统
    if (typeof window !== 'undefined') {
      const { smartLearningService } = require('./smart-learning-service')
      smartLearningService.recordLearningActivity(userId, {
        type: 'word' as const,
        id: wordId,
        duration: 5,
        success: quality === 2
      })
    }
  }

  /**
   * 完成当前学习组
   */
  completeCurrentGroup(userId: string): void {
    const group = this.getCurrentGroup(userId)
    if (group) {
      group.endTime = new Date()
      
      // 更新今日组数统计
      const stats = this.getTodayStats(userId)
      stats.todayGroups++
      this.saveTodayStats(userId, stats)
      
      // 清除当前组
      this.saveCurrentGroup(userId, null)
    }
  }

  // ==================== SuperMemo-2 算法 ====================

  private calculateNextReview(userWord: UserWord, quality: ReviewQuality): UserWord {
    let { interval, easeFactor, repetitions } = userWord

    if (quality === 0) {
      repetitions = 0
      interval = 1
    } else if (quality === 1) {
      interval = Math.max(1, Math.floor(interval * 0.5))
      easeFactor = Math.max(1.3, easeFactor - 0.2)
    } else {
      repetitions += 1
      if (repetitions === 1) {
        interval = 1
      } else if (repetitions === 2) {
        interval = 3
      } else {
        interval = Math.round(interval * easeFactor)
      }
      easeFactor = Math.max(1.3, easeFactor + 0.1)
    }

    const nextReviewTime = new Date()
    nextReviewTime.setDate(nextReviewTime.getDate() + interval)

    return {
      ...userWord,
      interval,
      easeFactor,
      repetitions,
      quality,
      nextReviewTime,
      updatedAt: new Date()
    }
  }

  private mapQualityToGrade(quality: ReviewQuality): 1 | 2 | 3 | 4 {
    switch (quality) {
      case 0: return 1
      case 1: return 2
      case 2: return 4
      default: return 3
    }
  }

  // ==================== 统计数据 ====================

  /**
   * 获取今日统计
   */
  getTodayStats(userId: string): StudyStats {
    if (typeof window === 'undefined') {
      return this.createEmptyStats()
    }

    const today = new Date().toISOString().split('T')[0]
    const stored = localStorage.getItem(`${this.STORAGE_PREFIX}stats_${userId}_${today}`)
    
    if (stored) {
      return JSON.parse(stored)
    }
    
    return this.createEmptyStats()
  }

  private createEmptyStats(): StudyStats {
    return {
      todayGroups: 0,
      todayWords: 0,
      todayNewWords: 0,
      todayReviewWords: 0,
      todayCorrect: 0,
      todayWrong: 0,
      accuracy: 0,
      streak: 0,
      totalMastered: 0
    }
  }

  private saveTodayStats(userId: string, stats: StudyStats): void {
    if (typeof window === 'undefined') return
    
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`${this.STORAGE_PREFIX}stats_${userId}_${today}`, JSON.stringify(stats))
  }

  private updateTodayStats(userId: string, quality: ReviewQuality): void {
    const stats = this.getTodayStats(userId)
    
    stats.todayWords++
    if (quality === 2) {
      stats.todayCorrect++
    } else {
      stats.todayWrong++
    }
    
    stats.accuracy = stats.todayWords > 0 
      ? Math.round((stats.todayCorrect / stats.todayWords) * 100)
      : 0
    
    this.saveTodayStats(userId, stats)
  }

  /**
   * 获取完整学习数据
   */
  getFullStats(userId: string): StudyStats {
    const stats = this.getTodayStats(userId)
    const userWords = this.getUserWords(userId)
    
    stats.totalMastered = userWords.filter(uw => uw.interval >= 7).length
    stats.streak = this.calculateStreak(userId)
    
    return stats
  }

  private calculateStreak(userId: string): number {
    if (typeof window === 'undefined') return 0
    
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const stored = localStorage.getItem(`${this.STORAGE_PREFIX}stats_${userId}_${dateStr}`)
      if (stored) {
        const dayStats: StudyStats = JSON.parse(stored)
        if (dayStats.todayWords > 0) {
          streak++
        } else {
          break
        }
      } else if (i > 0) {
        break
      }
    }
    
    return streak
  }

  // ==================== 工具方法 ====================

  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }

  /**
   * 播放音效
   */
  playSound(type: 'correct' | 'wrong'): void {
    if (typeof window === 'undefined') return
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      if (type === 'correct') {
        oscillator.frequency.value = 880
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      } else {
        oscillator.frequency.value = 220
        oscillator.type = 'square'
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      }
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.error('Audio playback error:', error)
    }
  }
}

export const enhancedSRSService = new EnhancedSRSService()
