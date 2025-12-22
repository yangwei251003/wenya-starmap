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
import { getExercisesByLevel, getRandomExercises } from './exercises-data'

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
    try {
      // 直接从题库获取练习题
      const exercises = getExercisesByLevel(type, level, count)
      
      if (exercises.length > 0) {
        return exercises
      }
      
      // 如果没有找到，返回随机题目
      return getRandomExercises(type, count)
    } catch (error) {
      console.error('生成练习题失败:', error)
      // 返回随机练习题作为后备
      return getRandomExercises(type, count)
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
      // 标准化答案（去除空格，转小写）
      const normalizedUserAnswer = userAnswer.trim().toLowerCase()
      const normalizedCorrectAnswer = exercise.correctAnswer.trim().toLowerCase()
      
      // 选择题和填空题直接比较
      if (exercise.type === 'multiple_choice' || exercise.type === 'fill_blank') {
        const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer
        return {
          isCorrect,
          score: isCorrect ? 100 : 0,
          feedback: isCorrect 
            ? '✓ 正确！' + exercise.explanation 
            : '✗ 错误。' + exercise.explanation
        }
      }
      
      // 听力题比较
      if (exercise.type === 'listening') {
        const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer
        return {
          isCorrect,
          score: isCorrect ? 100 : 0,
          feedback: isCorrect 
            ? '✓ 听得很准确！' + exercise.explanation 
            : '✗ 再听一次试试。' + exercise.explanation
        }
      }
      
      // 口语、阅读、写作题 - 检查关键词
      const keywords = normalizedCorrectAnswer.split(' ')
      const matchedKeywords = keywords.filter(keyword => 
        normalizedUserAnswer.includes(keyword)
      )
      const matchRate = matchedKeywords.length / keywords.length
      
      const isCorrect = matchRate >= 0.6 // 60%匹配度算正确
      const score = Math.round(matchRate * 100)
      
      return {
        isCorrect,
        score,
        feedback: isCorrect 
          ? `✓ 很好！得分：${score}分。${exercise.explanation}` 
          : `继续努力！得分：${score}分。${exercise.explanation}`
      }
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
