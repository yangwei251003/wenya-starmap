'use client'

import { useState, useEffect } from 'react'
import { 
  Exercise, 
  ExerciseType, 
  EnglishLevel, 
  Evaluation,
  Answer 
} from '@/types'
import { 
  ExerciseCard, 
  ExerciseTypeSelector, 
  ExerciseResult,
  AchievementCelebration 
} from '@/components/exercise'
import { exerciseService, ExerciseSession, ExerciseResult as ExerciseResultType } from '@/lib/exercise-service'
import { Button } from '@/components/ui/Button'

type ViewState = 'menu' | 'exercise' | 'result'

export default function QuizPage() {
  const [viewState, setViewState] = useState<ViewState>('menu')
  const [session, setSession] = useState<ExerciseSession | null>(null)
  const [result, setResult] = useState<ExerciseResultType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)

  // 开始练习
  const handleStartExercise = async (type: ExerciseType) => {
    setIsLoading(true)
    try {
      // 生成练习题
      const exercises = await exerciseService.generateExercises(
        type,
        'intermediate', // 默认中级，实际应从用户数据获取
        5
      )

      // 创建练习会话
      const newSession: ExerciseSession = {
        id: `session_${Date.now()}`,
        userId: 'demo_user', // 实际应从认证系统获取
        exercises,
        answers: [],
        startTime: new Date(),
        currentIndex: 0,
        score: 0
      }

      setSession(newSession)
      setViewState('exercise')
    } catch (error) {
      console.error('开始练习失败:', error)
      alert('开始练习失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 提交答案
  const handleSubmitAnswer = async (userAnswer: string): Promise<Evaluation> => {
    if (!session) {
      return {
        isCorrect: false,
        score: 0,
        feedback: '会话不存在'
      }
    }

    const currentExercise = session.exercises[session.currentIndex]
    const startTime = Date.now()

    // 评估答案
    const evaluation = await exerciseService.evaluateAnswer(
      currentExercise,
      userAnswer
    )

    const timeSpent = (Date.now() - startTime) / 1000

    // 记录答案
    const answer: Answer = {
      exerciseId: currentExercise.id,
      userAnswer,
      isCorrect: evaluation.isCorrect,
      timeSpent
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
      // 继续下一题
      setSession({
        ...session,
        currentIndex: session.currentIndex + 1
      })
    } else {
      // 完成练习
      await handleCompleteExercise()
    }
  }

  // 完成练习
  const handleCompleteExercise = async () => {
    if (!session) return

    const completedSession: ExerciseSession = {
      ...session,
      endTime: new Date()
    }

    // 提交会话并获取结果
    const exerciseResult = await exerciseService.submitSession(completedSession)
    
    setResult(exerciseResult)
    setViewState('result')

    // 如果有新成就，显示庆祝动画
    if (exerciseResult.achievements.length > 0) {
      setShowAchievements(true)
    }
  }

  // 重新开始
  const handleRestart = () => {
    setSession(null)
    setResult(null)
    setViewState('menu')
  }

  // 返回菜单
  const handleBackToMenu = () => {
    setSession(null)
    setResult(null)
    setViewState('menu')
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-star-400 mb-2">互动练习</h1>
          <p className="text-cosmos-300">听说读写全方位练习</p>
        </div>

        {/* 菜单视图 */}
        {viewState === 'menu' && (
          <div>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-star-400 border-t-transparent"></div>
                <p className="text-cosmos-300 mt-4">正在生成练习题...</p>
              </div>
            ) : (
              <ExerciseTypeSelector onSelect={handleStartExercise} />
            )}
          </div>
        )}

        {/* 练习视图 */}
        {viewState === 'exercise' && session && (
          <ExerciseCard
            exercise={session.exercises[session.currentIndex]}
            onSubmit={handleSubmitAnswer}
            onNext={handleNext}
            currentIndex={session.currentIndex}
            totalExercises={session.exercises.length}
          />
        )}

        {/* 结果视图 */}
        {viewState === 'result' && result && (
          <ExerciseResult
            result={result}
            onRestart={handleRestart}
            onBackToMenu={handleBackToMenu}
          />
        )}

        {/* 成就庆祝 */}
        {showAchievements && result && (
          <AchievementCelebration
            achievements={result.achievements}
            onClose={() => setShowAchievements(false)}
          />
        )}
      </div>
    </div>
  )
}