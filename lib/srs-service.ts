/**
 * SRS (Spaced Repetition System) 间隔重复算法服务
 * 基于 SuperMemo-2 算法实现
 */

import { Word, UserWord, ReviewQuality, StudySession, WordProgress } from '@/types'
import { wordsData, getWordById } from './words-data'
import { wordRecordService } from './word-record-service'

// SRS 配置
const SRS_CONFIG = {
  INITIAL_INTERVAL: 1,        // 初始间隔（天）
  INITIAL_EASE_FACTOR: 2.5,   // 初始难度因子
  MIN_EASE_FACTOR: 1.3,       // 最小难度因子
  DAILY_NEW_WORDS: 10,        // 每日新词数量
  DAILY_REVIEW_LIMIT: 50,     // 每日复习上限
}

class SRSService {
  private userWordsKey = 'wenya_user_words'
  private sessionKey = 'wenya_study_session'

  // ==================== SuperMemo-2 算法核心 ====================

  /**
   * 计算下次复习时间
   * @param userWord 用户单词记录
   * @param quality 复习质量 (0:不认识, 1:模糊, 2:认识)
   */
  calculateNextReview(userWord: UserWord, quality: ReviewQuality): UserWord {
    let { interval, easeFactor, repetitions } = userWord

    if (quality === 0) {
      // 不认识：重置间隔，从头开始
      repetitions = 0
      interval = 1
    } else if (quality === 1) {
      // 模糊：间隔减半，但不重置
      interval = Math.max(1, Math.floor(interval * 0.5))
      easeFactor = Math.max(SRS_CONFIG.MIN_EASE_FACTOR, easeFactor - 0.2)
    } else {
      // 认识：正常推进
      repetitions += 1
      if (repetitions === 1) {
        interval = 1
      } else if (repetitions === 2) {
        interval = 3
      } else {
        interval = Math.round(interval * easeFactor)
      }
      easeFactor = Math.max(SRS_CONFIG.MIN_EASE_FACTOR, easeFactor + 0.1)
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

  // ==================== 用户单词管理 ====================

  /**
   * 获取用户所有单词记录
   */
  getUserWords(userId: string): UserWord[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(`${this.userWordsKey}_${userId}`)
    return stored ? JSON.parse(stored) : []
  }

  /**
   * 保存用户单词记录
   */
  private saveUserWords(userId: string, words: UserWord[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(`${this.userWordsKey}_${userId}`, JSON.stringify(words))
  }

  /**
   * 获取或创建用户单词记录
   */
  getOrCreateUserWord(userId: string, wordId: string): UserWord {
    const userWords = this.getUserWords(userId)
    let userWord = userWords.find(uw => uw.wordId === wordId)

    if (!userWord) {
      userWord = {
        userId,
        wordId,
        nextReviewTime: new Date(),
        interval: SRS_CONFIG.INITIAL_INTERVAL,
        quality: 0,
        easeFactor: SRS_CONFIG.INITIAL_EASE_FACTOR,
        repetitions: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      userWords.push(userWord)
      this.saveUserWords(userId, userWords)
    }

    return userWord
  }

  /**
   * 更新用户单词记录
   */
  updateUserWord(userId: string, userWord: UserWord): void {
    const userWords = this.getUserWords(userId)
    const index = userWords.findIndex(uw => uw.wordId === userWord.wordId)
    
    if (index !== -1) {
      userWords[index] = userWord
    } else {
      userWords.push(userWord)
    }
    
    this.saveUserWords(userId, userWords)
  }

  // ==================== 学习队列管理 ====================

  /**
   * 获取今日待复习单词
   */
  getTodayReviewWords(userId: string): Word[] {
    const userWords = this.getUserWords(userId)
    const now = new Date()
    
    // 筛选需要复习的单词
    const dueWords = userWords
      .filter(uw => new Date(uw.nextReviewTime) <= now)
      .sort((a, b) => new Date(a.nextReviewTime).getTime() - new Date(b.nextReviewTime).getTime())
      .slice(0, SRS_CONFIG.DAILY_REVIEW_LIMIT)

    return dueWords
      .map(uw => getWordById(uw.wordId))
      .filter((w): w is Word => w !== undefined)
  }

  /**
   * 获取今日新词
   */
  getTodayNewWords(userId: string): Word[] {
    const userWords = this.getUserWords(userId)
    const learnedWordIds = new Set(userWords.map(uw => uw.wordId))
    
    // 获取未学习的单词
    const newWords = wordsData
      .filter(w => !learnedWordIds.has(w.id))
      .slice(0, SRS_CONFIG.DAILY_NEW_WORDS)

    return newWords
  }

  /**
   * 获取下一个待学习单词
   */
  getNextWord(userId: string): { word: Word; isNew: boolean } | null {
    // 优先复习
    const reviewWords = this.getTodayReviewWords(userId)
    if (reviewWords.length > 0) {
      return { word: reviewWords[0], isNew: false }
    }

    // 然后学新词
    const newWords = this.getTodayNewWords(userId)
    if (newWords.length > 0) {
      return { word: newWords[0], isNew: true }
    }

    return null
  }

  // ==================== 复习提交 ====================

  /**
   * 提交复习结果
   */
  submitReview(userId: string, wordId: string, quality: ReviewQuality): UserWord {
    let userWord = this.getOrCreateUserWord(userId, wordId)
    userWord = this.calculateNextReview(userWord, quality)
    this.updateUserWord(userId, userWord)
    
    // 更新今日学习统计
    this.updateTodaySession(userId, quality)
    
    // 同步到记忆驾驶舱的 WordRecord 系统
    // 将 ReviewQuality (0, 1, 2) 映射到 FSRS grade (1, 2, 3, 4)
    const fsrsGrade = this.mapQualityToGrade(quality)
    wordRecordService.updateWordRecordAfterReview(userId, wordId, fsrsGrade, 0)
    
    return userWord
  }

  /**
   * 将 ReviewQuality 映射到 FSRS grade
   * ReviewQuality: 0=不认识, 1=模糊, 2=认识
   * FSRS Grade: 1=完全忘记, 2=困难, 3=良好, 4=轻松
   */
  private mapQualityToGrade(quality: ReviewQuality): 1 | 2 | 3 | 4 {
    switch (quality) {
      case 0: return 1  // 不认识 -> 完全忘记
      case 1: return 2  // 模糊 -> 困难
      case 2: return 4  // 认识 -> 轻松
      default: return 3 // 默认良好
    }
  }

  // ==================== 学习统计 ====================

  /**
   * 获取今日学习会话
   */
  getTodaySession(userId: string): StudySession {
    if (typeof window === 'undefined') {
      return this.createEmptySession(userId)
    }

    const today = new Date().toISOString().split('T')[0]
    const stored = localStorage.getItem(`${this.sessionKey}_${userId}_${today}`)
    
    if (stored) {
      return JSON.parse(stored)
    }
    
    return this.createEmptySession(userId)
  }

  /**
   * 创建空会话
   */
  private createEmptySession(userId: string): StudySession {
    return {
      userId,
      date: new Date().toISOString().split('T')[0],
      totalWords: 0,
      newWords: 0,
      reviewedWords: 0,
      correctCount: 0,
      wrongCount: 0,
      studyTime: 0
    }
  }

  /**
   * 更新今日会话
   */
  private updateTodaySession(userId: string, quality: ReviewQuality): void {
    const session = this.getTodaySession(userId)
    
    session.totalWords += 1
    if (quality === 2) {
      session.correctCount += 1
    } else {
      session.wrongCount += 1
    }
    
    const today = new Date().toISOString().split('T')[0]
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${this.sessionKey}_${userId}_${today}`, JSON.stringify(session))
    }
  }

  /**
   * 获取学习进度
   */
  getProgress(userId: string): WordProgress {
    const userWords = this.getUserWords(userId)
    const session = this.getTodaySession(userId)
    const reviewWords = this.getTodayReviewWords(userId)
    const newWords = this.getTodayNewWords(userId)
    
    // 计算已掌握单词（间隔超过7天）
    const mastered = userWords.filter(uw => uw.interval >= 7).length
    
    // 计算连续学习天数
    const streak = this.calculateStreak(userId)

    return {
      todayTotal: reviewWords.length + newWords.length,
      todayCompleted: session.totalWords,
      todayNew: newWords.length,
      todayReview: reviewWords.length,
      streak,
      totalMastered: mastered
    }
  }

  /**
   * 计算连续学习天数
   */
  private calculateStreak(userId: string): number {
    if (typeof window === 'undefined') return 0
    
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const stored = localStorage.getItem(`${this.sessionKey}_${userId}_${dateStr}`)
      if (stored) {
        const session: StudySession = JSON.parse(stored)
        if (session.totalWords > 0) {
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

  /**
   * 播放音效
   */
  playSound(type: 'correct' | 'wrong'): void {
    if (typeof window === 'undefined') return
    
    // 使用 Web Audio API 生成简单音效
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    if (type === 'correct') {
      // Ding 音效
      oscillator.frequency.value = 880
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    } else {
      // 低沉音效
      oscillator.frequency.value = 220
      oscillator.type = 'square'
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
    }
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  }
}

export const srsService = new SRSService()
