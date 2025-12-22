/**
 * Memory Calculation Service
 * 
 * Provides core calculation functions for the Memory Dashboard.
 * Implements battery calculation, layer analysis, review forecasting,
 * savings calculation, and focus pattern analysis.
 */

import { WordRecord, MemoryStudySession } from '@/types'
import { calculateRetrievability } from './fsrs-algorithm'
import { wordRecordService } from './word-record-service'

// Data interfaces for dashboard components
export interface LayerData {
  date: string
  permanent: number  // >30 days interval (deep green)
  familiar: number   // 1-30 days interval (light green)
  new: number        // <1 day interval (yellow)
}

export interface TideData {
  date: string
  count: number
  isToday: boolean
}

export interface SavingsData {
  date: string
  withReview: number     // Actual words remembered with review
  withoutReview: number  // Predicted words without review
}

export interface HourData {
  hour: number           // 0-23
  accuracy: number       // 0-1
  focusScore: number     // 0-1
  sessionCount: number
}

export class MemoryCalculationService {
  
  /**
   * Calculate memory battery (average retrievability across all learning words)
   * Validates: Requirements 1.1
   */
  calculateBattery(userId: string): number {
    // Update retrievability for all words first
    wordRecordService.updateAllRetrievability(userId)
    
    const records = wordRecordService.getWordRecords(userId)
    
    // Filter to only learning words (exclude mastered words from battery calculation)
    const learningWords = records.filter(record => 
      record.status === 'new' || record.status === 'learning' || record.status === 'review'
    )
    
    if (learningWords.length === 0) {
      return 100 // No words to track = full battery
    }
    
    // Calculate average retrievability
    const totalRetrievability = learningWords.reduce((sum, record) => sum + record.retrievability, 0)
    const averageRetrievability = totalRetrievability / learningWords.length
    
    // Convert to percentage (0-100)
    return Math.round(averageRetrievability * 100)
  }

  /**
   * Get memory layer data for sedimentation visualization
   * Validates: Requirements 2.1
   */
  getLayerData(userId: string, days: number = 30): LayerData[] {
    const records = wordRecordService.getWordRecords(userId)
    const layerData: LayerData[] = []
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days + 1)
    
    // Generate data for each day
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      const dateStr = currentDate.toISOString().split('T')[0]
      
      // Count words in each layer based on their review interval at this date
      let permanent = 0
      let familiar = 0
      let newWords = 0
      
      records.forEach(record => {
        // Only count words that existed at this date
        if (new Date(record.createdAt) <= currentDate) {
          const intervalDays = this.calculateIntervalAtDate(record, currentDate)
          
          if (intervalDays > 30) {
            permanent++
          } else if (intervalDays >= 1) {
            familiar++
          } else {
            newWords++
          }
        }
      })
      
      layerData.push({
        date: dateStr,
        permanent,
        familiar,
        new: newWords
      })
    }
    
    return layerData
  }

  /**
   * Forecast review counts for the next 7 days
   * Validates: Requirements 3.1
   */
  forecastReviews(userId: string, days: number = 7): TideData[] {
    const records = wordRecordService.getWordRecords(userId)
    const forecast: TideData[] = []
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < days; i++) {
      const targetDate = new Date(today)
      targetDate.setDate(today.getDate() + i)
      const nextDay = new Date(targetDate)
      nextDay.setDate(targetDate.getDate() + 1)
      
      // Count words scheduled for review on this date
      const count = records.filter(record => {
        const reviewDate = new Date(record.nextReviewDate)
        reviewDate.setHours(0, 0, 0, 0)
        return reviewDate >= targetDate && reviewDate < nextDay
      }).length
      
      forecast.push({
        date: targetDate.toISOString().split('T')[0],
        count,
        isToday: i === 0
      })
    }
    
    return forecast
  }

  /**
   * Calculate forgetting savings (with vs without review trajectories)
   * Validates: Requirements 4.1
   */
  calculateSavings(userId: string, days: number = 30): SavingsData[] {
    const records = wordRecordService.getWordRecords(userId)
    const sessions = wordRecordService.getStudySessions(userId, days)
    const savingsData: SavingsData[] = []
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days + 1)
    
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      
      // Calculate actual performance (with reviews)
      const withReview = this.calculateWordsRememberedAtDate(records, sessions, currentDate, true)
      
      // Calculate theoretical performance (without reviews after start date)
      const withoutReview = this.calculateWordsRememberedAtDate(records, sessions, currentDate, false)
      
      savingsData.push({
        date: currentDate.toISOString().split('T')[0],
        withReview,
        withoutReview
      })
    }
    
    return savingsData
  }

  /**
   * Analyze focus patterns across 24 hours
   * Validates: Requirements 5.1
   */
  analyzeFocusPattern(userId: string): HourData[] {
    const sessions = wordRecordService.getStudySessions(userId, 30) // Last 30 days
    const hourlyData: HourData[] = []
    
    // Initialize data for each hour
    for (let hour = 0; hour < 24; hour++) {
      const hourSessions = sessions.filter(session => session.hour === hour)
      
      if (hourSessions.length === 0) {
        hourlyData.push({
          hour,
          accuracy: 0,
          focusScore: 0,
          sessionCount: 0
        })
        continue
      }
      
      // Calculate accuracy (percentage of grade 3 or 4)
      const correctSessions = hourSessions.filter(session => session.grade >= 3)
      const accuracy = correctSessions.length / hourSessions.length
      
      // Calculate focus score based on response time and accuracy
      const avgResponseTime = hourSessions.reduce((sum, s) => sum + s.responseTime, 0) / hourSessions.length
      const maxResponseTime = 10000 // 10 seconds as baseline
      const responseScore = Math.max(0, 1 - avgResponseTime / maxResponseTime)
      const focusScore = (accuracy + responseScore) / 2
      
      hourlyData.push({
        hour,
        accuracy,
        focusScore: Math.max(0, Math.min(1, focusScore)),
        sessionCount: hourSessions.length
      })
    }
    
    return hourlyData
  }

  /**
   * Calculate review interval for a word at a specific date
   */
  private calculateIntervalAtDate(record: WordRecord, date: Date): number {
    const lastReview = new Date(record.lastReviewDate)
    const timeDiff = date.getTime() - lastReview.getTime()
    return Math.max(0, timeDiff / (1000 * 60 * 60 * 24)) // Convert to days
  }

  /**
   * Calculate how many words would be remembered at a specific date
   */
  private calculateWordsRememberedAtDate(
    records: WordRecord[],
    sessions: MemoryStudySession[],
    targetDate: Date,
    includeReviews: boolean
  ): number {
    let rememberedCount = 0
    
    records.forEach(record => {
      // Only count words that existed at target date
      if (new Date(record.createdAt) > targetDate) {
        return
      }
      
      let currentStability = record.stability
      let lastReviewDate = new Date(record.lastReviewDate)
      
      if (includeReviews) {
        // Include actual review sessions up to target date
        const wordSessions = sessions.filter(session => 
          session.wordId === record.wordId && 
          new Date(session.startTime) <= targetDate
        ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        
        // Apply each review session's effect on stability
        wordSessions.forEach(session => {
          // Simplified stability update based on grade
          const multiplier = session.grade === 1 ? 0.4 : session.grade === 2 ? 1.0 : 
                           session.grade === 3 ? 2.5 : 4.0
          currentStability *= multiplier
          lastReviewDate = new Date(session.endTime)
        })
      }
      
      // Calculate retrievability at target date
      const elapsedDays = (targetDate.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)
      const retrievability = calculateRetrievability(currentStability, Math.max(0, elapsedDays))
      
      // Count as remembered if retrievability > 50%
      if (retrievability > 0.5) {
        rememberedCount++
      }
    })
    
    return rememberedCount
  }
}

// Export singleton instance
export const memoryCalculationService = new MemoryCalculationService()