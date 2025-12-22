/**
 * SRS Service and Word Record Service Integration Tests
 * 
 * Tests the integration between the old SRS system and the new FSRS-based
 * word record system for the memory dashboard.
 */

import { srsService } from '../srs-service'
import { wordRecordService } from '../word-record-service'

describe('SRS and Word Record Integration', () => {
  const testUserId = 'test-user-integration'
  const testWordId = 'word-test-1'

  beforeEach(() => {
    // Clear test data
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }
    wordRecordService.clearAllWordRecords(testUserId)
  })

  afterEach(() => {
    // Cleanup
    wordRecordService.clearAllWordRecords(testUserId)
  })

  it('should create word record when submitting review through SRS service', () => {
    // Submit a review through SRS service
    srsService.submitReview(testUserId, testWordId, 2) // 认识

    // Check that word record was created
    const wordRecord = wordRecordService.getWordRecord(testUserId, testWordId)
    
    expect(wordRecord).not.toBeNull()
    expect(wordRecord?.userId).toBe(testUserId)
    expect(wordRecord?.wordId).toBe(testWordId)
    expect(wordRecord?.reviewCount).toBe(1)
  })

  it('should update word record on subsequent reviews', () => {
    // First review
    srsService.submitReview(testUserId, testWordId, 2) // 认识
    
    // Second review
    srsService.submitReview(testUserId, testWordId, 1) // 模糊
    
    const wordRecord = wordRecordService.getWordRecord(testUserId, testWordId)
    
    expect(wordRecord?.reviewCount).toBe(2)
    expect(wordRecord?.correctCount).toBe(1) // Only first review was correct
  })

  it('should track correct and wrong answers', () => {
    // Correct answer
    srsService.submitReview(testUserId, testWordId, 2)
    
    let wordRecord = wordRecordService.getWordRecord(testUserId, testWordId)
    expect(wordRecord?.correctCount).toBe(1)
    expect(wordRecord?.lapseCount).toBe(0)
    
    // Wrong answer
    srsService.submitReview(testUserId, testWordId, 0)
    
    wordRecord = wordRecordService.getWordRecord(testUserId, testWordId)
    expect(wordRecord?.correctCount).toBe(1)
    expect(wordRecord?.lapseCount).toBe(1)
  })

  it('should create study sessions for analytics', () => {
    // Submit multiple reviews
    srsService.submitReview(testUserId, testWordId, 2)
    srsService.submitReview(testUserId, 'word-test-2', 1)
    srsService.submitReview(testUserId, 'word-test-3', 0)
    
    const sessions = wordRecordService.getStudySessions(testUserId, 1)
    
    expect(sessions.length).toBe(3)
    expect(sessions[0].userId).toBe(testUserId)
  })

  it('should update retrievability over time', () => {
    // Create a word record
    srsService.submitReview(testUserId, testWordId, 2)
    
    const initialRecord = wordRecordService.getWordRecord(testUserId, testWordId)
    const initialRetrievability = initialRecord?.retrievability || 0
    
    // Simulate time passing by manually updating retrievability
    wordRecordService.updateAllRetrievability(testUserId)
    
    const updatedRecord = wordRecordService.getWordRecord(testUserId, testWordId)
    
    // Retrievability should exist and be a valid number
    expect(updatedRecord?.retrievability).toBeGreaterThanOrEqual(0)
    expect(updatedRecord?.retrievability).toBeLessThanOrEqual(1)
  })

  it('should handle multiple users independently', () => {
    const user1 = 'user-1'
    const user2 = 'user-2'
    
    // User 1 reviews
    srsService.submitReview(user1, testWordId, 2)
    
    // User 2 reviews
    srsService.submitReview(user2, testWordId, 0)
    
    const record1 = wordRecordService.getWordRecord(user1, testWordId)
    const record2 = wordRecordService.getWordRecord(user2, testWordId)
    
    expect(record1?.correctCount).toBe(1)
    expect(record2?.correctCount).toBe(0)
    expect(record2?.lapseCount).toBe(1)
    
    // Cleanup
    wordRecordService.clearAllWordRecords(user1)
    wordRecordService.clearAllWordRecords(user2)
  })
})
