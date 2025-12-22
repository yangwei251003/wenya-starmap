'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ExerciseType, 
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
import { PageHeader } from '@/components/ui/PageHeader'
import { CompletionCelebration } from '@/components/ui/CompletionCelebration'

type ViewState = 'menu' | 'exercise' | 'result'

export default function QuizPage() {
  const router = useRouter()
  const [viewState, setViewState] = useState<ViewState>('menu')
  const [session, setSession] = useState<ExerciseSession | null>(null)
  const [result, setResult] = useState<ExerciseResultType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)

  // 开始练习
  const handleStartExercise = async (type: ExerciseType) => {
    setIsLoading(true)
    setStartTime(Date.now())
    try {
      const exercises = await exerciseService.generateExercises(
        type,
        'intermediate',
        5
      )

      const newSession: ExerciseSession = {
        id: `session_${Date.now()}`,
        userId: 'demo_user',
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
    const answerStartTime = Date.now()

    const evaluation = await exerciseService.evaluateAnswer(
      currentExercise,
      userAnswer
    )

    const timeSpent = (Date.now() - answerStartTime) / 1000

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
      setSession({
        ...session,
        currentIndex: session.currentIndex + 1
      })
    } else {
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

    const exerciseResult = await exerciseService.submitSession(completedSession)
    
    setResult(exerciseResult)
    setShowCelebration(true)

    if (exerciseResult.achievements.length > 0) {
      setTimeout(() => setShowAchievements(true), 2000)
    }
  }

  // 处理庆祝动画关闭
  const handleCelebrationClose = () => {
    setShowCelebration(false)
    setViewState('result')
  }

  // 继续学习
  const handleContinue = () => {
    setShowCelebration(false)
    setSession(null)
    setResult(null)
    setViewState('menu')
  }

  // 返回主页
  const handleGoHome = () => {
    router.push('/dashboard')
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

  // 计算用时
  const getTimeSpent = () => {
    if (!startTime) return 0
    return Math.floor((Date.now() - startTime) / 1000)
  }

  // 计算正确数
  const getCorrectCount = () => {
    if (!session) return 0
    return session.answers.filter(a => a.isCorrect).length
  }

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="互动练习" 
        subtitle="听说读写全方位练习"
        titleColor="star"
        backUrl="/dashboard"
      />

      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* 菜单视图 */}
        {viewState === 'menu' && (
          <div className="animate-fade-in-up">
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
          <div className="animate-fade-in-up">
            <ExerciseCard
              exercise={session.exercises[session.currentIndex]}
              onSubmit={handleSubmitAnswer}
              onNext={handleNext}
              currentIndex={session.currentIndex}
              totalExercises={session.exercises.length}
            />
          </div>
        )}

        {/* 结果视图 */}
        {viewState === 'result' && result && (
          <div className="animate-fade-in-up">
            <ExerciseResult
              result={result}
              onRestart={handleRestart}
              onBackToMenu={handleBackToMenu}
            />
          </div>
        )}

        {/* 完成庆祝动画 */}
        <CompletionCelebration
          isVisible={showCelebration}
          onClose={handleCelebrationClose}
          onContinue={handleContinue}
          onGoHome={handleGoHome}
          title="练习完成！"
          subtitle="你完成了本次练习"
          correctCount={getCorrectCount()}
          totalCount={session?.exercises.length || 0}
          timeSpent={getTimeSpent()}
          xpEarned={result?.score || 50}
        />

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
