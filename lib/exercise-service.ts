// 练习服务 - 管理练习题生成、评估和反馈

import { 
  Exercise, 
  ExerciseType, 
  EnglishLevel, 
  Evaluation,
  Answer,
  UserPerformance,
  StarAchievement,
  AchievementType
} from '@/types'
import { aiTutor } from './ai-tutor'
import { exerciseAPI } from './api'

/**
 * 练习会话接口
 */
export interface ExerciseSession {
  id: string
  userId: string
  exercises: Exercise[]
  answers: Answer[]
  startTime: Date
  endTime?: Date
  currentIndex: number
  score: number
}

/**
 * 练习结果接口
 */
export interface ExerciseResult {
  sessionId: string
  totalExercises: number
  correctAnswers: number
  accuracy: number
  totalTime: number
  score: number
  achievements: StarAchievement[]
  feedback: string
}

/**
 * 练习服务类
 */
export class ExerciseService {
  /**
   * 生成练习题
   */
  async generateExercises(
    type: ExerciseType,
    level: EnglishLevel,
    count: number = 5
  ): Promise<Exercise[]> {
    const prompt = this.buildExercisePrompt(type, level, count)
    
    try {
      const content = await aiTutor.generateContent(prompt, level)
      const exercises = this.parseExercises(content, type, level)
      return exercises
    } catch (error) {
      console.error('生成练习题失败:', error)
      // 返回默认练习题
      return this.getDefaultExercises(type, level, count)
    }
  }

  /**
   * 评估答案
   */
  async evaluateAnswer(
    exercise: Exercise,
    userAnswer: string
  ): Promise<Evaluation> {
    try {
      const evaluation = await aiTutor.evaluateAnswer(
        exercise.question,
        userAnswer
      )
      
      // 如果是选择题，直接比较答案
      if (exercise.type === 'multiple_choice') {
        const isCorrect = userAnswer.trim().toLowerCase() === 
                         exercise.correctAnswer.trim().toLowerCase()
        evaluation.isCorrect = isCorrect
        evaluation.score = isCorrect ? 100 : 0
      }
      
      return evaluation
    } catch (error) {
      console.error('评估答案失败:', error)
      return {
        isCorrect: false,
        score: 0,
        feedback: '评估失败，请重试'
      }
    }
  }

  /**
   * 提交练习会话
   */
  async submitSession(session: ExerciseSession): Promise<ExerciseResult> {
    const correctAnswers = session.answers.filter(a => a.isCorrect).length
    const accuracy = session.answers.length > 0 
      ? correctAnswers / session.answers.length 
      : 0
    
    const totalTime = session.endTime 
      ? (session.endTime.getTime() - session.startTime.getTime()) / 1000
      : 0

    // 计算分数
    const score = this.calculateScore(session.answers, totalTime)

    // 检查成就
    const achievements = this.checkAchievements(session, accuracy, score)

    // 生成反馈
    const performance: UserPerformance = {
      userId: session.userId,
      answers: session.answers,
      timeSpent: totalTime,
      accuracy
    }

    const feedback = await aiTutor.provideFeedback(performance)

    return {
      sessionId: session.id,
      totalExercises: session.exercises.length,
      correctAnswers,
      accuracy,
      totalTime,
      score,
      achievements,
      feedback: feedback.message
    }
  }

  /**
   * 计算分数
   */
  private calculateScore(answers: Answer[], totalTime: number): number {
    if (answers.length === 0) return 0

    const correctCount = answers.filter(a => a.isCorrect).length
    const accuracy = correctCount / answers.length

    // 基础分数 (70%)
    const baseScore = accuracy * 70

    // 时间奖励 (30%) - 快速完成有奖励
    const avgTimePerQuestion = totalTime / answers.length
    const timeBonus = Math.max(0, 30 - avgTimePerQuestion / 10) * (30 / 30)

    return Math.round(baseScore + timeBonus)
  }

  /**
   * 检查成就
   */
  private checkAchievements(
    session: ExerciseSession,
    accuracy: number,
    score: number
  ): StarAchievement[] {
    const achievements: StarAchievement[] = []

    // 完美分数成就
    if (accuracy === 1.0) {
      achievements.push(this.createAchievement(
        session.userId,
        'perfect_score',
        '完美答题',
        '全部答对！你真棒！'
      ))
    }

    // 高分成就
    if (score >= 90) {
      achievements.push(this.createAchievement(
        session.userId,
        'grammar_expert',
        '语法专家',
        '获得90分以上的高分！'
      ))
    }

    // 根据练习类型添加特定成就
    const exerciseTypes = new Set(session.exercises.map(e => e.type))
    
    if (exerciseTypes.has('listening') && accuracy >= 0.8) {
      achievements.push(this.createAchievement(
        session.userId,
        'listening_champion',
        '听力冠军',
        '听力练习表现优秀！'
      ))
    }

    if (exerciseTypes.has('speaking') && accuracy >= 0.8) {
      achievements.push(this.createAchievement(
        session.userId,
        'speaking_star',
        '口语之星',
        '口语练习表现出色！'
      ))
    }

    return achievements
  }

  /**
   * 创建成就
   */
  private createAchievement(
    userId: string,
    type: AchievementType,
    title: string,
    description: string
  ): StarAchievement {
    return {
      id: `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      title,
      description,
      earnedAt: new Date(),
      starPosition: this.generateStarPosition()
    }
  }

  /**
   * 生成星星位置
   */
  private generateStarPosition(): { x: number; y: number } {
    return {
      x: Math.random() * 100,
      y: Math.random() * 100
    }
  }

  /**
   * 构建练习题生成提示
   */
  private buildExercisePrompt(
    type: ExerciseType,
    level: EnglishLevel,
    count: number
  ): string {
    const typeDescriptions = {
      multiple_choice: '选择题',
      fill_blank: '填空题',
      speaking: '口语练习',
      listening: '听力练习',
      reading_comprehension: '阅读理解',
      writing: '写作练习'
    }

    return `请生成${count}道${typeDescriptions[type]}，难度适合${level}水平的学习者。

请以JSON数组格式返回，每道题包含：
- question: 问题内容
- options: 选项数组（选择题需要）
- correctAnswer: 正确答案
- explanation: 答案解释
- difficulty: 难度等级(1-5)

只返回JSON数组，不要其他文字。`
  }

  /**
   * 解析练习题
   */
  private parseExercises(
    content: string,
    type: ExerciseType,
    level: EnglishLevel
  ): Exercise[] {
    try {
      const parsed = JSON.parse(content)
      const exercises = Array.isArray(parsed) ? parsed : [parsed]
      
      return exercises.map((ex, index) => ({
        id: `exercise_${Date.now()}_${index}`,
        type,
        question: ex.question || '',
        options: ex.options,
        correctAnswer: ex.correctAnswer || '',
        explanation: ex.explanation || '',
        difficulty: ex.difficulty || 3
      }))
    } catch (error) {
      console.error('解析练习题失败:', error)
      return []
    }
  }

  /**
   * 获取默认练习题
   */
  private getDefaultExercises(
    type: ExerciseType,
    level: EnglishLevel,
    count: number
  ): Exercise[] {
    const templates = this.getExerciseTemplates(type, level)
    return templates.slice(0, count).map((template, index) => ({
      ...template,
      id: `exercise_${Date.now()}_${index}`
    }))
  }

  /**
   * 获取练习题模板
   */
  private getExerciseTemplates(
    type: ExerciseType,
    level: EnglishLevel
  ): Exercise[] {
    // 简单的默认练习题模板
    const templates: Record<ExerciseType, Exercise[]> = {
      multiple_choice: [
        {
          id: '',
          type: 'multiple_choice',
          question: 'What is the past tense of "go"?',
          options: ['goed', 'went', 'gone', 'going'],
          correctAnswer: 'went',
          explanation: 'The past tense of "go" is "went".',
          difficulty: 2
        }
      ],
      fill_blank: [
        {
          id: '',
          type: 'fill_blank',
          question: 'I ___ to school every day. (go)',
          correctAnswer: 'go',
          explanation: 'Use the base form "go" for present simple.',
          difficulty: 1
        }
      ],
      speaking: [
        {
          id: '',
          type: 'speaking',
          question: 'Introduce yourself in English.',
          correctAnswer: 'My name is... I am from...',
          explanation: 'A good introduction includes your name and background.',
          difficulty: 2
        }
      ],
      listening: [
        {
          id: '',
          type: 'listening',
          question: 'Listen and answer: What is the main topic?',
          correctAnswer: 'varies',
          explanation: 'Focus on key words and main ideas.',
          difficulty: 3
        }
      ],
      reading_comprehension: [
        {
          id: '',
          type: 'reading_comprehension',
          question: 'Read the passage and answer: What is the main idea?',
          correctAnswer: 'varies',
          explanation: 'Look for topic sentences and key points.',
          difficulty: 3
        }
      ],
      writing: [
        {
          id: '',
          type: 'writing',
          question: 'Write a short paragraph about your hobby.',
          correctAnswer: 'varies',
          explanation: 'Include details and use descriptive language.',
          difficulty: 4
        }
      ]
    }

    return templates[type] || []
  }
}

/**
 * 创建练习服务实例
 */
export function createExerciseService(): ExerciseService {
  return new ExerciseService()
}

/**
 * 默认练习服务实例
 */
export const exerciseService = createExerciseService()
