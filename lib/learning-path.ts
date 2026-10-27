// 学习路径生成和管理服务

import { 
  LearningPath, 
  EnglishLevel, 
  Lesson, 
  UserPerformance,
  Progress,
  User,
  LearningStats
} from '@/types'
import { aiTutor } from './ai-tutor'

/**
 * 学习路径生成器
 */
export class LearningPathGenerator {
  /**
   * 基于用户评估结果生成个性化学习路径
   * @param userId - 用户ID
   * @param currentLevel - 当前英语水平
   * @param targetLevel - 目标英语水平
   * @param assessmentResults - 评估结果（可选）
   * @returns 生成的学习路径
   */
  async generateLearningPath(
    userId: string,
    currentLevel: EnglishLevel,
    targetLevel: EnglishLevel,
    assessmentResults?: {
      vocabulary: number
      grammar: number
      listening: number
      speaking: number
      reading: number
      writing: number
    }
  ): Promise<LearningPath> {
    // 构建AI提示词，基于评估结果生成个性化建议
    const prompt = this.buildLearningPathPrompt(
      currentLevel,
      targetLevel,
      assessmentResults
    )

    // 使用AI生成学习建议
    const aiSuggestion = await aiTutor.generateContent(prompt, currentLevel)

    // 生成推荐课程列表
    const recommendedLessons = await this.generateRecommendedLessons(
      currentLevel,
      targetLevel,
      assessmentResults
    )

    // 创建学习路径对象
    const learningPath: LearningPath = {
      id: this.generateId(),
      userId,
      currentLevel,
      targetLevel,
      completedLessons: [],
      recommendedNext: recommendedLessons,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return learningPath
  }

  /**
   * 动态调整学习路径
   * @param learningPath - 当前学习路径
   * @param performance - 用户表现数据
   * @param completedLessons - 新完成的课程
   * @returns 更新后的学习路径
   */
  async adjustLearningPath(
    learningPath: LearningPath,
    performance: UserPerformance,
    completedLessons: string[]
  ): Promise<LearningPath> {
    // 更新完成的课程列表
    const updatedCompletedLessons = Array.from(
      new Set([...learningPath.completedLessons, ...completedLessons])
    )

    // 基于表现评估是否需要调整难度
    const shouldAdjustLevel = this.shouldAdjustLevel(performance)
    let newCurrentLevel = learningPath.currentLevel

    if (shouldAdjustLevel) {
      newCurrentLevel = this.getNextLevel(learningPath.currentLevel, performance.accuracy)
    }

    // 获取AI反馈以调整学习路径
    const feedback = await aiTutor.provideFeedback(performance)

    // 生成新的推荐课程
    const newRecommendations = await this.generateRecommendedLessons(
      newCurrentLevel,
      learningPath.targetLevel,
      undefined,
      updatedCompletedLessons
    )

    // 计算进度
    const progress = this.calculateProgress(
      learningPath.currentLevel,
      newCurrentLevel,
      learningPath.targetLevel,
      updatedCompletedLessons.length
    )

    // 返回更新后的学习路径
    return {
      ...learningPath,
      currentLevel: newCurrentLevel,
      completedLessons: updatedCompletedLessons,
      recommendedNext: newRecommendations,
      progress,
      updatedAt: new Date(),
    }
  }

  /**
   * 获取下一个推荐课程
   * @param learningPath - 学习路径
   * @returns 下一个推荐课程
   */
  getNextLesson(learningPath: LearningPath): Lesson | null {
    if (learningPath.recommendedNext.length === 0) {
      return null
    }

    // 返回第一个未完成的推荐课程
    const nextLesson = learningPath.recommendedNext.find(
      lesson => !learningPath.completedLessons.includes(lesson.id)
    )

    return nextLesson || null
  }

  /**
   * 构建学习路径生成提示词
   */
  private buildLearningPathPrompt(
    currentLevel: EnglishLevel,
    targetLevel: EnglishLevel,
    assessmentResults?: {
      vocabulary: number
      grammar: number
      listening: number
      speaking: number
      reading: number
      writing: number
    }
  ): string {
    let prompt = `请为一位${this.getLevelDescription(currentLevel)}的英语学习者制定学习计划，目标是达到${this.getLevelDescription(targetLevel)}水平。`

    if (assessmentResults) {
      prompt += `\n\n评估结果：
- 词汇：${assessmentResults.vocabulary}/100
- 语法：${assessmentResults.grammar}/100
- 听力：${assessmentResults.listening}/100
- 口语：${assessmentResults.speaking}/100
- 阅读：${assessmentResults.reading}/100
- 写作：${assessmentResults.writing}/100`
    }

    prompt += `\n\n请提供：
1. 学习重点和优先级
2. 建议的学习顺序
3. 每个阶段的学习目标
4. 预计学习时间

请用简洁的中文回答。`

    return prompt
  }

  /**
   * 生成推荐课程列表
   */
  private async generateRecommendedLessons(
    currentLevel: EnglishLevel,
    targetLevel: EnglishLevel,
    assessmentResults?: any,
    excludeLessons: string[] = []
  ): Promise<Lesson[]> {
    // 这里应该从数据库获取课程，现在返回模拟数据
    const allLessons = this.getMockLessons(currentLevel)

    // 过滤掉已完成的课程
    const availableLessons = allLessons.filter(
      lesson => !excludeLessons.includes(lesson.id)
    )

    // 根据评估结果排序课程优先级
    if (assessmentResults) {
      return this.prioritizeLessons(availableLessons, assessmentResults)
    }

    // 返回前5个推荐课程
    return availableLessons.slice(0, 5)
  }

  /**
   * 判断是否需要调整难度等级
   */
  private shouldAdjustLevel(performance: UserPerformance): boolean {
    // 如果准确率持续高于85%，考虑提升难度
    if (performance.accuracy >= 0.85 && performance.answers.length >= 10) {
      return true
    }

    // 如果准确率持续低于50%，考虑降低难度
    if (performance.accuracy < 0.5 && performance.answers.length >= 10) {
      return true
    }

    return false
  }

  /**
   * 获取下一个等级
   */
  private getNextLevel(currentLevel: EnglishLevel, accuracy: number): EnglishLevel {
    const levels: EnglishLevel[] = ['beginner', 'intermediate', 'advanced']
    const currentIndex = levels.indexOf(currentLevel)

    // 准确率高，提升等级
    if (accuracy >= 0.85 && currentIndex < levels.length - 1) {
      return levels[currentIndex + 1]
    }

    // 准确率低，降低等级
    if (accuracy < 0.5 && currentIndex > 0) {
      return levels[currentIndex - 1]
    }

    return currentLevel
  }

  /**
   * 计算学习进度
   */
  private calculateProgress(
    startLevel: EnglishLevel,
    currentLevel: EnglishLevel,
    targetLevel: EnglishLevel,
    completedLessonsCount: number
  ): number {
    const levels: EnglishLevel[] = ['beginner', 'intermediate', 'advanced']
    const startIndex = levels.indexOf(startLevel)
    const currentIndex = levels.indexOf(currentLevel)
    const targetIndex = levels.indexOf(targetLevel)

    if (targetIndex <= startIndex) {
      return 100 // 已达到或超过目标
    }

    // 基于等级进度
    const levelProgress = ((currentIndex - startIndex) / (targetIndex - startIndex)) * 70

    // 基于完成课程数量
    const lessonProgress = Math.min((completedLessonsCount / 20) * 30, 30)

    return Math.min(Math.round(levelProgress + lessonProgress), 100)
  }

  /**
   * 获取等级描述
   */
  private getLevelDescription(level: EnglishLevel): string {
    const descriptions = {
      beginner: '初学者',
      intermediate: '中级学习者',
      advanced: '高级学习者'
    }
    return descriptions[level]
  }

  /**
   * 根据评估结果排序课程优先级
   */
  private prioritizeLessons(lessons: Lesson[], assessmentResults: any): Lesson[] {
    // 简单实现：根据课程类别和评估结果排序
    return lessons.sort((a, b) => {
      // 这里可以根据评估结果调整排序逻辑
      return a.order - b.order
    })
  }

  /**
   * 获取模拟课程数据
   */
  private getMockLessons(level: EnglishLevel): Lesson[] {
    const lessons: Lesson[] = [
      {
        id: 'lesson-1',
        title: '基础问候语',
        description: '学习日常问候和自我介绍',
        level: 'beginner',
        category: 'speaking',
        content: {
          type: 'text',
          data: '学习基本的问候语和自我介绍表达'
        },
        exercises: [],
        estimatedTime: 15,
        order: 1,
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'lesson-2',
        title: '基础词汇：家庭',
        description: '学习家庭成员相关词汇',
        level: 'beginner',
        category: 'vocabulary',
        content: {
          type: 'text',
          data: '学习家庭成员的英文表达'
        },
        exercises: [],
        estimatedTime: 20,
        order: 2,
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'lesson-3',
        title: '现在时态',
        description: '学习一般现在时的用法',
        level: 'beginner',
        category: 'grammar',
        content: {
          type: 'text',
          data: '学习一般现在时的构成和用法'
        },
        exercises: [],
        estimatedTime: 25,
        order: 3,
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'lesson-4',
        title: '日常对话',
        description: '练习日常生活对话',
        level: 'intermediate',
        category: 'speaking',
        content: {
          type: 'interactive',
          data: '模拟日常对话场景'
        },
        exercises: [],
        estimatedTime: 30,
        order: 4,
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'lesson-5',
        title: '商务英语基础',
        description: '学习基础商务英语表达',
        level: 'intermediate',
        category: 'business',
        content: {
          type: 'text',
          data: '学习商务场景常用表达'
        },
        exercises: [],
        estimatedTime: 35,
        order: 5,
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'lesson-6',
        title: '高级阅读理解',
        description: '提升阅读理解能力',
        level: 'advanced',
        category: 'reading',
        content: {
          type: 'text',
          data: '练习复杂文章的阅读理解'
        },
        exercises: [],
        estimatedTime: 40,
        order: 6,
        isActive: true,
        createdAt: new Date()
      }
    ]

    // 根据等级过滤课程
    return lessons.filter(lesson => {
      if (level === 'beginner') return lesson.level === 'beginner'
      if (level === 'intermediate') return lesson.level === 'beginner' || lesson.level === 'intermediate'
      return true // advanced 可以访问所有课程
    })
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `lp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 创建学习路径生成器实例
 */
export function createLearningPathGenerator(): LearningPathGenerator {
  return new LearningPathGenerator()
}

/**
 * 默认学习路径生成器实例
 */
export const learningPathGenerator = createLearningPathGenerator()

/**
 * 学习路径管理服务
 */
export class LearningPathService {
  private generator: LearningPathGenerator

  constructor() {
    this.generator = new LearningPathGenerator()
  }

  /**
   * 为新用户创建学习路径
   */
  async createPathForNewUser(
    userId: string,
    assessmentData: {
      level: EnglishLevel
      targetLevel?: EnglishLevel
      scores?: {
        vocabulary: number
        grammar: number
        listening: number
        speaking: number
        reading: number
        writing: number
      }
    }
  ): Promise<LearningPath> {
    const targetLevel = assessmentData.targetLevel || this.getDefaultTargetLevel(assessmentData.level)
    
    return await this.generator.generateLearningPath(
      userId,
      assessmentData.level,
      targetLevel,
      assessmentData.scores
    )
  }

  /**
   * 更新学习路径
   */
  async updatePath(
    currentPath: LearningPath,
    performance: UserPerformance,
    newCompletedLessons: string[]
  ): Promise<LearningPath> {
    return await this.generator.adjustLearningPath(
      currentPath,
      performance,
      newCompletedLessons
    )
  }

  /**
   * 获取下一个推荐课程
   */
  getNextRecommendation(path: LearningPath): Lesson | null {
    return this.generator.getNextLesson(path)
  }

  /**
   * 获取默认目标等级
   */
  private getDefaultTargetLevel(currentLevel: EnglishLevel): EnglishLevel {
    if (currentLevel === 'beginner') return 'intermediate'
    if (currentLevel === 'intermediate') return 'advanced'
    return 'advanced'
  }
}

/**
 * 默认学习路径服务实例
 */
export const learningPathService = new LearningPathService()