/**
 * Property-Based Tests for FSRS Algorithm
 * 
 * **Feature: memory-dashboard, Property 14: FSRS算法一致性**
 * **Validates: Requirements 6.3**
 */

import * as fc from 'fast-check';
import {
  calculateRetrievability,
  updateMemoryParams,
  calculateNextReview
} from '../fsrs-algorithm';

describe('FSRS Algorithm Property-Based Tests', () => {
  /**
   * **Feature: memory-dashboard, Property 14: FSRS算法一致性**
   * **Validates: Requirements 6.3**
   * 
   * For any word record, retrievability calculation should follow FSRS formula:
   * R = (1 + elapsed_time / (9 * stability)) ^ -1
   */
  describe('Property 14: FSRS Algorithm Consistency', () => {
    it('should calculate retrievability according to FSRS formula for all valid inputs', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.1, max: 1000, noNaN: true }), // stability
          fc.double({ min: 0, max: 365, noNaN: true })     // elapsedDays
        , (stability, elapsedDays) => {
          const retrievability = calculateRetrievability(stability, elapsedDays);
          
          // Verify formula: R = (1 + t / (9 * S)) ^ -1
          const expectedRetrievability = Math.pow(1 + elapsedDays / (9 * stability), -1);
          
          // Should match the formula
          expect(retrievability).toBeCloseTo(expectedRetrievability, 10);
          
          // Should always be between 0 and 1
          expect(retrievability).toBeGreaterThanOrEqual(0);
          expect(retrievability).toBeLessThanOrEqual(1);
        }),
        { numRuns: 100 }
      );
    });

    it('should have retrievability decrease as elapsed time increases', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.1, max: 1000, noNaN: true }), // stability
          fc.double({ min: 0, max: 180, noNaN: true }),    // elapsedDays1
          fc.double({ min: 1, max: 180, noNaN: true })     // additionalDays
        , (stability, elapsedDays1, additionalDays) => {
          const elapsedDays2 = elapsedDays1 + additionalDays;
          
          const r1 = calculateRetrievability(stability, elapsedDays1);
          const r2 = calculateRetrievability(stability, elapsedDays2);
          
          // More elapsed time should result in lower or equal retrievability
          expect(r2).toBeLessThanOrEqual(r1);
        }),
        { numRuns: 100 }
      );
    });

    it('should have retrievability increase with higher stability', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.1, max: 500, noNaN: true }),  // stability1
          fc.double({ min: 1, max: 500, noNaN: true }),    // additionalStability
          fc.double({ min: 1, max: 365, noNaN: true })     // elapsedDays
        , (stability1, additionalStability, elapsedDays) => {
          const stability2 = stability1 + additionalStability;
          
          const r1 = calculateRetrievability(stability1, elapsedDays);
          const r2 = calculateRetrievability(stability2, elapsedDays);
          
          // Higher stability should result in higher or equal retrievability
          expect(r2).toBeGreaterThanOrEqual(r1);
        }),
        { numRuns: 100 }
      );
    });

    it('should return 1.0 when elapsed time is 0', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.1, max: 1000, noNaN: true }) // stability
        , (stability) => {
          const retrievability = calculateRetrievability(stability, 0);
          
          // At time 0, retrievability should be 1.0 (just reviewed)
          expect(retrievability).toBeCloseTo(1.0, 10);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('updateMemoryParams consistency', () => {
    it('should increase stability for good/easy grades', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.1, max: 100, noNaN: true }),  // currentStability
          fc.double({ min: 0, max: 1, noNaN: true }),      // difficulty
          fc.constantFrom(3 as const, 4 as const)          // good or easy grade
        , (currentStability, difficulty, grade) => {
          const { newStability } = updateMemoryParams(currentStability, difficulty, grade);
          
          // Good or easy grades should increase stability
          expect(newStability).toBeGreaterThan(currentStability);
        }),
        { numRuns: 100 }
      );
    });

    it('should decrease stability for forgot grade', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 1, max: 100, noNaN: true }),    // currentStability (>1 to ensure decrease)
          fc.double({ min: 0, max: 1, noNaN: true })       // difficulty
        , (currentStability, difficulty) => {
          const { newStability } = updateMemoryParams(currentStability, difficulty, 1);
          
          // Forgot grade should decrease stability
          expect(newStability).toBeLessThan(currentStability);
        }),
        { numRuns: 100 }
      );
    });

    it('should keep difficulty in valid range [0, 1]', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.1, max: 100, noNaN: true }),  // currentStability
          fc.double({ min: 0, max: 1, noNaN: true }),      // difficulty
          fc.constantFrom(1 as const, 2 as const, 3 as const, 4 as const) // grade
        , (currentStability, difficulty, grade) => {
          const { newDifficulty } = updateMemoryParams(currentStability, difficulty, grade);
          
          // Difficulty should always stay between 0 and 1
          expect(newDifficulty).toBeGreaterThanOrEqual(0);
          expect(newDifficulty).toBeLessThanOrEqual(1);
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain minimum stability of 0.1', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.1, max: 100, noNaN: true }),  // currentStability
          fc.double({ min: 0, max: 1, noNaN: true }),      // difficulty
          fc.constantFrom(1 as const, 2 as const, 3 as const, 4 as const) // grade
        , (currentStability, difficulty, grade) => {
          const { newStability } = updateMemoryParams(currentStability, difficulty, grade);
          
          // Stability should never go below 0.1
          expect(newStability).toBeGreaterThanOrEqual(0.1);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('calculateNextReview consistency', () => {
    it('should schedule review in the future', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.1, max: 100, noNaN: true }),  // stability
          fc.double({ min: 0.5, max: 0.99, noNaN: true })  // targetRetention
        , (stability, targetRetention) => {
          const now = new Date();
          const nextReview = calculateNextReview(stability, targetRetention);
          
          // Next review should be in the future
          expect(nextReview.getTime()).toBeGreaterThan(now.getTime());
        }),
        { numRuns: 100 }
      );
    });

    it('should schedule later reviews for higher stability', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.1, max: 50, noNaN: true }),   // stability1
          fc.double({ min: 1, max: 50, noNaN: true }),     // additionalStability
          fc.double({ min: 0.8, max: 0.95, noNaN: true })  // targetRetention
        , (stability1, additionalStability, targetRetention) => {
          const stability2 = stability1 + additionalStability;
          
          const review1 = calculateNextReview(stability1, targetRetention);
          const review2 = calculateNextReview(stability2, targetRetention);
          
          // Higher stability should result in later review date
          expect(review2.getTime()).toBeGreaterThanOrEqual(review1.getTime());
        }),
        { numRuns: 100 }
      );
    });

    it('should schedule earlier reviews for higher target retention', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 1, max: 100, noNaN: true }),    // stability
          fc.double({ min: 0.7, max: 0.85, noNaN: true }), // targetRetention1
          fc.double({ min: 0.05, max: 0.15, noNaN: true }) // retentionIncrease
        , (stability, targetRetention1, retentionIncrease) => {
          const targetRetention2 = Math.min(0.99, targetRetention1 + retentionIncrease);
          
          const review1 = calculateNextReview(stability, targetRetention1);
          const review2 = calculateNextReview(stability, targetRetention2);
          
          // Higher target retention should result in earlier review date
          expect(review2.getTime()).toBeLessThanOrEqual(review1.getTime());
        }),
        { numRuns: 100 }
      );
    });
  });
});
