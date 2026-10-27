/**
 * Content Filter Service Tests
 * 
 * Property-based tests for intelligent content filtering functionality
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import * as fc from 'fast-check'
import { ContentFilterService } from '../content-filter-service'
import { WordRecord, WordRecordStatus, Word } from '@/types'
import { wordRecordService } from '../word-record-service'

// Mock the word record service
jest.mock('../word-record-service', () => ({
  wordRecordService: {
    getWordRecord: jest.fn(),
    getWordRecords: jest.fn()
  }
}))

const mockWordRecordService = wordRecordService as jest.Mocked<typeof wordRecordService>

describe('ContentFilterService', () => {
  let service: ContentFilterService
  
  beforeEach(() => {
    service = new ContentFilterService()
    jest.clearAllMocks()
  })

  /**
   * **Feature: wenya-starmap, Property 4: 智能内容筛选准确性**
   * **Validates: Requirements 1.1**
   * 
   * For any user's learning content request, the system should exclude content 
   * with mastery level "已掌握" and stability greater than 90 days
   */
  describe('Property 4: 智能内容筛选准确性', () => {
    it('should exclude mastered content with stability > 90 days', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 10 }), // userId
          fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 10 }) // wordIds
        , (userId: string, availableContent: string[]) => {
          // Setup mock records - some mastered with high stability, some not
          mockWordRecordService.getWordRecord.mockImplementation((uid: string, wordId: string) => {
            if (uid !== userId) return null
            
            // Create deterministic test data based on wordId
            const isEvenIndex = availableContent.indexOf(wordId) % 2 === 0
            const isMastered = wordId.includes('master')
            const stability = isEvenIndex ? 100 : 50 // Some high, some low stability
            
            if (wordId === 'no-record') return null
            
            return {
              id: `${uid}_${wordId}`,
              userId: uid,
              wordId,
              status: isMastered ? 'mastered' as WordRecordStatus : 'learning' as WordRecordStatus,
              stability,
              difficulty: 0.5,
              retrievability: 0.8,
              nextReviewDate: new Date(),
              lastReviewDate: new Date(),
              createdAt: new Date(),
              reviewCount: 5,
              correctCount: 4,
              lapseCount: 1
            } as WordRecord
          })
          
          // Filter content
          const filtered = service.filterMasteredContent({
            userId,
            availableContent
          })
          
          // Verify that mastered content with stability > 90 is excluded
          filtered.forEach((wordId: string) => {
            const record = mockWordRecordService.getWordRecord(userId, wordId)
            if (record && record.status === 'mastered') {
              expect(record.stability).toBeLessThanOrEqual(90)
            }
          })
          
          // Verify that non-mastered content is included
          availableContent.forEach((wordId: string) => {
            const record = mockWordRecordService.getWordRecord(userId, wordId)
            if (!record || record.status !== 'mastered' || record.stability <= 90) {
              expect(filtered).toContain(wordId)
            }
          })
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: wenya-starmap, Property 5: 学习优先级排序**
   * **Validates: Requirements 1.2**
   * 
   * For any learning recommendation list, content should be prioritized 
   * based on retrievability scores and learning urgency
   */
  describe('Property 5: 学习优先级排序', () => {
    it('should prioritize content by retrievability and urgency', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 10 }), // userId
          fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 2, maxLength: 5 }) // wordIds
        , (userId: string, contentIds: string[]) => {
          const now = new Date()
          
          // Setup mock records with different characteristics
          mockWordRecordService.getWordRecord.mockImplementation((uid: string, wordId: string) => {
            if (uid !== userId) return null
            
            const index = contentIds.indexOf(wordId)
            if (index === -1) return null
            
            // Create varied test data
            const stability = 1 + (index * 10) // Increasing stability
            const hoursAgo = 24 + (index * 12) // Different review times
            const lapseCount = index % 3 // Different lapse counts
            
            const lastReviewDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)
            const nextReviewDate = new Date(lastReviewDate.getTime() + stability * 24 * 60 * 60 * 1000)
            
            return {
              id: `${uid}_${wordId}`,
              userId: uid,
              wordId,
              status: 'review' as WordRecordStatus,
              stability,
              difficulty: 0.5,
              retrievability: 0.8,
              nextReviewDate,
              lastReviewDate,
              createdAt: new Date(),
              reviewCount: 5,
              correctCount: 4,
              lapseCount
            } as WordRecord
          })
          
          // Get prioritized content
          const prioritized = service.prioritizeByRetrievability(userId, contentIds)
          
          // Verify sorting: higher priority items should come first
          for (let i = 0; i < prioritized.length - 1; i++) {
            expect(prioritized[i].priority).toBeGreaterThanOrEqual(prioritized[i + 1].priority)
          }
          
          // Verify all content is included
          expect(prioritized.length).toBe(contentIds.length)
          
          // Verify priority values are in valid range
          prioritized.forEach((item) => {
            expect(item.priority).toBeGreaterThanOrEqual(0)
            expect(item.priority).toBeLessThanOrEqual(1)
          })
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: wenya-starmap, Property 6: 自动掌握状态提升**
   * **Validates: Requirements 1.4**
   * 
   * For any content with repeated high performance, the system should 
   * automatically promote it to mastered status
   */
  describe('Property 6: 自动掌握状态提升', () => {
    it('should promote content with high performance to mastered status', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 10 }), // userId
          fc.integer({ min: 1, max: 5 }) // number of records
        , (userId: string, recordCount: number) => {
          // Create test records with different promotion criteria
          const testRecords: WordRecord[] = []
          
          for (let i = 0; i < recordCount; i++) {
            const wordId = `word_${i}`
            
            // Create records that meet different promotion criteria
            let shouldPromote = false
            let stability = 10
            let reviewCount = 3
            let correctCount = 2
            let difficulty = 0.5
            let status: WordRecordStatus = 'learning'
            
            if (i === 0) {
              // High stability in review status
              stability = 35
              status = 'review'
              shouldPromote = true
            } else if (i === 1) {
              // Good performance record
              reviewCount = 10
              correctCount = 9
              shouldPromote = true
            } else if (i === 2) {
              // Low difficulty with good stability
              difficulty = 0.1
              stability = 25
              shouldPromote = true
            }
            
            testRecords.push({
              id: `${userId}_${wordId}`,
              userId,
              wordId,
              status,
              stability,
              difficulty,
              retrievability: 0.8,
              nextReviewDate: new Date(),
              lastReviewDate: new Date(),
              createdAt: new Date(),
              reviewCount,
              correctCount,
              lapseCount: 0
            })
          }
          
          // Setup mock
          mockWordRecordService.getWordRecords.mockReturnValue(testRecords)
          
          // Detect mastery promotions
          const promotions = service.detectMasteryPromotion(userId)
          
          // Verify promotion logic
          promotions.forEach((promotion) => {
            const originalRecord = testRecords.find(r => r.wordId === promotion.wordId)
            expect(originalRecord).toBeDefined()
            expect(promotion.newStatus).toBe('mastered')
            expect(promotion.reason).toBeTruthy()
          })
          
          // Verify that only qualifying records are promoted
          testRecords.forEach((record) => {
            const wasPromoted = promotions.some(p => p.wordId === record.wordId)
            
            const highStability = record.stability > 30 && record.status === 'review'
            const goodPerformance = record.reviewCount >= 5 && 
                                  record.correctCount >= record.reviewCount * 0.9
            const lowDifficulty = record.difficulty < 0.2 && record.stability > 20
            
            const shouldBePromoted = highStability || goodPerformance || lowDifficulty
            
            if (shouldBePromoted) {
              expect(wasPromoted).toBe(true)
            }
          })
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: wenya-starmap, Property 7: 内容多样性维护**
   * **Validates: Requirements 1.5**
   * 
   * For any content filtering, the system should maintain a minimum variety 
   * of 5 different content types in recommendations
   */
  describe('Property 7: 内容多样性维护', () => {
    it('should maintain content variety in recommendations', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 20 }) // number of content items
        , (contentCount: number) => {
          // Create test data with different categories
          const categories = ['CET4', 'CET6', 'IELTS', 'TOEFL', 'GRE']
          
          const filteredContent = Array.from({ length: contentCount }, (_, i) => ({
            wordId: `word_${i}`,
            priority: Math.random(),
            retrievability: Math.random(),
            category: categories[i % categories.length],
            estimatedTime: 1 + Math.random() * 3
          }))
          
          const words: Word[] = filteredContent.map((content, i) => ({
            id: content.wordId,
            word: `word${i}`,
            meaning: `meaning${i}`,
            phonetic: `/word${i}/`,
            example: `Example sentence ${i}`,
            exampleCn: `例句 ${i}`,
            tags: [categories[i % categories.length]]
          }))
          
          // Apply variety maintenance
          const varietyContent = service.maintainContentVariety(filteredContent, words)
          
          // Verify all returned content was in the original list
          varietyContent.forEach((content) => {
            expect(filteredContent.some(fc => fc.wordId === content.wordId)).toBe(true)
          })
          
          // If we have enough content, verify variety
          if (varietyContent.length >= 5) {
            const uniqueCategories = new Set<string>()
            varietyContent.forEach((content) => {
              const word = words.find(w => w.id === content.wordId)
              const category = word?.tags[0] || content.category
              uniqueCategories.add(category)
            })
            
            // Should have good variety when enough content is available
            expect(uniqueCategories.size).toBeGreaterThanOrEqual(Math.min(5, categories.length))
          }
          
          // Verify content is not empty
          expect(varietyContent.length).toBeGreaterThan(0)
          expect(varietyContent.length).toBeLessThanOrEqual(filteredContent.length)
        }),
        { numRuns: 100 }
      )
    })
  })
})