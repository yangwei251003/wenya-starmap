// 学习路径集成测试

import { 
  LearningPathGenerator,
  LearningPathService 
} from '../learning-path'
import { EnglishLevel, UserPerformance } from '@/types'

// Mock AI tutor
jest.mock('../ai-tutor', () => ({
  aiTutor: {
    generateContent: jest.fn().mockResolvedValue('AI生成的学习建议内容'),
    provideFeedback: jest.fn().mockResolvedValue({
      message: '做得很好！',
      encouragement: '继续加油！',
      areas_to_improve: ['语法'],
      next_steps: ['完成下一课'],
      estimated_progress: 75,
    }),
  },
}))

describe('学习路径集成测试', () => {
  it('应该完成完整的学习路径生成流程', async () => {
    const service = new LearningPathService()
    
    // 1. 为新用户创建学习路径
    const learningPath = await service.createPathForNewUser('test-user', {
      level: 'beginner',
      targetLevel: 'intermediate',
      scores: {
        vocabulary: 60,
        grammar: 65,
        listening: 55,
        speaking: 50,
        reading: 70,
        writing: 58,
      },
    })

    // 验证学习路径创建成功
    expect(learningPath.userId).toBe('test-user')
    expect(learningPath.currentLevel).toBe('beginner')
    expect(learningPath.targetLevel).toBe('intermediate')
    expect(learningPath.recommendedNext.length).toBeGreaterThan(0)

    // 2. 获取下一个推荐课程
    const nextLesson = service.getNextRecommendation(learningPath)
    expect(nextLesson).toBeDefined()

    // 3. 模拟完成课程后更新路径
    const performance: UserPerformance = {
      userId: 'test-user',
      lessonId: nextLesson!.id,
      answers: [
        { exerciseId: 'ex-1', userAnswer: 'ans1', isCorrect: true, timeSpent: 30 },
        { exerciseId: 'ex-2', userAnswer: 'ans2', isCorrect: true, timeSpent: 25 },
      ],
      timeSpent: 55,
      accuracy: 1.0,
    }

    const updatedPath = await service.updatePath(
      learningPath,
      performance,
      [nextLesson!.id]
    )

    // 验证路径更新成功
    expect(updatedPath.completedLessons).toContain(nextLesson!.id)
    expect(updatedPath.progress).toBeGreaterThan(0)
  })
})
