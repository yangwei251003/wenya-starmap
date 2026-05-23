'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useStudyQueue, useSubmitReview } from '@/hooks/useStudyQueue'
import { Rating } from '@/utils/fsrs'
import {
  ArrowLeft,
  Award,
  Battery,
  ChevronRight,
  Eye,
  EyeOff,
  Flame,
  Keyboard,
  Target,
  Sparkles,
  Volume2,
  X,
  Zap,
  Brain,
  Check,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CompletionCelebration } from '@/components/ui/CompletionCelebration'
import { getWordById } from '@/lib/words-data'

interface StarSproutMemoryProps {
  userId: string
  onComplete: () => void
  onBack: () => void
}

type ReviewTone = 'reset' | 'challenge' | 'grow' | 'bloom'

const reviewMeta: Record<ReviewTone, { title: string; note: string; accent: string }> = {
  reset: {
    title: '重新发芽',
    note: '这张卡先记到复习队列里，后面再追回来。',
    accent: 'text-red-300',
  },
  challenge: {
    title: '需要陪跑',
    note: '理解还差一点点，先让它再亮一次。',
    accent: 'text-orange-300',
  },
  grow: {
    title: '继续生长',
    note: '已经有点熟了，接下来让它稳定扎根。',
    accent: 'text-[#00F5A0]',
  },
  bloom: {
    title: '完全点亮',
    note: '这颗词芽已经长稳了，可以放心前进。',
    accent: 'text-sky-300',
  },
}

function ratingToTone(rating: Rating): ReviewTone {
  if (rating === Rating.Again) return 'reset'
  if (rating === Rating.Hard) return 'challenge'
  if (rating === Rating.Good) return 'grow'
  return 'bloom'
}

function getLevelLabel(type: string | undefined) {
  switch (type) {
    case 'new':
      return '新词'
    case 'review':
      return '复习'
    default:
      return '词芽'
  }
}

export default function StarSproutMemory({ userId, onComplete, onBack }: StarSproutMemoryProps) {
  const reducedMotion = useReducedMotion()
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [isShaking, setIsShaking] = useState(false)
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, total: 0 })
  const [showCelebration, setShowCelebration] = useState(false)

  const { data: queueData, isLoading, error } = useStudyQueue(userId)
  const submitReviewMutation = useSubmitReview()

  const currentCard = queueData?.queue[currentCardIndex]
  const currentWord = currentCard ? getWordById(currentCard.word_id) : null

  const totalCount = queueData?.queue.length ?? 0
  const progress = useMemo(() => {
    if (!totalCount) return 0
    return (currentCardIndex / totalCount) * 100
  }, [currentCardIndex, totalCount])

  const memoryStrength = currentCard ? Math.round((currentCard.stability / 10) * 100) : 0
  const queueTone = currentCard?.type === 'new' ? 'new' : 'review'

  const resetView = () => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setShowHint(true)
    setIsShaking(false)
    setSessionStats({ correct: 0, wrong: 0, total: 0 })
    setShowCelebration(false)
  }

  const speakWord = () => {
    if (!currentWord || typeof window === 'undefined') return
    const utterance = new SpeechSynthesisUtterance(currentWord.word)
    utterance.lang = 'en-US'
    utterance.rate = 0.82
    speechSynthesis.speak(utterance)
  }

  const advanceCard = () => {
    if (currentCardIndex >= totalCount - 1) {
      setShowCelebration(true)
      setTimeout(() => onComplete(), 900)
      return
    }

    setCurrentCardIndex((prev) => prev + 1)
    setIsFlipped(false)
    setShowHint(true)
  }

  const submitReview = async (rating: Rating) => {
    if (!currentCard || !currentWord) return

    try {
      await submitReviewMutation.mutateAsync({
        userId,
        wordId: currentCard.word_id,
        rating,
        reviewTime: new Date().toISOString(),
      })

      setSessionStats((prev) => ({
        total: prev.total + 1,
        correct: rating >= Rating.Good ? prev.correct + 1 : prev.correct,
        wrong: rating < Rating.Good ? prev.wrong + 1 : prev.wrong,
      }))

      if (rating < Rating.Good) {
        setIsShaking(true)
        window.setTimeout(() => setIsShaking(false), 420)
      }

      window.setTimeout(() => advanceCard(), 220)
    } catch (submitError) {
      console.error('Failed to submit review:', submitError)
    }
  }

  const flipCard = () => {
    if (!isFlipped) {
      setIsFlipped(true)
      setShowHint(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'Space':
          event.preventDefault()
          flipCard()
          break
        case 'Enter':
          event.preventDefault()
          if (isFlipped) submitReview(Rating.Good)
          break
        case 'Digit1':
        case 'Numpad1':
          event.preventDefault()
          if (isFlipped) submitReview(Rating.Again)
          break
        case 'Digit2':
        case 'Numpad2':
          event.preventDefault()
          if (isFlipped) submitReview(Rating.Hard)
          break
        case 'Digit3':
        case 'Numpad3':
          event.preventDefault()
          if (isFlipped) submitReview(Rating.Good)
          break
        case 'Digit4':
        case 'Numpad4':
          event.preventDefault()
          if (isFlipped) submitReview(Rating.Easy)
          break
        case 'Escape':
          onBack()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFlipped, currentCardIndex, currentWord])

  useEffect(() => {
    if (!currentWord || !isFlipped) return
    if (!showHint) return
  }, [currentWord, isFlipped, showHint])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full border border-[#00F5A0]/35 border-t-transparent animate-spin" />
          <p className="text-cosmos-300">正在连接词芽队列...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-300">
            <X className="h-8 w-8" />
          </div>
          <p className="mb-4 text-red-300">加载失败</p>
          <Button onClick={() => window.location.reload()}>重新发芽</Button>
        </Card>
      </div>
    )
  }

  if (!queueData?.queue.length || currentCardIndex >= queueData.queue.length || !currentWord) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#00F5A0]/10 text-[#00F5A0]">
            <Award className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-semibold text-white">本轮萌芽完成</h1>
          <p className="mt-3 text-cosmos-300">今天已经把一批词芽送进星图，继续保持这个节奏。</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="text-xl font-semibold text-[#00F5A0]">{sessionStats.correct}</div>
              <div className="mt-1 text-xs text-cosmos-400">点亮</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="text-xl font-semibold text-orange-300">{sessionStats.wrong}</div>
              <div className="mt-1 text-xs text-cosmos-400">待返工</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="text-xl font-semibold text-sky-300">{sessionStats.total}</div>
              <div className="mt-1 text-xs text-cosmos-400">总复习</div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="cosmos" onClick={onBack} className="flex-1">
              返回
            </Button>
            <Button variant="star" onClick={() => {
              resetView()
              onComplete()
            }} className="flex-1 gap-2">
              <Sparkles className="h-4 w-4" />
              查看结果
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const currentTone = reviewMeta[queueTone === 'new' ? 'grow' : 'challenge']

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <div className="sticky top-0 z-50 h-1 bg-white/6">
        <motion.div
          className="h-full bg-gradient-to-r from-[#00F5A0] via-[#FDE68A] to-[#60A5FA]"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-5 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2 text-sm text-cosmos-200 transition-all hover:border-[#00F5A0]/25 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            返回星图
          </button>

          <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-xs text-cosmos-300">
            <span className="inline-flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-[#00F5A0]" />
              {currentCardIndex + 1}/{totalCount}
            </span>
            <span className="text-white/20">•</span>
            <span className="inline-flex items-center gap-1">
              <Battery className="h-3.5 w-3.5 text-star-300" />
              {memoryStrength}%
            </span>
            <span className="text-white/20">•</span>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-sky-300" />
              {currentCard?.type === 'new' ? '新词采集' : '回声复习'}
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cosmos-400">萌芽采集器</p>
                <h1 className="mt-2 text-2xl font-semibold text-white">让词汇像种子一样，翻面、发光、长稳</h1>
                <p className="mt-2 text-sm leading-6 text-cosmos-300">
                  空格翻面，记住后给它一个更合适的成长等级。每一次判断，都会把这颗词芽推向下一段星图。
                </p>
              </div>

              <div className={`rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-right ${currentTone.accent}`}>
                <div className="text-sm font-medium">{currentTone.title}</div>
                <div className="mt-1 max-w-[180px] text-xs leading-5 text-cosmos-400">{currentTone.note}</div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: '点亮', value: sessionStats.correct, tone: 'text-[#00F5A0]' },
                { label: '待返工', value: sessionStats.wrong, tone: 'text-orange-300' },
                { label: '总复习', value: sessionStats.total, tone: 'text-sky-300' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                  <div className="text-xs text-cosmos-400">{item.label}</div>
                  <div className={`mt-1 text-xl font-semibold ${item.tone}`}>{item.value}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cosmos-400">队列状态</p>
                <h2 className="mt-2 text-lg font-semibold text-white">当前词芽的生长信息</h2>
              </div>
              <button
                onClick={() => setShowHint((prev) => !prev)}
                className="rounded-full border border-white/8 bg-white/5 p-2 text-cosmos-300 transition-colors hover:text-white"
                title={showHint ? '收起提示' : '展开提示'}
              >
                {showHint ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-sm text-cosmos-300">
                  <Target className="h-4 w-4 text-[#00F5A0]" />
                  当前类型：{getLevelLabel(currentCard?.type)}
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#00F5A0] to-star-300" style={{ width: `${memoryStrength}%` }} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-cosmos-400">快捷键</div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-cosmos-300">
                  {['Space 翻面', 'Enter 良好', '1 忘记', '2 困难', '3 良好', '4 简单'].map((item) => (
                    <span key={item} className="rounded-full border border-white/8 bg-black/20 px-3 py-1">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className={`mx-auto w-full max-w-4xl ${isShaking ? 'animate-shake' : ''}`}>
          <div className="relative" onClick={flipCard}>
            <div
              className={`preserve-3d relative min-h-[440px] w-full cursor-pointer transition-transform duration-500 ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                className="absolute inset-0 backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
                initial={false}
                animate={reducedMotion ? undefined : { y: [0, -2, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Card className="relative h-full overflow-hidden border-white/8 bg-white/5 p-8">
                  <div className="absolute right-4 top-4 flex items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs ${currentCard?.type === 'new' ? 'border-[#00F5A0]/25 bg-[#00F5A0]/10 text-[#B9FFE4]' : 'border-star-300/20 bg-star-300/10 text-star-200'}`}>
                      {getLevelLabel(currentCard?.type)}
                    </span>
                      <span className="rounded-full border border-white/8 bg-black/20 px-3 py-1 text-xs text-cosmos-300">
                      {(currentWord?.tags?.length ?? 0) > 0 ? `${currentWord?.tags?.length ?? 0} 个标签` : '无标签'}
                      </span>
                  </div>

                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#00F5A0]/20 bg-[#00F5A0]/10 text-[#00F5A0] shadow-[0_0_28px_rgba(0,245,160,0.14)]">
                      <Sparkles className="h-9 w-9" />
                    </div>

                    <h2 className="text-5xl font-semibold tracking-tight text-white md:text-7xl">{currentWord?.word}</h2>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-cosmos-300">
                      <span className="text-lg">{currentWord?.phonetic || '暂无音标'}</span>
                      <button
                        onClick={(event) => {
                          event.stopPropagation()
                          speakWord()
                        }}
                        className="rounded-full border border-white/8 bg-white/5 p-2 text-cosmos-200 transition-colors hover:text-white"
                        title="朗读单词"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-sm text-cosmos-400">
                      <Keyboard className="h-4 w-4" />
                      {showHint ? '按空格翻面，或者直接点击词芽继续。' : '已收起提示，继续让它长出来。'}
                    </div>
                  </div>
                </Card>
              </motion.div>

              <div
                className="absolute inset-0 backface-hidden rotate-y-180"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <Card className="relative h-full border-white/8 bg-[#0F1624]/90 p-8">
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-cosmos-400">词芽解析</p>
                        <h3 className="mt-2 text-3xl font-semibold text-white">{currentWord?.word}</h3>
                        <p className="mt-2 text-cosmos-300">{currentWord?.phonetic || '暂无音标'}</p>
                      </div>
                      <button
                        onClick={(event) => {
                          event.stopPropagation()
                          speakWord()
                        }}
                        className="rounded-full border border-white/8 bg-white/5 p-2 text-cosmos-200 transition-colors hover:text-white"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/8 bg-white/5 p-5">
                      <p className="text-2xl font-medium text-[#00F5A0]">{currentWord?.meaning}</p>
                      {(currentWord?.tags?.length ?? 0) > 0 && (
                        <p className="mt-2 text-sm text-cosmos-400">标签：{currentWord?.tags.slice(0, 3).join(' · ')}</p>
                      )}
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-5">
                      <p className="text-sm leading-7 text-cosmos-200 italic">"{currentWord?.example}"</p>
                      {currentWord?.exampleCn && (
                        <p className="mt-2 text-sm leading-6 text-cosmos-400">{currentWord.exampleCn}</p>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {(currentWord?.tags ?? []).map((tag) => (
                        <span key={tag} className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-cosmos-300">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-6">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Button
                          variant="cosmos"
                          onClick={(event) => {
                            event.stopPropagation()
                            submitReview(Rating.Again)
                          }}
                          disabled={submitReviewMutation.isPending}
                          className="gap-2"
                        >
                          <X className="h-4 w-4 text-red-300" />
                          忘记了
                        </Button>
                        <Button
                          variant="cosmos"
                          onClick={(event) => {
                            event.stopPropagation()
                            submitReview(Rating.Hard)
                          }}
                          disabled={submitReviewMutation.isPending}
                          className="gap-2"
                        >
                          <Brain className="h-4 w-4 text-orange-300" />
                          有点难
                        </Button>
                        <Button
                          variant="sprout"
                          onClick={(event) => {
                            event.stopPropagation()
                            submitReview(Rating.Good)
                          }}
                          disabled={submitReviewMutation.isPending}
                          className="gap-2"
                        >
                          <ChevronRight className="h-4 w-4" />
                          记住了
                        </Button>
                        <Button
                          variant="star"
                          onClick={(event) => {
                            event.stopPropagation()
                            submitReview(Rating.Easy)
                          }}
                          disabled={submitReviewMutation.isPending}
                          className="gap-2"
                        >
                          <Check className="h-4 w-4" />
                          很稳
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-cosmos-400">
            <Sparkles className="h-4 w-4 text-[#00F5A0]" />
            <span>空格翻面，判断后词芽会继续向星图生长。</span>
          </div>

          <div className="flex gap-3">
            <Button variant="cosmos" onClick={resetView} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              重置队列
            </Button>
            <Button variant="star" onClick={() => setIsFlipped((prev) => !prev)} className="gap-2">
              <Sparkles className="h-4 w-4" />
              {isFlipped ? '收起答案' : '翻开词芽'}
            </Button>
          </div>
        </div>
      </div>

      <CompletionCelebration
        isVisible={showCelebration}
        onClose={() => setShowCelebration(false)}
        onContinue={() => {
          setShowCelebration(false)
          onComplete()
        }}
        onGoHome={onBack}
        title="词芽已经长稳了"
        subtitle="这一轮萌芽采集完成，星图又多了一片可用的光"
        correctCount={sessionStats.correct}
        totalCount={totalCount}
        timeSpent={0}
        xpEarned={sessionStats.correct * 10}
      />

      <style jsx>{`
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.45s ease-in-out;
        }
      `}</style>
    </div>
  )
}
