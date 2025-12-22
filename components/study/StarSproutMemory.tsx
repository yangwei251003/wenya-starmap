'use client'

import { useState, useEffect } from 'react'
import { useStudyQueue, useSubmitReview } from '@/hooks/useStudyQueue'
import { Rating } from '@/utils/fsrs'
import { 
  X, Volume2, ChevronRight, Sparkles, 
  Brain, Target, Flame, Award, ArrowLeft,
  Keyboard, Eye, EyeOff, Battery, Zap
} from 'lucide-react'
import { getWordById } from '@/lib/words-data'

interface StarSproutMemoryProps {
  userId: string
  onComplete: () => void
  onBack: () => void
}

export default function StarSproutMemory({ userId, onComplete, onBack }: StarSproutMemoryProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [isShaking, setIsShaking] = useState(false)
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, total: 0 })

  // 使用 React Query hooks
  const { data: queueData, isLoading, error } = useStudyQueue(userId)
  const submitReviewMutation = useSubmitReview()

  const currentCard = queueData?.queue[currentCardIndex]
  const currentWord = currentCard ? getWordById(currentCard.word_id) : null
  const progress = queueData ? ((currentCardIndex / queueData.queue.length) * 100) : 0

  // 翻转卡片
  const flipCard = () => {
    if (!isFlipped) {
      setIsFlipped(true)
      setShowHint(false)
    }
  }

  // 提交复习结果
  const submitReview = async (rating: Rating) => {
    if (!currentCard || !currentWord) return

    try {
      // 使用乐观更新的 mutation
      await submitReviewMutation.mutateAsync({
        userId,
        wordId: currentCard.word_id,
        rating,
        reviewTime: new Date().toISOString()
      })

      // 更新会话统计
      setSessionStats(prev => ({
        ...prev,
        total: prev.total + 1,
        correct: rating >= Rating.Good ? prev.correct + 1 : prev.correct,
        wrong: rating < Rating.Good ? prev.wrong + 1 : prev.wrong
      }))

      // 视觉反馈
      if (rating < Rating.Good) {
        setIsShaking(true)
        setTimeout(() => setIsShaking(false), 500)
      }

      // 移动到下一张卡片或完成学习
      if (currentCardIndex >= (queueData?.queue.length || 0) - 1) {
        // 学习完成
        setTimeout(() => {
          onComplete()
        }, 1000)
      } else {
        // 下一张卡片
        setTimeout(() => {
          setCurrentCardIndex(prev => prev + 1)
          setIsFlipped(false)
          setShowHint(true)
        }, 300)
      }

    } catch (error) {
      console.error('Failed to submit review:', error)
      // 错误处理 - React Query 会自动回滚乐观更新
    }
  }

  // 朗读单词
  const speakWord = () => {
    if (!currentWord || typeof window === 'undefined') return
    const utterance = new SpeechSynthesisUtterance(currentWord.word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  // 键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          flipCard()
          break
        case 'Enter':
          e.preventDefault()
          if (isFlipped) {
            submitReview(Rating.Good)
          }
          break
        case 'Digit1':
        case 'Numpad1':
          e.preventDefault()
          if (isFlipped) {
            submitReview(Rating.Again)
          }
          break
        case 'Digit2':
        case 'Numpad2':
          e.preventDefault()
          if (isFlipped) {
            submitReview(Rating.Hard)
          }
          break
        case 'Digit3':
        case 'Numpad3':
          e.preventDefault()
          if (isFlipped) {
            submitReview(Rating.Good)
          }
          break
        case 'Digit4':
        case 'Numpad4':
          e.preventDefault()
          if (isFlipped) {
            submitReview(Rating.Easy)
          }
          break
        case 'Escape':
          onBack()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFlipped, currentCard])

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cosmos-300">正在加载学习队列...</p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400 mb-4">加载失败</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-sprout-500 hover:bg-sprout-600 text-white rounded-lg transition-all"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  // 没有卡片或学习完成
  if (!queueData?.queue.length || currentCardIndex >= queueData.queue.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-sprout-400 to-star-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Award className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">🎉 学习完成！</h1>
          <p className="text-cosmos-300 mb-8">
            今日学习目标已达成，继续保持！
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-cosmos-800/50 rounded-lg p-3">
              <div className="text-sprout-400 font-bold text-lg">{sessionStats.correct}</div>
              <div className="text-cosmos-400">正确</div>
            </div>
            <div className="bg-cosmos-800/50 rounded-lg p-3">
              <div className="text-orange-400 font-bold text-lg">{sessionStats.wrong}</div>
              <div className="text-cosmos-400">需复习</div>
            </div>
          </div>
          <button
            onClick={onComplete}
            className="w-full py-3 bg-gradient-to-r from-sprout-500 to-star-500 hover:from-sprout-400 hover:to-star-400 text-white rounded-xl font-bold transition-all"
          >
            查看学习报告
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900 flex flex-col">
      {/* 顶部进度条 */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-cosmos-800 z-50">
        <div 
          className="h-full bg-gradient-to-r from-sprout-400 to-star-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 顶部工具栏 */}
      <div className="fixed top-4 left-0 right-0 px-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 bg-cosmos-800/80 hover:bg-cosmos-700 rounded-lg text-cosmos-400 hover:text-white transition-all backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            {/* 进度统计 */}
            <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-cosmos-800/80 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-star-400" />
                <span className="text-white text-sm">
                  {currentCardIndex + 1}/{queueData?.queue.length}
                </span>
              </div>
              <div className="w-px h-4 bg-cosmos-600" />
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-sprout-400" />
                <span className="text-white text-sm">
                  {currentCard ? Math.round((currentCard.stability / 10) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* 队列统计 */}
            <div className="flex items-center gap-2 px-3 py-2 bg-cosmos-800/80 rounded-lg backdrop-blur-sm text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-400 rounded-full" />
                <span className="text-orange-400">{queueData?.stats.review}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                <span className="text-cyan-400">{queueData?.stats.new}</span>
              </div>
            </div>

            <button
              onClick={() => setShowHint(!showHint)}
              className="p-2 bg-cosmos-800/80 hover:bg-cosmos-700 rounded-lg text-cosmos-400 hover:text-white transition-all backdrop-blur-sm"
            >
              {showHint ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 主要内容区 - 单词卡片 */}
      <div className="flex-1 flex items-center justify-center p-4 pt-20">
        {currentWord && (
          <div 
            className={`w-full max-w-2xl perspective-1000 ${isShaking ? 'animate-shake' : ''}`}
            onClick={flipCard}
          >
            <div 
              className={`relative w-full min-h-[400px] transition-transform duration-500 transform-style-3d cursor-pointer ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* 卡片正面 */}
              <div 
                className="absolute inset-0 backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="h-full bg-cosmos-800/50 backdrop-blur-sm rounded-3xl border border-cosmos-700/50 p-8 flex flex-col items-center justify-center">
                  {/* 卡片类型标记 */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    {currentCard?.type === 'new' && (
                      <div className="px-3 py-1 bg-cyan-400/20 text-cyan-400 text-sm rounded-full flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        新词
                      </div>
                    )}
                    {currentCard?.type === 'review' && (
                      <div className="px-3 py-1 bg-orange-400/20 text-orange-400 text-sm rounded-full flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        复习
                      </div>
                    )}
                  </div>

                  {/* 单词 */}
                  <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 text-center">
                    {currentWord.word}
                  </h1>

                  {/* 音标和发音 */}
                  <div className="flex items-center gap-3 mb-8">
                    <span className="text-cosmos-400 text-xl">{currentWord.phonetic}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        speakWord()
                      }}
                      className="p-2 bg-cosmos-700 hover:bg-cosmos-600 rounded-full text-cosmos-300 hover:text-white transition-all"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 记忆强度指示器 */}
                  {currentCard && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Battery className="w-4 h-4 text-sprout-400" />
                        <span className="text-cosmos-400 text-sm">记忆强度</span>
                      </div>
                      <div className="w-32 h-2 bg-cosmos-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-sprout-500 transition-all"
                          style={{ width: `${Math.round((currentCard.stability / 10) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 提示 */}
                  {showHint && (
                    <p className="text-cosmos-500 text-sm flex items-center gap-2 animate-pulse">
                      <Keyboard className="w-4 h-4" />
                      按空格键翻转卡片
                    </p>
                  )}
                </div>
              </div>

              {/* 卡片背面 */}
              <div 
                className="absolute inset-0 backface-hidden rotate-y-180"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="h-full bg-cosmos-800/50 backdrop-blur-sm rounded-3xl border border-cosmos-700/50 p-8 flex flex-col">
                  {/* 单词和音标 */}
                  <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold text-white mb-2">{currentWord.word}</h2>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-cosmos-400">{currentWord.phonetic}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          speakWord()
                        }}
                        className="p-1.5 bg-cosmos-700 hover:bg-cosmos-600 rounded-full text-cosmos-300 hover:text-white transition-all"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 释义 */}
                  <div className="text-center mb-6">
                    <p className="text-2xl text-sprout-400 font-medium">{currentWord.meaning}</p>
                  </div>

                  {/* 例句 */}
                  <div className="mb-4 p-4 bg-cosmos-700/30 rounded-xl">
                    <p className="text-white mb-2 italic">"{currentWord.example}"</p>
                    <p className="text-cosmos-400 text-sm">{currentWord.exampleCn}</p>
                  </div>

                  {/* 标签 */}
                  <div className="flex flex-wrap gap-2 justify-center mt-auto">
                    {currentWord.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-cosmos-700 text-cosmos-300 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部操作区 */}
      {isFlipped && (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-cosmos-900 via-cosmos-900/95 to-transparent">
          <div className="max-w-2xl mx-auto">
            {/* 键盘提示 */}
            <div className="text-center mb-3">
              <p className="text-cosmos-500 text-xs flex items-center justify-center gap-2 flex-wrap">
                <span className="inline-flex items-center">
                  <kbd className="px-2 py-0.5 bg-cosmos-700 rounded text-cosmos-300 text-xs mr-1">1</kbd>
                  忘记了
                </span>
                <span className="text-cosmos-600 mx-1">|</span>
                <span className="inline-flex items-center">
                  <kbd className="px-2 py-0.5 bg-cosmos-700 rounded text-cosmos-300 text-xs mr-1">2</kbd>
                  困难
                </span>
                <span className="text-cosmos-600 mx-1">|</span>
                <span className="inline-flex items-center">
                  <kbd className="px-2 py-0.5 bg-cosmos-700 rounded text-cosmos-300 text-xs mr-1">3</kbd>
                  良好
                </span>
                <span className="text-cosmos-600 mx-1">|</span>
                <span className="inline-flex items-center">
                  <kbd className="px-2 py-0.5 bg-cosmos-700 rounded text-cosmos-300 text-xs mr-1">4</kbd>
                  简单
                </span>
              </p>
            </div>

            {/* 操作按钮 - FSRS 4个评级 */}
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => submitReview(Rating.Again)}
                disabled={submitReviewMutation.isPending}
                className="py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-400 rounded-xl transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
              >
                <X className="w-6 h-6" />
                <span className="text-sm font-medium">忘记了</span>
              </button>
              <button
                onClick={() => submitReview(Rating.Hard)}
                disabled={submitReviewMutation.isPending}
                className="py-4 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/30 text-orange-400 rounded-xl transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
              >
                <Brain className="w-6 h-6" />
                <span className="text-sm font-medium">困难</span>
              </button>
              <button
                onClick={() => submitReview(Rating.Good)}
                disabled={submitReviewMutation.isPending}
                className="py-4 bg-sprout-500/20 hover:bg-sprout-500/30 border border-sprout-400/30 text-sprout-400 rounded-xl transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
              >
                <ChevronRight className="w-6 h-6" />
                <span className="text-sm font-medium">良好</span>
              </button>
              <button
                onClick={() => submitReview(Rating.Easy)}
                disabled={submitReviewMutation.isPending}
                className="py-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-400 rounded-xl transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
              >
                <Sparkles className="w-6 h-6" />
                <span className="text-sm font-medium">简单</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 自定义样式 */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}