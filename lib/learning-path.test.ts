// 学习路径生成和管理服务测试

import { 
  LearningPathGenerator, 
  LearningPathService,
  learningPathGenerator,
  learningPathService 
} from './learning-path'
import { EnglishLevel, UserPerformance } from '@/types'

// Mock AI tutor
jest.mock('./ai-tutor', () => ({
  aiTutor: {
    generateContent: jest.fn().mockResolvedValue('AI生成的学习建议'),
    provideFeedback: jest.fn().mockResolvedValue({
      message: '做得很好！',
      encouragement: '继续加油！',
      areas_to_improve: ['语法', '词汇'],
      next_steps: ['完成下一课'],
      estimated_progress: 75,
    }),
  },
}))

describe('LearningPathGenerator', () => {
  let generator: LearningPathGenerator

  beforeEach(() => {
    generator = new LearningPathGenerator()
  })

  describe('generateLearningPath', () => {
    it('应该为初学者生成学习路径', async () => {
      const userId = 'user-123'
      const currentLevel: EnglishLevel = 'beginner'
      const targetLevel: EnglishLevel = 'intermediate'

      const learningPath = await generator.generateLearningPath(
        userId,
        currentLevel,
        targetLevel
      )

      expect(learningPath).toBeDefined()
      expect(learningPath.userId).toBe(userId)
      expect(learningPath.currentLevel).toBe(currentLevel)
      expect(learningPath.targetLevel).toBe(targetLevel)
      expect(learningPath.completedLessons).toEqual([])
      expect(learningPath.recommendedNext.length).toBeGreaterThan(0)
      expect(learningPath.progress).toBe(0)
    })

    it('应该基于评估结果生成个性化学习路径', async () => {
      const userId = 'user-456'
      const assessmentResults = {
        vocabulary: 60,
        grammar: 70,
        listening: 50,
        speaking: 55,
        reading: 65,
        writing: 60,
      }

      const learningPath = await generator.generateLearningPath(
        'user-456',
        'beginner',
        'intermediate',
        assessmentResults
      )

      expect(learningPath).toBeDefined()
      expect(learningPath.recommendedNext.length).toBeGreaterThan(0)
    })
  })

  describe('adjustLearningPath', () => {
    it('应该根据用户表现调整学习路径', async () => {
      // 创建初始学习路径
      const initialPath = await generator.generateLearningPath(
        'user-789',
        'beginner',
        'intermediate'
      )

      // 模拟用户表现
      const performance: UserPerformance = {
        userId: 'user-789',
        lessonId: 'lesson-1',
        answers: [
          { exerciseId: 'ex-1', userAnswer: 'answer1', isCorrect: true, timeSpent: 30 },
          { exerciseId: 'ex-2', userAnswer: 'answer2', isCorrect: true, timeSpent: 25 },
          { exerciseId: 'ex-3', userAnswer: 'answer3', isCorrect: true, timeSpent: 35 },
        ],
        timeSpent: 90,
        accuracy: 1.0,
      }

      const adjustedPath = await generator.adjustLearningPath(
        initialPath,
        performance,
        ['lesson-1']
      )

      expect(adjustedPath.completedLessons).toContain('lesson-1')
      expect(adjustedPath.progress).toBeGreaterThan(initialPath.progress)
    })

    it('应该在表现优秀时提升难度等级', async () => {
      const initialPath = await generator.generateLearningPath(
        'user-excellent',
        'beginner',
        'advanced'
      )

      // 模拟优秀表现（准确率90%，完成10个练习）
      const excellentPerformance: UserPerformance = {
        userId: 'user-excellent',
        answers: Array(10).fill(null).map((_, i) => ({
          exerciseId: `ex-${i}`,
          userAnswer: 'correct',
          isCorrect: true,
          timeSpent: 30,
        })),
        timeSpent: 300,
        accuracy: 0.9,
      }

      const adjustedPath = await generator.adjustLearningPath(
        initialPath,
        excellentPerformance,
        ['lesson-1', 'lesson-2']
      )

      // 应该提升到中级
      expect(adjustedPath.currentLevel).toBe('intermediate')
    })
  })

  describe('getNextLesson', () => {
    it('应该返回下一个推荐课程', async () => {
      const learningPath = await generator.generateLearningPath(
        'user-next',
        'beginner',
        'intermediate'
      )

      const nextLesson = generator.getNextLesson(learningPath)

      expect(nextLesson).toBeDefined()
      expect(nextLesson?.level).toBe('beginner')
    })

    it('当所有课程完成时应该返回null', async () => {
      const learningPath = await generator.generateLearningPath(
        'user-complete',
        'beginner',
        'intermediate'
      )

      // 标记所有课程为已完成
      learningPath.completedLessons = learningPath.recommendedNext.map(l => l.id)

      const nextLesson = generator.getNextLesson(learningPath)

      expect(nextLesson).toBeNull()
    })
  })
})

describe('LearningPathService', () => {
  let service: LearningPathService

  beforeEach(() => {
    service = new LearningPathService()
  })

  describe('createPathForNewUser', () => {
    it('应该为新用户创建学习路径', async () => {
      const userId = 'new-user-123'
      const assessmentData = {
        level: 'beginner' as EnglishLevel,
        scores: {
          vocabulary: 50,
          grammar: 55,
          listening: 45,
          speaking: 50,
          reading: 60,
          writing: 48,
        },
      }

      const learningPath = await service.createPathForNewUser(userId, assessmentData)

      expect(learningPath).toBeDefined()
      expect(learningPath.userId).toBe(userId)
      expect(learningPath.currentLevel).toBe('beginner')
      expect(learningPath.targetLevel).toBe('intermediate')
    })

    it('应该使用指定的目标等级', async () => {
      const assessmentData = {
        level: 'beginner' as EnglishLevel,
        targetLevel: 'advanced' as EnglishLevel,
      }

      const learningPath = await service.createPathForNewUser('user-target', assessmentData)

      expect(learningPath.targetLevel).toBe('advanced')
    })
  })

  describe('updatePath', () => {
    it('应该更新学习路径', async () => {
      const initialPath = await service.createPathForNewUser('user-update', {
        level: 'beginner',
      })

      const performance: UserPerformance = {
        userId: 'user-update',
        answers: [
          { exerciseId: 'ex-1', userAnswer: 'ans', isCorrect: true, timeSpent: 20 },
        ],
        timeSpent: 20,
        accuracy: 1.0,
      }

      const updatedPath = await service.updatePath(initialPath, performance, ['lesson-1'])

      expect(updatedPath.completedLessons).toContain('lesson-1')
    })
  })

  describe('getNextRecommendation', () => {
    it('应该获取下一个推荐课程', async () => {
      const learningPath = await service.createPathForNewUser('user-rec', {
        level: 'beginner',
      })

      const nextLesson = service.getNextRecommendation(learningPath)

      expect(nextLesson).toBeDefined()
    })
  })
})

describe('导出的实例', () => {
  it('应该导出learningPathGenerator实例', () => {
    expect(learningPathGenerator).toBeInstanceOf(LearningPathGenerator)
  })

  it('应该导出learningPathService实例', () => {
    expect(learningPathService).toBeInstanceOf(LearningPathService)
  })
})
