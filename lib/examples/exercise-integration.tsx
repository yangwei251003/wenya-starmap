/**
 * 互动练习系统集成示例
 * 
 * 这个文件展示如何在你的应用中集成互动练习系统
 */

'use client'

import { useState } from 'react'
import { 
  ExerciseCard, 
  ExerciseTypeSelector, 
  ExerciseResult,
  AchievementCelebration 
} from '@/components/exercise'
import { 
  exerciseService, 
  ExerciseSession, 
  ExerciseResult as ExerciseResultType 
} from '@/lib/exercise-service'
import { 
  Exercise, 
  ExerciseType, 
  EnglishLevel, 
  Evaluation,
  Answer 
} from '@/types'

/**
 * 示例1: 基础练习流程
 */
export function BasicExerciseExample() {
  const [viewState, setViewState] = useState<'menu' | 'exercise' | 'result'>('menu')
  const [session, setSession] = useState<ExerciseSession | null>(null)
  const [result, setResult] = useState<ExerciseResultType | null>(null)

  // 开始练习
  const handleStartExercise = async (type: ExerciseType) => {
    const exercises = await exerciseService.generateExercises(
      type,
      'intermediate', // 用户水平
      5 // 题目数量
    )

    const newSession: ExerciseSession = {
      id: `session_${Date.now()}`,
      userId: 'user_id', // 从认证系统获取
      exercises,
      answers: [],
      startTime: new Date(),
      currentIndex: 0,
      score: 0
    }

    setSession(newSession)
    setViewState('exercise')
  }

  // 提交答案
  const handleSubmitAnswer = async (userAnswer: string): Promise<Evaluation> => {
    if (!session) throw new Error('No session')

    const currentExercise = session.exercises[session.currentIndex]
    const evaluation = await exerciseService.evaluateAnswer(
      currentExercise,
      userAnswer
    )

    // 记录答案
    const answer: Answer = {
      exerciseId: currentExercise.id,
      userAnswer,
      isCorrect: evaluation.isCorrect,
      timeSpent: 10 // 实际应该记录真实用时
    }

    setSession({
      ...session,
      answers: [...session.answers, answer]
    })

    return evaluation
  }

  // 下一题
  const handleNext = async () => {
    if (!session) return

    if (session.currentIndex < session.exercises.length - 1) {
      setSession({
        ...session,
        currentIndex: session.currentIndex + 1
      })
    } else {
      // 完成练习
      const completedSession = { ...session, endTime: new Date() }
      const exerciseResult = await exerciseService.submitSession(completedSession)
      setResult(exerciseResult)
      setViewState('result')
    }
  }

  return (
    <div>
      {viewState === 'menu' && (
        <ExerciseTypeSelector onSelect={handleStartExercise} />
      )}
      
      {viewState === 'exercise' && session && (
        <ExerciseCard
          exercise={session.exercises[session.currentIndex]}
          onSubmit={handleSubmitAnswer}
          onNext={handleNext}
          currentIndex={session.currentIndex}
          totalExercises={session.exercises.length}
        />
      )}
      
      {viewState === 'result' && result && (
        <ExerciseResult
          result={result}
          onRestart={() => setViewState('menu')}
          onBackToMenu={() => setViewState('menu')}
        />
      )}
    </div>
  )
}

/**
 * 示例2: 自定义练习题
 */
export function CustomExerciseExample() {
  const [session, setSession] = useState<ExerciseSession | null>(null)

  const startCustomExercise = () => {
    // 创建自定义练习题
    const customExercises: Exercise[] = [
      {
        id: 'custom_1',
        type: 'multiple_choice',
        question: 'What is the capital of France?',
        options: ['London', 'Paris', 'Berlin', 'Madrid'],
        correctAnswer: 'Paris',
        explanation: 'Paris is the capital and largest city of France.',
        difficulty: 2
      },
      {
        id: 'custom_2',
        type: 'fill_blank',
        question: 'The sky is ___. (blue)',
        correctAnswer: 'blue',
        explanation: 'Use the adjective "blue" to describe the sky.',
        difficulty: 1
      }
    ]

    const newSession: ExerciseSession = {
      id: `custom_session_${Date.now()}`,
      userId: 'user_id',
      exercises: customExercises,
      answers: [],
      startTime: new Date(),
      currentIndex: 0,
      score: 0
    }

    setSession(newSession)
  }

  return (
    <button onClick={startCustomExercise}>
      开始自定义练习
    </button>
  )
}

/**
 * 示例3: 成就系统集成
 */
export function AchievementExample() {
  const [showAchievements, setShowAchievements] = useState(false)
  const [achievements, setAchievements] = useState<any[]>([])

  const checkAndShowAchievements = async (result: ExerciseResultType) => {
    if (result.achievements.length > 0) {
      setAchievements(result.achievements)
      setShowAchievements(true)
    }
  }

  return (
    <div>
      {showAchievements && (
        <AchievementCelebration
          achievements={achievements}
          onClose={() => setShowAchievements(false)}
        />
      )}
    </div>
  )
}

/**
 * 示例4: 进度追踪
 */
export function ProgressTrackingExample() {
  const [session, setSession] = useState<ExerciseSession | null>(null)

  const getProgress = () => {
    if (!session) return 0
    return ((session.currentIndex + 1) / session.exercises.length) * 100
  }

  const getAccuracy = () => {
    if (!session || session.answers.length === 0) return 0
    const correct = session.answers.filter(a => a.isCorrect).length
    return (correct / session.answers.length) * 100
  }

  return (
    <div>
      <div>进度: {getProgress().toFixed(0)}%</div>
      <div>正确率: {getAccuracy().toFixed(0)}%</div>
    </div>
  )
}

/**
 * 示例5: 与用户系统集成
 */
export function UserIntegrationExample() {
  // 假设你有一个用户上下文
  const userId = 'user_123'
  const userLevel: EnglishLevel = 'intermediate'

  const startPersonalizedExercise = async (type: ExerciseType) => {
    // 根据用户水平生成练习
    const exercises = await exerciseService.generateExercises(
      type,
      userLevel, // 使用用户的实际水平
      5
    )

    // 创建会话时使用真实用户ID
    const session: ExerciseSession = {
      id: `session_${Date.now()}`,
      userId: userId, // 真实用户ID
      exercises,
      answers: [],
      startTime: new Date(),
      currentIndex: 0,
      score: 0
    }

    return session
  }

  return null
}

/**
 * 示例6: 错误处理
 */
export function ErrorHandlingExample() {
  const [error, setError] = useState<string | null>(null)

  const handleStartExercise = async (type: ExerciseType) => {
    try {
      setError(null)
      const exercises = await exerciseService.generateExercises(type, 'intermediate', 5)
      // 继续处理...
    } catch (err) {
      console.error('生成练习失败:', err)
      setError('生成练习失败，请重试')
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-500/10 border-2 border-red-500 p-4 rounded-lg">
          <p className="text-red-500">{error}</p>
        </div>
      )}
    </div>
  )
}

/**
 * 示例7: 加载状态
 */
export function LoadingStateExample() {
  const [isLoading, setIsLoading] = useState(false)

  const handleStartExercise = async (type: ExerciseType) => {
    setIsLoading(true)
    try {
      const exercises = await exerciseService.generateExercises(type, 'intermediate', 5)
      // 继续处理...
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-star-400 border-t-transparent"></div>
          <p className="text-cosmos-300 mt-4">正在生成练习题...</p>
        </div>
      )}
    </div>
  )
}

/**
 * 使用提示:
 * 
 * 1. 基础集成:
 *    - 使用 ExerciseTypeSelector 让用户选择练习类型
 *    - 使用 ExerciseCard 展示练习题
 *    - 使用 ExerciseResult 展示结果
 * 
 * 2. 服务层:
 *    - exerciseService.generateExercises() 生成练习题
 *    - exerciseService.evaluateAnswer() 评估答案
 *    - exerciseService.submitSession() 提交会话
 * 
 * 3. 成就系统:
 *    - 检查 result.achievements 获取新成就
 *    - 使用 AchievementCelebration 展示成就
 * 
 * 4. 最佳实践:
 *    - 始终处理错误情况
 *    - 显示加载状态
 *    - 记录真实的答题时间
 *    - 使用真实的用户ID和水平
 */
