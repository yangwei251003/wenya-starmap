/**
 * Word Record Service
 * 
 * Manages word learning records using FSRS algorithm for memory dashboard.
 * Handles CRUD operations and automatic updates after user exercises.
 */

import { WordRecord, MemoryStudySession, WordRecordStatus } from '@/types'
import { calculateRetrievability, updateMemoryParams, calculateNextReview } from './fsrs-algorithm'
import { SecureStorage } from './security'

export class WordRecordService {
  private readonly storageKey = 'wenya_word_records'
  private readonly sessionKey = 'wenya_memory_sessions'

  /**
   * Get all word records for a user
   */
  getWordRecords(userId: string): WordRecord[] {
    if (typeof window === 'undefined') return []
    
    try {
      const records = SecureStorage.getItem<WordRecord[]>(`${this.storageKey}_${userId}`)
      if (!records) return []

      return records.map(record => this.hydrateWordRecord(record))
    } catch (error) {
      console.error('Failed to get word records:', error)
      return []
    }
  }

  /**
   * Get a specific word record
   */
  getWordRecord(userId: string, wordId: string): WordRecord | null {
    const records = this.getWordRecords(userId)
    return records.find(record => record.wordId === wordId) || null
  }

  /**
   * Create a new word record
   */
  createWordRecord(userId: string, wordId: string): WordRecord {
    const now = new Date()
    const record: WordRecord = {
      id: `${userId}_${wordId}_${Date.now()}`,
      userId,
      wordId,
      status: 'new',
      stability: 1.0,           // Initial stability: 1 day
      difficulty: 0.5,          // Initial difficulty: medium
      retrievability: 1.0,      // New words start at 100% retrievability
      nextReviewDate: now,      // Available for immediate review
      lastReviewDate: now,
      createdAt: now,
      reviewCount: 0,
      correctCount: 0,
      lapseCount: 0
    }

    this.saveWordRecord(record)
    return record
  }

  /**
   * Update word record after a review session
   */
  updateWordRecordAfterReview(
    userId: string, 
    wordId: string, 
    grade: 1 | 2 | 3 | 4,
    responseTime: number = 0
  ): WordRecord {
    let record = this.getWordRecord(userId, wordId)
    
    // Create new record if it doesn't exist
    if (!record) {
      record = this.createWordRecord(userId, wordId)
    }

    const now = new Date()
    const elapsedDays = (now.getTime() - record.lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)

    // Update memory parameters using FSRS algorithm
    const { newStability, newDifficulty } = updateMemoryParams(
      record.stability,
      record.difficulty,
      grade
    )

    // Calculate new retrievability
    const newRetrievability = calculateRetrievability(newStability, 0) // 0 elapsed time = just reviewed

    // Calculate next review date
    const nextReviewDate = calculateNextReview(newStability, 0.9) // 90% target retention

    // Update status based on performance and review count
    let newStatus: WordRecordStatus = record.status
    if (record.status === 'new' && grade >= 3) {
      newStatus = 'learning'
    } else if (record.status === 'learning' && record.reviewCount >= 2 && grade >= 3) {
      newStatus = 'review'
    } else if (record.status === 'review' && newStability > 30 && grade >= 3) {
      newStatus = 'mastered'
    } else if (grade === 1) {
      // Forgot the word - back to learning
      newStatus = record.status === 'mastered' ? 'review' : 'learning'
    }

    // Update record
    const updatedRecord: WordRecord = {
      ...record,
      status: newStatus,
      stability: newStability,
      difficulty: newDifficulty,
      retrievability: newRetrievability,
      nextReviewDate,
      lastReviewDate: now,
      reviewCount: record.reviewCount + 1,
      correctCount: record.correctCount + (grade >= 3 ? 1 : 0),
      lapseCount: record.lapseCount + (grade === 1 ? 1 : 0)
    }

    this.saveWordRecord(updatedRecord)

    // Record the study session
    this.recordStudySession(userId, wordId, grade, responseTime, now)

    return updatedRecord
  }

  /**
   * Get words due for review
   */
  getWordsForReview(userId: string, limit: number = 20): WordRecord[] {
    const records = this.getWordRecords(userId)
    const now = new Date()

    return records
      .filter(record => record.nextReviewDate <= now)
      .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime())
      .slice(0, limit)
  }

  /**
   * Get words by status
   */
  getWordsByStatus(userId: string, status: WordRecordStatus): WordRecord[] {
    const records = this.getWordRecords(userId)
    return records.filter(record => record.status === status)
  }

  /**
   * Update retrievability for all words based on elapsed time
   */
  updateAllRetrievability(userId: string): void {
    const records = this.getWordRecords(userId)
    const now = new Date()
    let hasUpdates = false

    const updatedRecords = records.map(record => {
      const elapsedDays = (now.getTime() - record.lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)
      const newRetrievability = calculateRetrievability(record.stability, elapsedDays)
      
      if (Math.abs(newRetrievability - record.retrievability) > 0.01) {
        hasUpdates = true
        return { ...record, retrievability: newRetrievability }
      }
      
      return record
    })

    if (hasUpdates) {
      this.saveAllWordRecords(userId, updatedRecords)
    }
  }

  /**
   * Record a study session for analytics
   */
  private recordStudySession(
    userId: string,
    wordId: string,
    grade: 1 | 2 | 3 | 4,
    responseTime: number,
    sessionTime: Date
  ): void {
    const session: MemoryStudySession = {
      id: `${userId}_${wordId}_${sessionTime.getTime()}`,
      userId,
      wordId,
      startTime: new Date(sessionTime.getTime() - responseTime),
      endTime: sessionTime,
      grade,
      responseTime,
      hour: sessionTime.getHours(),
      deviceType: this.detectDeviceType()
    }

    this.saveStudySession(session)
  }

  /**
   * Get study sessions for analytics
   */
  getStudySessions(userId: string, days: number = 30): MemoryStudySession[] {
    if (typeof window === 'undefined') return []
    
    try {
      const sessions = SecureStorage.getItem<MemoryStudySession[]>(`${this.sessionKey}_${userId}`) || []
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      
      return sessions
        .map(session => this.hydrateStudySession(session))
        .filter(session => session.endTime >= cutoffDate)
        .sort((a, b) => b.endTime.getTime() - a.endTime.getTime())
    } catch (error) {
      console.error('Failed to get study sessions:', error)
      return []
    }
  }

  /**
   * Delete a word record
   */
  deleteWordRecord(userId: string, wordId: string): boolean {
    const records = this.getWordRecords(userId)
    const filteredRecords = records.filter(record => record.wordId !== wordId)
    
    if (filteredRecords.length !== records.length) {
      this.saveAllWordRecords(userId, filteredRecords)
      return true
    }
    
    return false
  }

  /**
   * Clear all word records for a user
   */
  clearAllWordRecords(userId: string): void {
    if (typeof window === 'undefined') return
    
    try {
      SecureStorage.removeItem(`${this.storageKey}_${userId}`)
      SecureStorage.removeItem(`${this.sessionKey}_${userId}`)
    } catch (error) {
      console.error('Failed to clear word records:', error)
    }
  }

  /**
   * Save a single word record
   */
  private saveWordRecord(record: WordRecord): void {
    const records = this.getWordRecords(record.userId)
    const existingIndex = records.findIndex(r => r.wordId === record.wordId)
    
    if (existingIndex >= 0) {
      records[existingIndex] = record
    } else {
      records.push(record)
    }
    
    this.saveAllWordRecords(record.userId, records)
  }

  /**
   * Save all word records for a user
   */
  private saveAllWordRecords(userId: string, records: WordRecord[]): void {
    if (typeof window === 'undefined') return
    
    try {
      SecureStorage.setItem(`${this.storageKey}_${userId}`, records)
    } catch (error) {
      console.error('Failed to save word records:', error)
    }
  }

  /**
   * Save a study session
   */
  private saveStudySession(session: MemoryStudySession): void {
    if (typeof window === 'undefined') return
    
    try {
      const sessions = SecureStorage.getItem<MemoryStudySession[]>(`${this.sessionKey}_${session.userId}`) || []
      sessions.unshift(session)
      
      // Keep only last 1000 sessions to prevent storage bloat
      const trimmedSessions = sessions.slice(0, 1000)
      
      SecureStorage.setItem(`${this.sessionKey}_${session.userId}`, trimmedSessions)
    } catch (error) {
      console.error('Failed to save study session:', error)
    }
  }

  /**
   * Detect device type for analytics
   */
  private detectDeviceType(): 'mobile' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop'
    
    return window.innerWidth <= 768 ? 'mobile' : 'desktop'
  }

  /**
   * Restore Date fields after loading from storage
   */
  private hydrateWordRecord(record: WordRecord): WordRecord {
    return {
      ...record,
      nextReviewDate: new Date(record.nextReviewDate),
      lastReviewDate: new Date(record.lastReviewDate),
      createdAt: new Date(record.createdAt)
    }
  }

  /**
   * Restore Date fields in study session payloads
   */
  private hydrateStudySession(session: MemoryStudySession): MemoryStudySession {
    return {
      ...session,
      startTime: new Date(session.startTime),
      endTime: new Date(session.endTime)
    }
  }
}

// Export singleton instance
export const wordRecordService = new WordRecordService()
