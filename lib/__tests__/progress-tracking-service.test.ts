import {
  ProgressTrackingService,
  createProgressTrackingService,
  ProgressData
} from '../progress-tracking-service'
import {
  LearningSession,
  Progress,
  StarAchievement
} from '@/types'

describe('ProgressTrackingService', () => {
  let service: ProgressTrackingService

  beforeEach(() => {
    service = createProgressTrackingService()
  })

  describe('calculateStats', () => {
    it('should calculate basic statistics correctly', () => {
      const mockData: ProgressData = {
        userId: 'user-1',
        sessions: [
          {
            id: 'session-1',
            userId: 'user-1',
            startTime: new Date('2024-01-01T10:00:00'),
            endTime: new Date('2024-01-01T11:00:00'),
            lessonsCompleted: ['lesson-1'],
            exercisesCompleted: ['ex-1', 'ex-2'],
            totalScore: 85,
            timeSpent: 3600,
            achievements: []
          }
        ],
        progress: [
          {
            id: 'prog-1',
            userId: 'user-1',
            lessonId: 'lesson-1',
            status: 'completed',
            score: 85,
            timeSpent: 3600,
            completedAt: new Date('2024-01-01T11:00:00'),
            createdAt: new Date('2024-01-01T10:00:00')
          }
        ],
        achievements: []
      }

      const stats = service.calculateStats(mockData)

      expect(stats.totalStudyTime).toBe(3600)
      expect(stats.lessonsCompleted).toBe(1)
      expect(stats.exercisesCompleted).toBe(2)
      expect(stats.averageScore).toBe(85)
    })

    it('should handle empty data', () => {
      const emptyData: ProgressData = {
        userId: 'user-1',
        sessions: [],
        progress: [],
        achievements: []
      }

      const stats = service.calculateStats(emptyData)

      expect(stats.totalStudyTime).toBe(0)
      expect(stats.lessonsCompleted).toBe(0)
      expect(stats.exercisesCompleted).toBe(0)
      expect(stats.averageScore).toBe(0)
      expect(stats.currentStreak).toBe(0)
    })

    it('should calculate average score correctly', () => {
      const mockData: ProgressData = {
        userId: 'user-1',
        sessions: [],
        progress: [
          {
            id: 'prog-1',
            userId: 'user-1',
            lessonId: 'lesson-1',
            status: 'completed',
            score: 80,
            timeSpent: 1800,
            completedAt: new Date(),
            createdAt: new Date()
          },
          {
            id: 'prog-2',
            userId: 'user-1',
            lessonId: 'lesson-2',
            status: 'completed',
            score: 90,
            timeSpent: 1800,
            completedAt: new Date(),
            createdAt: new Date()
          },
          {
            id: 'prog-3',
            userId: 'user-1',
            lessonId: 'lesson-3',
            status: 'in_progress',
            timeSpent: 900,
            createdAt: new Date()
          }
        ],
        achievements: []
      }

      const stats = service.calculateStats(mockData)

      expect(stats.averageScore).toBe(85) // (80 + 90) / 2
      expect(stats.lessonsCompleted).toBe(2)
    })
  })

  describe('analyzeTrends', () => {
    it('should analyze trends for the specified number of days', () => {
      const now = new Date()
      const sessions: LearningSession[] = [
        {
          id: 'session-1',
          userId: 'user-1',
          startTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          lessonsCompleted: ['lesson-1'],
          exercisesCompleted: ['ex-1'],
          totalScore: 85,
          timeSpent: 1800,
          achievements: []
        },
        {
          id: 'session-2',
          userId: 'user-1',
          startTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          lessonsCompleted: ['lesson-2'],
          exercisesCompleted: ['ex-2'],
          totalScore: 90,
          timeSpent: 2400,
          achievements: []
        }
      ]

      const trends = service.analyzeTrends(sessions, 7)

      expect(trends).toHaveLength(7)
      expect(trends[0].studyTime).toBeGreaterThanOrEqual(0)
    })

    it('should aggregate data by date correctly', () => {
      const date = new Date('2024-01-15T10:00:00')
      const sessions: LearningSession[] = [
        {
          id: 'session-1',
          userId: 'user-1',
          startTime: new Date('2024-01-15T10:00:00'),
          lessonsCompleted: ['lesson-1'],
          exercisesCompleted: ['ex-1'],
          totalScore: 80,
          timeSpent: 1800,
          achievements: []
        },
        {
          id: 'session-2',
          userId: 'user-1',
          startTime: new Date('2024-01-15T14:00:00'),
          lessonsCompleted: ['lesson-2'],
          exercisesCompleted: ['ex-2'],
          totalScore: 90,
          timeSpent: 2400,
          achievements: []
        }
      ]

      const trends = service.analyzeTrends(sessions, 1)

      expect(trends).toHaveLength(1)
      expect(trends[0].studyTime).toBe(4200) // 1800 + 2400
      expect(trends[0].lessonsCompleted).toBe(2)
      expect(trends[0].averageScore).toBe(85) // (80 + 90) / 2
    })
  })

  describe('analyzeProgress', () => {
    it('should provide comprehensive analysis', () => {
      const mockData: ProgressData = {
        userId: 'user-1',
        sessions: [
          {
            id: 'session-1',
            userId: 'user-1',
            startTime: new Date(),
            lessonsCompleted: ['lesson-1'],
            exercisesCompleted: ['ex-1', 'ex-2'],
            totalScore: 95,
            timeSpent: 3600,
            achievements: []
          }
        ],
        progress: [
          {
            id: 'prog-1',
            userId: 'user-1',
            lessonId: 'lesson-1',
            status: 'completed',
            score: 95,
            timeSpent: 3600,
            completedAt: new Date(),
            createdAt: new Date()
          }
        ],
        achievements: []
      }

      const analysis = service.analyzeProgress(mockData)

      expect(analysis.stats).toBeDefined()
      expect(analysis.trends).toBeDefined()
      expect(analysis.strengths).toBeDefined()
      expect(analysis.weaknesses).toBeDefined()
      expect(analysis.recommendations).toBeDefined()
    })

    it('should identify strengths for high performers', () => {
      const mockData: ProgressData = {
        userId: 'user-1',
        sessions: [],
        progress: [
          {
            id: 'prog-1',
            userId: 'user-1',
            lessonId: 'lesson-1',
            status: 'completed',
            score: 90,
            timeSpent: 1500,
            completedAt: new Date(),
            createdAt: new Date()
          },
          {
            id: 'prog-2',
            userId: 'user-1',
            lessonId: 'lesson-2',
            status: 'completed',
            score: 92,
            timeSpent: 1600,
            completedAt: new Date(),
            createdAt: new Date()
          }
        ],
        achievements: []
      }

      const analysis = service.analyzeProgress(mockData)

      expect(analysis.strengths).toContain('整体表现优秀')
      expect(analysis.strengths).toContain('学习效率高')
    })

    it('should identify weaknesses for low performers', () => {
      const mockData: ProgressData = {
        userId: 'user-1',
        sessions: [],
        progress: [
          {
            id: 'prog-1',
            userId: 'user-1',
            lessonId: 'lesson-1',
            status: 'completed',
            score: 50,
            timeSpent: 3600,
            completedAt: new Date(),
            createdAt: new Date()
          },
          {
            id: 'prog-2',
            userId: 'user-1',
            lessonId: 'lesson-2',
            status: 'completed',
            score: 55,
            timeSpent: 3600,
            completedAt: new Date(),
            createdAt: new Date()
          }
        ],
        achievements: []
      }

      const analysis = service.analyzeProgress(mockData)

      expect(analysis.weaknesses).toContain('需要加强基础知识')
    })

    it('should provide recommendations based on stats', () => {
      const mockData: ProgressData = {
        userId: 'user-1',
        sessions: [],
        progress: [
          {
            id: 'prog-1',
            userId: 'user-1',
            lessonId: 'lesson-1',
            status: 'completed',
            score: 65,
            timeSpent: 1800,
            completedAt: new Date(),
            createdAt: new Date()
          }
        ],
        achievements: []
      }

      const analysis = service.analyzeProgress(mockData)

      expect(analysis.recommendations.length).toBeGreaterThan(0)
    })
  })
})
