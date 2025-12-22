'use client'

import { useState, useEffect } from 'react'
import { Exercise, Evaluation } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Volume2, VolumeX, RefreshCw } from 'lucide-react'
import { speechService } from '@/lib/speech-service'

interface ExerciseCardProps {
  exercise: Exercise
  onSubmit: (answer: string) => Promise<Evaluation>
  onNext: () => void
  currentIndex: number
  totalExercises: number
}

export function ExerciseCard({
  exercise,
  onSubmit,
  onNext,
  currentIndex,
  totalExercises
}: ExerciseCardProps) {
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  // 听力题自动播放
  useEffect(() => {
    if (exercise.type === 'listening' && exercise.audioText) {
      playAudio()
    }
  }, [exercise.id])

  const playAudio = async () => {
    if (isPlayingAudio) {
      speechService.stop()
      setIsPlayingAudio(false)
      return
    }

    setIsPlayingAudio(true)
    try {
      const text = exercise.audioText || exercise.question.replace(/🔊.*?:/g, '').trim()
      await speechService.speak(text, { rate: 0.8, pitch: 1 })
    } catch (error) {
      console.error('音频播放失败:', error)
    } finally {
      setIsPlayingAudio(false)
    }
  }

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return

    setIsSubmitting(true)
    try {
      const result = await onSubmit(userAnswer)
      setEvaluation(result)
      setShowFeedback(true)
    } catch (error) {
      console.error('提交答案失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    setUserAnswer('')
    setEvaluation(null)
    setShowFeedback(false)
    onNext()
  }

  const renderExerciseInput = () => {
    switch (exercise.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {exercise.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => setUserAnswer(option)}
                disabled={showFeedback}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  userAnswer === option
                    ? 'border-star-400 bg-star-400/10'
                    : 'border-cosmos-700 hover:border-star-400/50'
                } ${showFeedback ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <span className="text-cosmos-100">{option}</span>
              </button>
            ))}
          </div>
        )

      case 'listening':
      case 'reading_comprehension':
        return (
          <div className="space-y-4">
            {/* 听力题播放按钮 */}
            {exercise.type === 'listening' && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={playAudio}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                    isPlayingAudio
                      ? 'bg-red-400/20 hover:bg-red-400/30 border-2 border-red-400'
                      : 'bg-purple-400/20 hover:bg-purple-400/30 border-2 border-purple-400'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-6 h-6 text-red-400 animate-pulse" />
                      <span className="text-red-400 font-medium">停止播放</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-6 h-6 text-purple-400" />
                      <span className="text-purple-400 font-medium">播放音频</span>
                    </>
                  )}
                </button>
                <button
                  onClick={playAudio}
                  className="ml-2 p-3 rounded-lg bg-cosmos-700 hover:bg-cosmos-600 transition-all"
                  title="重新播放"
                >
                  <RefreshCw className="w-5 h-5 text-cosmos-300" />
                </button>
              </div>
            )}
            
            {/* 选项 */}
            {exercise.options && (
              <div className="space-y-2">
                {exercise.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setUserAnswer(option)}
                    disabled={showFeedback}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      userAnswer === option
                        ? 'border-star-400 bg-star-400/10'
                        : 'border-cosmos-700 hover:border-star-400/50'
                    } ${showFeedback ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                  >
                    <span className="text-cosmos-100">{option}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )

      case 'fill_blank':
      case 'writing':
        return (
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={showFeedback}
            placeholder="请输入你的答案..."
            className="w-full p-4 rounded-lg bg-cosmos-800 border-2 border-cosmos-700 
                     text-cosmos-100 placeholder-cosmos-500 focus:border-star-400 
                     focus:outline-none resize-none min-h-[120px]"
          />
        )

      case 'speaking':
        return (
          <div className="space-y-4">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={showFeedback}
              placeholder="请输入你的口语回答..."
              className="w-full p-4 rounded-lg bg-cosmos-800 border-2 border-cosmos-700 
                       text-cosmos-100 placeholder-cosmos-500 focus:border-star-400 
                       focus:outline-none resize-none min-h-[120px]"
            />
            <p className="text-sm text-cosmos-400">
              💡 提示：大声朗读你的答案，然后写下来
            </p>
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={showFeedback}
            placeholder="请输入你的答案..."
            className="w-full p-4 rounded-lg bg-cosmos-800 border-2 border-cosmos-700 
                     text-cosmos-100 placeholder-cosmos-500 focus:border-star-400 
                     focus:outline-none"
          />
        )
    }
  }

  return (
    <Card className="p-6">
      {/* 进度指示器 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-cosmos-400">
            题目 {currentIndex + 1} / {totalExercises}
          </span>
          <span className="text-sm text-star-400">
            难度: {'⭐'.repeat(exercise.difficulty)}
          </span>
        </div>
        <div className="w-full h-2 bg-cosmos-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sprout-400 to-star-400 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalExercises) * 100}%` }}
          />
        </div>
      </div>

      {/* 问题 */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-cosmos-100 mb-4">
          {exercise.question}
        </h3>
      </div>

      {/* 答题区域 */}
      <div className="mb-6">
        {renderExerciseInput()}
      </div>

      {/* 反馈区域 */}
      {showFeedback && evaluation && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            evaluation.isCorrect
              ? 'bg-green-500/10 border-2 border-green-500/30'
              : 'bg-red-500/10 border-2 border-red-500/30'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">
              {evaluation.isCorrect ? '✅' : '❌'}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-cosmos-100 mb-2">
                {evaluation.isCorrect ? '回答正确！' : '继续加油！'}
              </p>
              <p className="text-cosmos-200 mb-2">{evaluation.feedback}</p>
              {!evaluation.isCorrect && (
                <p className="text-sm text-cosmos-300">
                  正确答案：{exercise.correctAnswer}
                </p>
              )}
              {exercise.explanation && (
                <p className="text-sm text-cosmos-400 mt-2">
                  💡 {exercise.explanation}
                </p>
              )}
              {evaluation.suggestions && evaluation.suggestions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold text-cosmos-200 mb-1">
                    改进建议：
                  </p>
                  <ul className="text-sm text-cosmos-300 space-y-1">
                    {evaluation.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        {!showFeedback ? (
          <Button
            onClick={handleSubmit}
            disabled={!userAnswer.trim() || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? '评估中...' : '提交答案'}
          </Button>
        ) : (
          <Button onClick={handleNext} className="flex-1">
            {currentIndex < totalExercises - 1 ? '下一题' : '完成练习'}
          </Button>
        )}
      </div>
    </Card>
  )
}
