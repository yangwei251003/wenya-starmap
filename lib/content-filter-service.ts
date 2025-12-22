/**
 * Content Filter Service
 * 
 * Implements intelligent content filtering to avoid duplicate learning
 * of mastered content and prioritize learning based on retrievability.
 * 
 * Requirements: 1.1, 1.2, 1.4, 1.5
 */

import { WordRecord, WordRecordStatus, Word } from '@/types'
import { calculateRetrievability } from './fsrs-algorithm'
import { wordRecordService } from './word-record-service'

export interface ContentFilterOptions {
  userId: string
  availableContent: string[] // word IDs
  timeAvailable?: number // minutes
  maxItems?: number
  maintainVariety?: boolean
}

export interface FilteredContent {
  wordId: string
  priority: number // 0-1, higher = more urgent
  retrievability: number
  category: string
  estimatedTime: number // minutes
}

export interface MasteryPromotionResult {
  wordId: string
  oldStatus: WordRecordStatus
  newStatus: WordRecordStatus
  reason: string
}

export class ContentFilterService {
  private readonly MASTERY_STABILITY_THRESHOLD = 90 // days
  private readonly MASTERY_STATUS = 'mastered'
  private readonly MIN_CONTENT_VARIETY = 5
  private readonly AUTO_PROMOTION_THRESHOLD = 3 // consecutive good reviews

  /**
   * Filter out mastered content based on stability and status
   * Requirement 1.1: Exclude words with mastery level "已掌握" and stability > 90 days
   */
  filterMasteredContent(options: ContentFilterOptions): string[] {
    const { userId, availableContent } = options
    
    return availableContent.filter(wordId => {
      const record = wordRecordService.getWordRecord(userId, wordId)
      
      // If no record exists, content is available for learning
      if (!record) {
        return true
      }
      
      // Filter out mastered content with high stability
      if (record.status === this.MASTERY_STATUS && 
          record.stability > this.MASTERY_STABILITY_THRESHOLD) {
        return false
      }
      
      return true
    })
  }

  /**
   * Prioritize content by retrievability and learning urgency
   * Requirement 1.2: Prioritize based on retrievability scores and learning urgency
   */
  prioritizeByRetrievability(
    userId: string, 
    contentIds: string[],
    words: Word[] = []
  ): FilteredContent[] {
    const now = new Date()
    
    const prioritizedContent = contentIds.map(wordId => {
      const record = wordRecordService.getWordRecord(userId, wordId)
      const word = words.find(w => w.id === wordId)
      
      let retrievability = 1.0
      let priority = 0.5
      
      if (record) {
        // Calculate current retrievability
        const elapsedDays = (now.getTime() - record.lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)
        retrievability = calculateRetrievability(record.stability, elapsedDays)
        
        // Priority based on retrievability (lower retrievability = higher priority)
        priority = 1 - retrievability
        
        // Boost priority for overdue reviews
        if (now > record.nextReviewDate) {
          const overdueHours = (now.getTime() - record.nextReviewDate.getTime()) / (1000 * 60 * 60)
          priority = Math.min(1, priority + (overdueHours / 24) * 0.1)
        }
        
        // Boost priority for words that have been forgotten before
        if (record.lapseCount > 0) {
          priority = Math.min(1, priority + record.lapseCount * 0.05)
        }
      } else {
        // New words get medium priority
        priority = 0.6
      }
      
      return {
        wordId,
        priority,
        retrievability,
        category: word?.tags[0] || 'general',
        estimatedTime: this.estimateStudyTime(record, word)
      }
    })
    
    // Sort by priority (highest first)
    return prioritizedContent.sort((a, b) => b.priority - a.priority)
  }

  /**
   * Maintain content variety in recommendations
   * Requirement 1.5: Maintain minimum variety of 5 different content types
   */
  maintainContentVariety(
    filteredContent: FilteredContent[],
    words: Word[] = []
  ): FilteredContent[] {
    if (filteredContent.length <= this.MIN_CONTENT_VARIETY) {
      return filteredContent
    }
    
    // Group by category
    const categoryGroups = new Map<string, FilteredContent[]>()
    
    filteredContent.forEach(content => {
      const word = words.find(w => w.id === content.wordId)
      const category = word?.tags[0] || content.category || 'general'
      
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, [])
      }
      categoryGroups.get(category)!.push(content)
    })
    
    // Ensure variety by taking items from different categories
    const result: FilteredContent[] = []
    const categories = Array.from(categoryGroups.keys())
    let categoryIndex = 0
    
    // First pass: ensure at least one item from each category
    categories.forEach(category => {
      const items = categoryGroups.get(category)!
      if (items.length > 0) {
        result.push(items[0])
      }
    })
    
    // Second pass: fill remaining slots with round-robin from categories
    const remainingSlots = Math.min(
      filteredContent.length - result.length,
      filteredContent.length
    )
    
    for (let i = 0; i < remainingSlots; i++) {
      const category = categories[categoryIndex % categories.length]
      const items = categoryGroups.get(category)!
      const usedFromCategory = result.filter(r => {
        const word = words.find(w => w.id === r.wordId)
        return (word?.tags[0] || r.category) === category
      }).length
      
      if (usedFromCategory < items.length) {
        result.push(items[usedFromCategory])
      }
      
      categoryIndex++
    }
    
    return result
  }

  /**
   * Detect and promote words to mastered status automatically
   * Requirement 1.4: Automatically promote content to mastered status based on performance
   */
  detectMasteryPromotion(userId: string): MasteryPromotionResult[] {
    const records = wordRecordService.getWordRecords(userId)
    const promotions: MasteryPromotionResult[] = []
    
    records.forEach(record => {
      if (record.status === 'mastered') {
        return // Already mastered
      }
      
      const shouldPromote = this.shouldPromoteToMastery(record)
      
      if (shouldPromote.promote) {
        // Update the record status
        const updatedRecord = {
          ...record,
          status: 'mastered' as WordRecordStatus
        }
        
        // Save the updated record (this would normally go through the service)
        // For now, we'll just track the promotion
        promotions.push({
          wordId: record.wordId,
          oldStatus: record.status,
          newStatus: 'mastered',
          reason: shouldPromote.reason
        })
      }
    })
    
    return promotions
  }

  /**
   * Get confirmation dialog data for mastered content
   * Requirement 1.3: Display confirmation dialog for mastered content
   */
  getMasteredContentConfirmation(userId: string, wordId: string): {
    isMastered: boolean
    stability: number
    lastReview: Date
    message: string
  } | null {
    const record = wordRecordService.getWordRecord(userId, wordId)
    
    if (!record || record.status !== 'mastered' || 
        record.stability <= this.MASTERY_STABILITY_THRESHOLD) {
      return null
    }
    
    return {
      isMastered: true,
      stability: record.stability,
      lastReview: record.lastReviewDate,
      message: `This word has been mastered with ${record.stability.toFixed(1)} days stability. Are you sure you want to review it again?`
    }
  }

  /**
   * Estimate study time for a word based on difficulty and history
   */
  private estimateStudyTime(record: WordRecord | null, word: Word | undefined): number {
    let baseTime = 1 // 1 minute base time
    
    if (record) {
      // Adjust based on difficulty
      baseTime += record.difficulty * 2
      
      // Adjust based on lapse count
      baseTime += record.lapseCount * 0.5
      
      // New words take longer
      if (record.status === 'new') {
        baseTime += 1
      }
    } else {
      // New word
      baseTime = 2
    }
    
    // Adjust based on word complexity (if available)
    if (word) {
      if (word.word.length > 8) {
        baseTime += 0.5
      }
      if (word.confusingWords && word.confusingWords.length > 0) {
        baseTime += 1
      }
    }
    
    return Math.round(baseTime * 10) / 10 // Round to 1 decimal place
  }

  /**
   * Determine if a word should be promoted to mastery
   */
  private shouldPromoteToMastery(record: WordRecord): { promote: boolean; reason: string } {
    // Check for high stability
    if (record.stability > 30 && record.status === 'review') {
      return {
        promote: true,
        reason: `High stability (${record.stability.toFixed(1)} days) in review status`
      }
    }
    
    // Check for consistent good performance
    if (record.reviewCount >= 5 && record.correctCount >= record.reviewCount * 0.9) {
      return {
        promote: true,
        reason: `Consistent performance: ${record.correctCount}/${record.reviewCount} correct`
      }
    }
    
    // Check for low difficulty and high stability
    if (record.difficulty < 0.2 && record.stability > 20) {
      return {
        promote: true,
        reason: `Low difficulty (${record.difficulty.toFixed(2)}) with good stability`
      }
    }
    
    return { promote: false, reason: '' }
  }
}

// Export singleton instance
export const contentFilterService = new ContentFilterService()