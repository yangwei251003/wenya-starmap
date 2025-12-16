import { AchievementService } from '../achievement-service'
import { StarAchievement, AchievementType } from '@/types'

describe('AchievementService', () => {
  let service: AchievementService

  beforeEach(() => {
    service = new AchievementService()
  })

  describe('checkAchievements', () => {
    it('should award first lesson achievement', () => {
      const data = {
        lessonsCompleted: 1
      }

      const achievements = service.checkAchievements('user1', data, [])
      
      expect(achievements.length).toBeGreaterThan(0)
      expect(achievements.some(a => a.type === 'first_lesson')).toBe(true)
    })

    it('should award daily streak achievement', () => {
      const data = {
        currentStreak: 7
      }

      const achievements = service.checkAchievements('user1', data, [])
      
      expect(achievements.some(a => a.type === 'daily_streak')).toBe(true)
    })

    it('should not award duplicate achievements', () => {
      const existingAchievements: StarAchievement[] = [
        {
          id: '1',
          userId: 'user1',
          type: 'first_lesson',
          title: 'First Lesson',
          description: 'Completed first lesson',
          earnedAt: new Date(),
          starPosition: { x: 50, y: 50 }
        }
      ]

      const data = {
        lessonsCompleted: 1
      }

      const achievements = service.checkAchievements('user1', data, existingAchievements)
      
      expect(achievements.every(a => a.type !== 'first_lesson')).toBe(true)
    })

    it('should award multiple achievements at once', () => {
      const data = {
        lessonsCompleted: 1,
        accuracy: 1.0,
        score: 95
      }

      const achievements = service.checkAchievements('user1', data, [])
      
      // Should get first_lesson, perfect_score, and grammar_expert
      expect(achievements.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('calculateProgress', () => {
    it('should calculate correct progress percentage', () => {
      const userAchievements: StarAchievement[] = [
        {
          id: '1',
          userId: 'user1',
          type: 'first_lesson',
          title: 'First',
          description: 'First',
          earnedAt: new Date(),
          starPosition: { x: 0, y: 0 }
        }
      ]

      const progress = service.calculateProgress(userAchievements)
      
      // Should be between 0 and 100
      expect(progress).toBeGreaterThan(0)
      expect(progress).toBeLessThanOrEqual(100)
    })

    it('should return 0 for no achievements', () => {
      const progress = service.calculateProgress([])
      expect(progress).toBe(0)
    })
  })

  describe('getNextAchievements', () => {
    it('should return next available achievements', () => {
      const existingAchievements: StarAchievement[] = [
        {
          id: '1',
          userId: 'user1',
          type: 'first_lesson',
          title: 'First',
          description: 'First',
          earnedAt: new Date(),
          starPosition: { x: 0, y: 0 }
        }
      ]

      const nextAchievements = service.getNextAchievements(existingAchievements, 3)
      
      expect(nextAchievements.length).toBeLessThanOrEqual(3)
      expect(nextAchievements.every(a => a.type !== 'first_lesson')).toBe(true)
    })

    it('should respect the limit parameter', () => {
      const nextAchievements = service.getNextAchievements([], 2)
      expect(nextAchievements.length).toBeLessThanOrEqual(2)
    })
  })

  describe('getAllAchievementConfigs', () => {
    it('should return all achievement configurations', () => {
      const configs = service.getAllAchievementConfigs()
      
      expect(configs.length).toBeGreaterThan(0)
      configs.forEach(config => {
        expect(config.type).toBeDefined()
        expect(config.title).toBeDefined()
        expect(config.description).toBeDefined()
        expect(config.icon).toBeDefined()
        expect(typeof config.condition).toBe('function')
      })
    })
  })
})
