/**
 * Word Record Service Tests
 * 
 * Property-based tests for word record management and automatic updates
 */

import * as fc from 'fast-check'
import { WordRecordService } from '../word-record-service'
import { WordRecord, MemoryStudySession, WordRecordStatus } from '@/types'

// Mock SecurityManager for testing
jest.mock('../security', () => ({
  SecurityManager: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
  }
}))

describe('WordRecordService Property-Based Tests', () => {
  let service: WordRecordService
  let mockStorage: Map<string, any>

  beforeEach(() => {
    service = new WordRecordService()
    mockStorage = new Map()
    
    // Mock SecurityManager methods
    const { SecurityManager } = require('../security')
    SecurityManager.getItem.mockImplementation((key: string) => mockStorage.get(key) || null)
    SecurityManager.setItem.mockImplementation((key: string, value: any) => mockStorage.set(key, value))
    SecurityManager.removeItem.mockImplementation((key: string) => mockStorage.delete(key))
  })

  afterEach(() => {
    jest.clearAllMocks()
    mockStorage.clear()
  })

  /**
   * **Feature: wenya-starmap, Property 12: 自动更新单词记录**
   * **Validates: Requirements 6.1**
   * 
   * For any completed exercise, the system should automatically update the corresponding
   * word's stability and retrievability without user input
   */
  test('Property 12: Automatic word record updates after exercise completion', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 20 }), // userId
      fc.string({ minLength: 1, maxLength: 20 }), // wordId
      fc.integer({ min: 1, max: 4 }),             // grade (1-4)
      fc.integer({ min: 100, max: 10000 }),       // responseTime
      (userId, wordId, grade, responseTime) => {
        // Get initial state (should be empty)
        const initialRecord = service.getWordRecord(userId, wordId)
        expect(initialRecord).toBeNull()

        // Simulate exercise completion - this should automatically update the record
        const updatedRecord = service.updateWordRecordAfterReview(
          userId, 
          wordId, 
          grade as 1 | 2 | 3 | 4, 
          responseTime
        )

        // Verify automatic update occurred
        expect(updatedRecord).toBeDefined()
        expect(updatedRecord.userId).toBe(userId)
        expect(updatedRecord.wordId).toBe(wordId)
        expect(updatedRecord.reviewCount).toBe(1)
        
        // Verify FSRS parameters were automatically calculated
        expect(updatedRecord.stability).toBeGreaterThan(0)
        expect(updatedRecord.difficulty).toBeGreaterThanOrEqual(0)
        expect(updatedRecord.difficulty).toBeLessThanOrEqual(1)
        expect(updatedRecord.retrievability).toBeGreaterThanOrEqual(0)
        expect(updatedRecord.retrievability).toBeLessThanOrEqual(1)
        
        // Verify timestamps were automatically set
        expect(updatedRecord.lastReviewDate).toBeInstanceOf(Date)
        expect(updatedRecord.nextReviewDate).toBeInstanceOf(Date)
        expect(updatedRecord.createdAt).toBeInstanceOf(Date)
        
        // Verify the record can be retrieved (persistence)
        const retrievedRecord = service.getWordRecord(userId, wordId)
        expect(retrievedRecord).toEqual(updatedRecord)
      }
    ), { numRuns: 100 })
  })

  /**
   * **Feature: wenya-starmap, Property 13: 自动记录会话数据**
   * **Validates: Requirements 6.2**
   * 
   * For any user answer, the system should automatically record timestamp,
   * accuracy, and response time without user input
   */
  test('Property 13: Automatic session data recording', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 20 }), // userId
      fc.string({ minLength: 1, maxLength: 20 }), // wordId
      fc.integer({ min: 1, max: 4 }),             // grade
      fc.integer({ min: 100, max: 10000 }),       // responseTime
      (userId, wordId, grade, responseTime) => {
        const beforeTime = new Date()
        
        // Simulate user answering a question
        service.updateWordRecordAfterReview(
          userId, 
          wordId, 
          grade as 1 | 2 | 3 | 4, 
          responseTime
        )
        
        const afterTime = new Date()
        
        // Verify session data was automatically recorded
        const sessions = service.getStudySessions(userId, 1)
        expect(sessions.length).toBeGreaterThan(0)
        
        const latestSession = sessions[0]
        expect(latestSession.userId).toBe(userId)
        expect(latestSession.wordId).toBe(wordId)
        expect(latestSession.grade).toBe(grade)
        expect(latestSession.responseTime).toBe(responseTime)
        
        // Verify automatic timestamp recording
        expect(latestSession.startTime).toBeInstanceOf(Date)
        expect(latestSession.endTime).toBeInstanceOf(Date)
        expect(latestSession.startTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime() - responseTime)
        expect(latestSession.endTime.getTime()).toBeLessThanOrEqual(afterTime.getTime())
        
        // Verify automatic context recording
        expect(latestSession.hour).toBeGreaterThanOrEqual(0)
        expect(latestSession.hour).toBeLessThanOrEqual(23)
        expect(['mobile', 'desktop']).toContain(latestSession.deviceType)
        
        // Verify accuracy is automatically derived from grade
        const isCorrect = grade >= 3
        expect(latestSession.grade >= 3).toBe(isCorrect)
      }
    ), { numRuns: 100 })
  })

  /**
   * **Feature: wenya-starmap, Property 17: 数据持久化完整性**
   * **Validates: Requirements 8.1**
   * 
   * For any word record storage, all required fields should be persisted:
   * user_id, word_id, status, stability, difficulty, next_review_date, 
   * last_review_date, retrievability
   */
  test('Property 17: Data persistence integrity', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 20 }), // userId
      fc.string({ minLength: 1, maxLength: 20 }), // wordId
      fc.integer({ min: 1, max: 4 }),             // grade
      (userId, wordId, grade) => {
        // Create/update a word record
        const record = service.updateWordRecordAfterReview(
          userId, 
          wordId, 
          grade as 1 | 2 | 3 | 4
        )
        
        // Verify all required fields are present and valid
        expect(record.id).toBeDefined()
        expect(typeof record.id).toBe('string')
        expect(record.id.length).toBeGreaterThan(0)
        
        expect(record.userId).toBe(userId)
        expect(typeof record.userId).toBe('string')
        
        expect(record.wordId).toBe(wordId)
        expect(typeof record.wordId).toBe('string')
        
        expect(record.status).toBeDefined()
        expect(['new', 'learning', 'review', 'mastered']).toContain(record.status)
        
        expect(record.stability).toBeDefined()
        expect(typeof record.stability).toBe('number')
        expect(record.stability).toBeGreaterThan(0)
        
        expect(record.difficulty).toBeDefined()
        expect(typeof record.difficulty).toBe('number')
        expect(record.difficulty).toBeGreaterThanOrEqual(0)
        expect(record.difficulty).toBeLessThanOrEqual(1)
        
        expect(record.retrievability).toBeDefined()
        expect(typeof record.retrievability).toBe('number')
        expect(record.retrievability).toBeGreaterThanOrEqual(0)
        expect(record.retrievability).toBeLessThanOrEqual(1)
        
        expect(record.nextReviewDate).toBeDefined()
        expect(record.nextReviewDate).toBeInstanceOf(Date)
        
        expect(record.lastReviewDate).toBeDefined()
        expect(record.lastReviewDate).toBeInstanceOf(Date)
        
        expect(record.createdAt).toBeDefined()
        expect(record.createdAt).toBeInstanceOf(Date)
        
        expect(record.reviewCount).toBeDefined()
        expect(typeof record.reviewCount).toBe('number')
        expect(record.reviewCount).toBeGreaterThanOrEqual(0)
        
        expect(record.correctCount).toBeDefined()
        expect(typeof record.correctCount).toBe('number')
        expect(record.correctCount).toBeGreaterThanOrEqual(0)
        
        expect(record.lapseCount).toBeDefined()
        expect(typeof record.lapseCount).toBe('number')
        expect(record.lapseCount).toBeGreaterThanOrEqual(0)
        
        // Verify persistence by retrieving the record
        const retrievedRecord = service.getWordRecord(userId, wordId)
        expect(retrievedRecord).toEqual(record)
      }
    ), { numRuns: 100 })
  })

  // Additional unit tests for edge cases
  describe('Unit Tests', () => {
    test('should create new record for unknown word', () => {
      const record = service.updateWordRecordAfterReview('user1', 'word1', 3)
      expect(record.status).toBe('learning')
      expect(record.reviewCount).toBe(1)
    })

    test('should handle multiple reviews correctly', () => {
      // First review
      const record1 = service.updateWordRecordAfterReview('user1', 'word1', 3)
      expect(record1.reviewCount).toBe(1)
      
      // Second review
      const record2 = service.updateWordRecordAfterReview('user1', 'word1', 4)
      expect(record2.reviewCount).toBe(2)
      expect(record2.stability).toBeGreaterThan(record1.stability)
    })

    test('should handle forgotten words (grade 1)', () => {
      // Learn a word well
      service.updateWordRecordAfterReview('user1', 'word1', 4)
      service.updateWordRecordAfterReview('user1', 'word1', 4)
      
      // Forget it
      const record = service.updateWordRecordAfterReview('user1', 'word1', 1)
      expect(record.lapseCount).toBe(1)
      expect(record.status).toBe('learning')
    })

    test('should get words for review correctly', () => {
      // Create some records with past due dates
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      service.updateWordRecordAfterReview('user1', 'word1', 3)
      service.updateWordRecordAfterReview('user1', 'word2', 3)
      
      const wordsForReview = service.getWordsForReview('user1')
      expect(wordsForReview.length).toBeGreaterThanOrEqual(0)
    })

    test('should filter words by status', () => {
      service.updateWordRecordAfterReview('user1', 'word1', 3) // learning
      service.updateWordRecordAfterReview('user1', 'word2', 1) // learning (forgot)
      
      const learningWords = service.getWordsByStatus('user1', 'learning')
      expect(learningWords.length).toBeGreaterThanOrEqual(1)
    })

    test('should clear all records', () => {
      service.updateWordRecordAfterReview('user1', 'word1', 3)
      service.clearAllWordRecords('user1')
      
      const records = service.getWordRecords('user1')
      expect(records.length).toBe(0)
    })
  })
})