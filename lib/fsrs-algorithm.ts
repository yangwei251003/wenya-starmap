/**
 * FSRS (Free Spaced Repetition Scheduler) Algorithm Implementation
 * 
 * This module implements the core FSRS algorithm for calculating memory
 * retrievability, updating memory parameters, and scheduling reviews.
 */

/**
 * Calculate the retrievability (probability of recall) for a word
 * based on FSRS formula: R = (1 + elapsed_time / (9 * stability)) ^ -1
 * 
 * @param stability - Memory stability in days (higher = more stable)
 * @param elapsedDays - Days since last review
 * @returns Retrievability value between 0 and 1
 */
export function calculateRetrievability(
  stability: number,
  elapsedDays: number
): number {
  if (stability <= 0) {
    throw new Error('Stability must be greater than 0');
  }
  if (elapsedDays < 0) {
    throw new Error('Elapsed days cannot be negative');
  }

  // FSRS formula: R = (1 + t / (9 * S)) ^ -1
  // where t = elapsed time, S = stability
  const retrievability = Math.pow(1 + elapsedDays / (9 * stability), -1);
  
  // Ensure result is between 0 and 1
  return Math.max(0, Math.min(1, retrievability));
}

/**
 * Update memory parameters after a review session
 * 
 * @param currentStability - Current stability value
 * @param difficulty - Current difficulty (0-1, higher = harder)
 * @param grade - User's performance grade (1=forgot, 2=hard, 3=good, 4=easy)
 * @returns Updated stability and difficulty values
 */
export function updateMemoryParams(
  currentStability: number,
  difficulty: number,
  grade: 1 | 2 | 3 | 4
): { newStability: number; newDifficulty: number } {
  if (currentStability <= 0) {
    throw new Error('Current stability must be greater than 0');
  }
  if (difficulty < 0 || difficulty > 1) {
    throw new Error('Difficulty must be between 0 and 1');
  }
  if (![1, 2, 3, 4].includes(grade)) {
    throw new Error('Grade must be 1, 2, 3, or 4');
  }

  // Stability increase factors based on grade
  const stabilityMultipliers = {
    1: 0.4,  // Forgot - decrease stability
    2: 1.0,  // Hard - maintain stability
    3: 2.5,  // Good - increase stability
    4: 4.0   // Easy - significantly increase stability
  };

  // Calculate new stability
  const multiplier = stabilityMultipliers[grade];
  let newStability = currentStability * multiplier;
  
  // Apply difficulty modifier (harder words grow stability slower)
  newStability = newStability * (1 - difficulty * 0.3);
  
  // Ensure minimum stability of 0.1 days
  newStability = Math.max(0.1, newStability);

  // Update difficulty based on performance
  let newDifficulty = difficulty;
  
  if (grade === 1) {
    // Forgot - increase difficulty
    newDifficulty = Math.min(1, difficulty + 0.2);
  } else if (grade === 4) {
    // Easy - decrease difficulty
    newDifficulty = Math.max(0, difficulty - 0.1);
  } else if (grade === 3) {
    // Good - slightly decrease difficulty
    newDifficulty = Math.max(0, difficulty - 0.05);
  }
  // grade 2 (hard) keeps difficulty unchanged

  return {
    newStability,
    newDifficulty
  };
}

/**
 * Calculate the next review date based on stability and target retention
 * 
 * @param stability - Current memory stability in days
 * @param targetRetention - Desired retention probability (typically 0.9)
 * @returns Date object for the next scheduled review
 */
export function calculateNextReview(
  stability: number,
  targetRetention: number = 0.9
): Date {
  if (stability <= 0) {
    throw new Error('Stability must be greater than 0');
  }
  if (targetRetention <= 0 || targetRetention >= 1) {
    throw new Error('Target retention must be between 0 and 1');
  }

  // Solve for t when R = targetRetention
  // R = (1 + t / (9 * S)) ^ -1
  // targetRetention = (1 + t / (9 * S)) ^ -1
  // 1 / targetRetention = 1 + t / (9 * S)
  // t = (1 / targetRetention - 1) * 9 * S
  
  const intervalDays = (1 / targetRetention - 1) * 9 * stability;
  
  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + Math.ceil(intervalDays));
  
  return nextReview;
}
