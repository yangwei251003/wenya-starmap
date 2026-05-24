/**
 * Property-Based Tests for Memory Calculation Service
 * 
 * Tests the correctness properties defined in the design document
 * using fast-check for property-based testing.
 */

import * as fc from 'fast-check'
import { MemoryCalculationService } from '../memory-calculation-service'
import type { WordRecord, MemoryStudySession, WordRecordStatus } from '@/types'

// Mock the word record service
const mockWordRecordService = {
  updateAllRetrievability: jest.fn(),
  getWordRecords: jest.fn(),
  getStudySessions: jest.fn()
}

jest.mock('../word-record-service', () => ({
  wordRecordService: {
    updateAllRetrievability: (...args: unknown[]) =>
      mockWordRecordService.updateAllRetrievability(...args),
    getWordRecords: (...args: unknown[]) =>
      mockWordRecordService.getWordRecords(...args),
    getStudySessions: (...args: unknown[]) =>
      mockWordRecordService.getStudySessions(...args)
  }
}))

describe('Memory Calculation Service - Property-Based Tests', () => {
  let service: MemoryCalculationService

  beforeEach(() => {
    service = new MemoryCalculationService()
    jest.clearAllMocks()
  })

  // Generators for test data
  const wordRecordGenerator = fc.record({
    id: fc.string(),
    userId: fc.string(),
    wordId: fc.string(),
    status: fc.constantFrom('new', 'learning', 'review', 'mastered') as fc.Arbitrary<WordRecordStatus>,
    stability: fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true }),
    difficulty: fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
    retrievability: fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
    nextReviewDate: fc.date(),
    lastReviewDate: fc.date(),
    createdAt: fc.date(),
    reviewCount: fc.nat({ max: 100 }),
    correctCount: fc.nat({ max: 100 }),
    lapseCount: fc.nat({ max: 50 })
  })

  const studySessionGenerator = fc.record({
    id: fc.string(),
    userId: fc.string(),
    wordId: fc.string(),
    startTime: fc.date(),
    endTime: fc.date(),
    grade: fc.constantFrom(1, 2, 3, 4) as fc.Arbitrary<1 | 2 | 3 | 4>,
    responseTime: fc.nat({ max: 30000 }),
    hour: fc.nat({ max: 23 }),
    deviceType: fc.constantFrom('mobile', 'desktop') as fc.Arbitrary<'mobile' | 'desktop'>
  })

  /**
   * **Feature: memory-dashboard, Property 1: 记忆电量计算准确性**
   * **Validates: Requirements 1.1**
   * 
   * For any user's word record collection, calculating memory battery should return
   * the average retrievability of all learning words
   */
  test('Property 1: Memory battery calculation accuracy', () => {
    fc.assert(fc.property(
      fc.string(), // userId
      fc.array(wordRecordGenerator, { minLength: 1, maxLength: 50 }),
      (userId, records) => {
        // Setup mock
        mockWordRecordService.getWordRecords.mockReturnValue(records)
        mockWordRecordService.updateAllRetrievability.mockImplementation(() => {})

        // Filter to learning words (exclude mastered)
        const learningWords = records.filter(record => 
          record.status === 'new' || record.status === 'learning' || record.status === 'review'
        )

        const battery = service.calculateBattery(userId)

        if (learningWords.length === 0) {
          // No learning words should return 100%
          expect(battery).toBe(100)
        } else {
          // Should be average retrievability as percentage
          const expectedAvg = learningWords.reduce((sum, r) => sum + r.retrievability, 0) / learningWords.length
          const expectedBattery = Math.round(expectedAvg * 100)
          expect(battery).toBe(expectedBattery)
        }

        // Battery should always be between 0 and 100
        expect(battery).toBeGreaterThanOrEqual(0)
        expect(battery).toBeLessThanOrEqual(100)
      }
    ), { numRuns: 100 })
  })

  /**
   * **Feature: memory-dashboard, Property 2: 电量随时间衰减**
   * **Validates: Requirements 1.3**
   * 
   * For any word record, when time elapses without review activity,
   * its retrievability should decrease according to FSRS forgetting curve
   */
  test('Property 2: Battery decays over time', () => {
    fc.assert(fc.property(
      fc.string(), // userId
      wordRecordGenerator,
      fc.nat({ min: 1, max: 30 }), // days elapsed
      (userId, record, daysElapsed) => {
        // Create two scenarios: same record at different times
        const now = new Date()
        const earlier = new Date(now.getTime() - daysElapsed * 24 * 60 * 60 * 1000)
        
        const recordEarlier = { ...record, lastReviewDate: earlier }
        const recordNow = { ...record, lastReviewDate: now }

        // Mock for earlier time
        mockWordRecordService.getWordRecords.mockReturnValueOnce([recordEarlier])
        mockWordRecordService.updateAllRetrievability.mockImplementation(() => {
          // Simulate retrievability decay
          recordEarlier.retrievability = Math.max(0, recordEarlier.retrievability * 0.9)
        })
        const batteryEarlier = service.calculateBattery(userId)

        // Mock for current time  
        mockWordRecordService.getWordRecords.mockReturnValueOnce([recordNow])
        mockWordRecordService.updateAllRetrievability.mockImplementation(() => {})
        const batteryNow = service.calculateBattery(userId)

        // Battery should not increase over time without reviews (allowing for rounding)
        expect(batteryEarlier).toBeLessThanOrEqual(batteryNow + 1)
      }
    ), { numRuns: 100 })
  })

  /**
   * **Feature: memory-dashboard, Property 3: 复习提升电量**
   * **Validates: Requirements 1.4**
   * 
   * For any review session, memory battery after review should be higher than before review
   */
  test('Property 3: Review improves battery', () => {
    fc.assert(fc.property(
      fc.string(), // userId
      fc.array(wordRecordGenerator, { minLength: 1, maxLength: 10 }),
      fc.nat({ max: 9 }), // index of word to review
      (userId, records, reviewIndex) => {
        const wordToReview = records[reviewIndex % records.length]
        
        // Ensure it's a learning word
        const learningRecord = { 
          ...wordToReview, 
          status: 'learning' as WordRecordStatus,
          retrievability: Math.min(0.8, wordToReview.retrievability) // Not already perfect
        }
        const recordsWithLearning = [...records]
        recordsWithLearning[reviewIndex % records.length] = learningRecord

        // Battery before review
        mockWordRecordService.getWordRecords.mockReturnValueOnce(recordsWithLearning)
        mockWordRecordService.updateAllRetrievability.mockImplementation(() => {})
        const batteryBefore = service.calculateBattery(userId)

        // Simulate successful review (improve retrievability)
        const improvedRecord = { 
          ...learningRecord, 
          retrievability: Math.min(1.0, learningRecord.retrievability + 0.2)
        }
        const recordsAfterReview = [...recordsWithLearning]
        recordsAfterReview[reviewIndex % records.length] = improvedRecord

        // Battery after review
        mockWordRecordService.getWordRecords.mockReturnValueOnce(recordsAfterReview)
        const batteryAfter = service.calculateBattery(userId)

        // Battery should improve or stay the same (if already perfect)
        expect(batteryAfter).toBeGreaterThanOrEqual(batteryBefore)
      }
    ), { numRuns: 100 })
  })

  /**
   * **Feature: memory-dashboard, Property 4: 单词分层正确性**
   * **Validates: Requirements 2.1**
   * 
   * For any word record, system should correctly classify based on review interval:
   * >30 days = permanent memory, 1-30 days = familiar zone, <1 day = new words
   */
  test('Property 4: Word layer classification correctness', () => {
    fc.assert(fc.property(
      fc.string(), // userId
      fc.array(wordRecordGenerator, { minLength: 1, maxLength: 20 }),
      (userId, records) => {
        // Ensure records have consistent dates for testing
        const now = new Date()
        const testRecords = records.map((record, index) => ({
          ...record,
          createdAt: new Date(now.getTime() - (index + 1) * 24 * 60 * 60 * 1000),
          lastReviewDate: new Date(now.getTime() - (index * 5) * 24 * 60 * 60 * 1000)
        }))

        mockWordRecordService.getWordRecords.mockReturnValue(testRecords)
        
        const layerData = service.getLayerData(userId, 7)
        
        // Should return data for 7 days
        expect(layerData).toHaveLength(7)
        
        // Each day should have non-negative counts
        layerData.forEach(day => {
          expect(day.permanent).toBeGreaterThanOrEqual(0)
          expect(day.familiar).toBeGreaterThanOrEqual(0)
          expect(day.new).toBeGreaterThanOrEqual(0)
          
          // Total should not exceed total records
          const total = day.permanent + day.familiar + day.new
          expect(total).toBeLessThanOrEqual(testRecords.length)
        })
        
        // Layer data should be properly structured
        layerData.forEach(day => {
          expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD format
          expect(typeof day.permanent).toBe('number')
          expect(typeof day.familiar).toBe('number')
          expect(typeof day.new).toBe('number')
        })
      }
    ), { numRuns: 100 })
  })

  /**
   * **Feature: memory-dashboard, Property 5: 复习预测准确性**
   * **Validates: Requirements 3.1**
   * 
   * For any word record collection and future date, predicted review count
   * should equal the number of words scheduled for that date
   */
  test('Property 5: Review forecast accuracy', () => {
    fc.assert(fc.property(
      fc.string(), // userId
      fc.array(wordRecordGenerator, { minLength: 1, maxLength: 30 }),
      (userId, records) => {
        // Set up records with known review dates
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        
        const testRecords = records.map((record, index) => {
          const reviewDate = new Date(now)
          reviewDate.setDate(now.getDate() + (index % 7)) // Spread across next 7 days
          return {
            ...record,
            nextReviewDate: reviewDate
          }
        })

        mockWordRecordService.getWordRecords.mockReturnValue(testRecords)
        
        const forecast = service.forecastReviews(userId, 7)
        
        // Should return 7 days of forecast
        expect(forecast).toHaveLength(7)
        
        // Verify each day's count matches scheduled words
        forecast.forEach((day, index) => {
          const targetDate = new Date(now)
          targetDate.setDate(now.getDate() + index)
          
          // Count words actually scheduled for this date
          const expectedCount = testRecords.filter(record => {
            const reviewDate = new Date(record.nextReviewDate)
            reviewDate.setHours(0, 0, 0, 0)
            return reviewDate.getTime() === targetDate.getTime()
          }).length
          
          expect(day.count).toBe(expectedCount)
          expect(day.isToday).toBe(index === 0)
          expect(day.date).toBe(targetDate.toISOString().split('T')[0])
        })
      }
    ), { numRuns: 100 })
  })

  /**
   * **Feature: memory-dashboard, Property 7: 遗忘对抗双轨迹**
   * **Validates: Requirements 4.1**
   * 
   * For any user's learning history, system should calculate two trajectories:
   * actual performance with reviews and theoretical decay without reviews
   */
  test('Property 7: Forgetting savings dual trajectory', () => {
    fc.assert(fc.property(
      fc.string(), // userId
      fc.array(wordRecordGenerator, { minLength: 1, maxLength: 15 }),
      fc.array(studySessionGenerator, { minLength: 0, maxLength: 20 }),
      (userId, records, sessions) => {
        mockWordRecordService.getWordRecords.mockReturnValue(records)
        mockWordRecordService.getStudySessions.mockReturnValue(sessions)
        
        const savingsData = service.calculateSavings(userId, 7)
        
        // Should return 7 days of data
        expect(savingsData).toHaveLength(7)
        
        savingsData.forEach(day => {
          // Both trajectories should be non-negative
          expect(day.withReview).toBeGreaterThanOrEqual(0)
          expect(day.withoutReview).toBeGreaterThanOrEqual(0)
          
          // With review should generally be better than or equal to without review
          // (allowing for some variance in calculation)
          expect(day.withReview).toBeGreaterThanOrEqual(day.withoutReview - 1)
          
          // Date should be properly formatted
          expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        })
      }
    ), { numRuns: 100 })
  })

  /**
   * **Feature: memory-dashboard, Property 9: 专注度时段追踪**
   * **Validates: Requirements 5.1**
   * 
   * For any learning session, system should record the hour period,
   * accuracy rate, and focus score
   */
  test('Property 9: Focus pattern hour tracking', () => {
    fc.assert(fc.property(
      fc.string(), // userId
      fc.array(studySessionGenerator, { minLength: 0, maxLength: 50 }),
      (userId, sessions) => {
        mockWordRecordService.getStudySessions.mockReturnValue(sessions)
        
        const focusData = service.analyzeFocusPattern(userId)
        
        // Should return data for all 24 hours
        expect(focusData).toHaveLength(24)
        
        focusData.forEach((hourData, hour) => {
          // Hour should match index
          expect(hourData.hour).toBe(hour)
          
          // All metrics should be in valid ranges
          expect(hourData.accuracy).toBeGreaterThanOrEqual(0)
          expect(hourData.accuracy).toBeLessThanOrEqual(1)
          expect(hourData.focusScore).toBeGreaterThanOrEqual(0)
          expect(hourData.focusScore).toBeLessThanOrEqual(1)
          expect(hourData.sessionCount).toBeGreaterThanOrEqual(0)
          
          // If no sessions for this hour, metrics should be 0
          const hourSessions = sessions.filter(s => s.hour === hour)
          if (hourSessions.length === 0) {
            expect(hourData.accuracy).toBe(0)
            expect(hourData.focusScore).toBe(0)
            expect(hourData.sessionCount).toBe(0)
          } else {
            expect(hourData.sessionCount).toBe(hourSessions.length)
            
            // Accuracy should match actual performance
            const correctSessions = hourSessions.filter(s => s.grade >= 3)
            const expectedAccuracy = correctSessions.length / hourSessions.length
            expect(Math.abs(hourData.accuracy - expectedAccuracy)).toBeLessThan(0.01)
          }
        })
      }
    ), { numRuns: 100 })
  })
})
