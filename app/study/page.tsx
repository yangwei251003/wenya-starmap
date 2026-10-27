'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  X, Volume2, ChevronRight, Sparkles, 
  Brain, Target, Flame, Award, ArrowLeft,
  Keyboard, Eye, EyeOff, RefreshCw, BookOpen, LogIn
} from 'lucide-react'
import { srsService } from '@/lib/srs-service'
import { smartLearningService } from '@/lib/smart-learning-service'
import { Word, ReviewQuality, WordProgress } from '@/types'

export default function StudyPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState('')
  const [currentWord, setCurrentWord] = useState<Word | null>(null)
  const [isPreparing, setIsPreparing] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [progress, setProgress] = useState<WordProgress | null>(null)
  const [isShaking, setIsShaking] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, newWords: 0, reviewWords: 0 })
  const [startTime] = useState(Date.now())
  const [studyPlan, setStudyPlan] = useState({ newWords: 10, reviewWords: 20 })
  const [wordsStudied, setWordsStudied] = useState(0)
  
  // 使用 ref 来追踪已学习单词数，避免闭包问题
  const wordsStudiedRef = useRef(0)
  const targetWordsRef = useRef(30)

  // 计算目标单词数
  const targetWords = studyPlan.newWords + studyPlan.reviewWords
  
  // 同步 ref
  useEffect(() => {
    wordsStudiedRef.current = wordsStudied
  }, [wordsStudied])
  
  useEffect(() => {
    targetWordsRef.current = targetWords
  }, [targetWords])

  // 加载下一个单词 - 不依赖 wordsStudied，使用 ref
  const loadNextWord = useCallback((uid: string, currentCount?: number) => {
    setIsPreparing(true)
    const studied = currentCount ?? wordsStudiedRef.current
    const target = targetWordsRef.current
    
    // 检查是否已完成目标
    if (studied >= target) {
      setIsComplete(true)
      setIsPreparing(false)
      return
    }

    const next = srsService.getNextWord(uid)
    if (next) {
      setCurrentWord(next.word)
      setIsNew(next.isNew)
      setIsFlipped(false)
    } else {
      // 没有更多单词了
      setIsComplete(true)
    }
    setProgress(srsService.getProgress(uid))
    setIsPreparing(false)
  }, [])

  // 翻转卡片
  const flipCard = useCallback(() => {
    if (!isFlipped) {
      setIsFlipped(true)
      setShowHint(false)
    }
  }, [isFlipped])

  // 提交复习结果
  const submitReview = useCallback((quality: ReviewQuality) => {
    if (!currentWord || !userId) return

    const reviewStartTime = Date.now()
    srsService.submitReview(userId, currentWord.id, quality)
    
    // 记录学习活动到智能学习系统
    const duration = Math.floor((Date.now() - reviewStartTime) / 1000)
    smartLearningService.recordLearningActivity(userId, {
      type: 'word',
      id: currentWord.id,
      duration: duration || 5, // 至少5秒
      success: quality === 2
    })

    // 更新已学习单词数 - 使用 ref 获取最新值
    const newWordsStudied = wordsStudiedRef.current + 1
    wordsStudiedRef.current = newWordsStudied
    setWordsStudied(newWordsStudied)
    
    if (quality === 2) {
      srsService.playSound('correct')
      setSessionStats(prev => ({ 
        ...prev, 
        correct: prev.correct + 1,
        newWords: isNew ? prev.newWords + 1 : prev.newWords,
        reviewWords: !isNew ? prev.reviewWords + 1 : prev.reviewWords
      }))
    } else {
      srsService.playSound('wrong')
      setSessionStats(prev => ({ 
        ...prev, 
        wrong: prev.wrong + 1,
        newWords: isNew ? prev.newWords + 1 : prev.newWords,
        reviewWords: !isNew ? prev.reviewWords + 1 : prev.reviewWords
      }))
      // 震动动效
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    }

    // 检查是否完成目标
    const target = targetWordsRef.current
    if (newWordsStudied >= target) {
      console.log(`学习完成！已学习 ${newWordsStudied}/${target} 个单词，跳转到结算页面...`)
      setTimeout(() => {
        setIsComplete(true)
      }, 500)
    } else {
      // 加载下一个单词，传入当前计数
      setTimeout(() => {
        loadNextWord(userId, newWordsStudied)
      }, quality === 2 ? 300 : 600)
    }
  }, [currentWord, userId, isNew, loadNextWord])

  // 初始化
  useEffect(() => {
    setMounted(true)
    const user = localStorage.getItem('wenya_user')
    let userData = { id: 'guest', username: '访客' }

    if (user) {
      try {
        const parsed = JSON.parse(user)
        if (parsed?.id) userData = parsed
      } catch {
        localStorage.removeItem('wenya_user')
      }
    }

    setUserId(userData.id)
    setIsGuest(userData.id === 'guest')

    // 获取学习计划
    const savedPlan = localStorage.getItem(`wenya_study_plan_${userData.id}`)
    let planNewWords = 10
    let planReviewWords = 20

    if (savedPlan) {
      try {
        const plan = JSON.parse(savedPlan)
        planNewWords = plan.newWords || 10
        planReviewWords = plan.reviewWords || 20
      } catch {
        localStorage.removeItem(`wenya_study_plan_${userData.id}`)
      }
    }

    // 设置学习计划和目标
    setStudyPlan({
      newWords: planNewWords,
      reviewWords: planReviewWords
    })

    // 更新 ref
    targetWordsRef.current = planNewWords + planReviewWords

    // 加载第一个单词
    loadNextWord(userData.id, 0)
    setProgress(srsService.getProgress(userData.id))
  }, []) // 移除 loadNextWord 依赖，避免循环

  // 键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete) return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          flipCard()
          break
        case 'Enter':
          e.preventDefault()
          if (isFlipped) {
            submitReview(2) // 认识
          }
          break
        case 'Digit1':
        case 'Numpad1':
          e.preventDefault()
          if (isFlipped) {
            submitReview(0) // 不认识
          }
          break
        case 'Digit2':
        case 'Numpad2':
          e.preventDefault()
          if (isFlipped) {
            submitReview(1) // 模糊
          }
          break
        case 'Escape':
          router.push('/dashboard')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFlipped, isComplete, flipCard, submitReview, router])

  // 完成后跳转到结算页面
  useEffect(() => {
    if (isComplete && sessionStats.correct + sessionStats.wrong > 0) {
      const studyTime = Math.floor((Date.now() - startTime) / 1000)
      const streak = progress?.streak || 0
      
      const params = new URLSearchParams({
        correct: sessionStats.correct.toString(),
        wrong: sessionStats.wrong.toString(),
        new: sessionStats.newWords.toString(),
        review: sessionStats.reviewWords.toString(),
        time: studyTime.toString(),
        streak: streak.toString()
      })
      
      // 延迟跳转，让用户看到完成动画
      const timer = setTimeout(() => {
        router.push(`/study/summary?${params.toString()}`)
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [isComplete, sessionStats, startTime, progress, router])

  // 朗读单词
  const speakWord = () => {
    if (!currentWord || typeof window === 'undefined') return
    const utterance = new SpeechSynthesisUtterance(currentWord.word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  // 加载中状态
  if (!mounted) {
    return (
      <div className="min-h-screen bg-cosmos-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isPreparing && !currentWord && !isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900 flex items-center justify-center p-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <div className="w-14 h-14 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cosmos-200">正在准备今日词卡...</p>
        </div>
      </div>
    )
  }

  // 完成界面
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-sprout-400 to-star-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Award className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">🎉 今日学习完成！</h1>
          <p className="text-cosmos-300 mb-8">正在跳转到学习总结...</p>
          <div className="w-16 h-16 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-lg border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-[#00F5A0]/12 text-[#00F5A0]">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold text-white">今日词卡没有加载出来</h1>
          <p className="mt-3 text-sm leading-6 text-cosmos-300">
            可能是本地学习记录异常，或当前词库已经全部排到未来复习。你可以重新准备词卡，或进入新版背单词入口。
          </p>
          {isGuest && (
            <p className="mt-3 rounded-lg border border-star-300/20 bg-star-300/10 px-4 py-3 text-sm text-star-100">
              当前是访客模式，登录后会保留长期学习记录。
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => loadNextWord(userId || 'guest', 0)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#00F5A0] px-5 py-3 text-sm font-medium text-[#07111d] transition hover:bg-[#4ff0bc]"
            >
              <RefreshCw className="h-4 w-4" />
              重新准备
            </button>
            <button
              onClick={() => router.push(isGuest ? '/auth/login' : '/vocab')}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              {isGuest ? <LogIn className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
              {isGuest ? '登录账号' : '进入新版背单词'}
            </button>
          </div>
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
          style={{ 
            width: `${targetWords > 0 ? (wordsStudied / targetWords) * 100 : 0}%`
          }}
        />
      </div>

      {/* 顶部工具栏 */}
      <div className="fixed top-4 left-0 right-0 px-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 bg-cosmos-800/80 hover:bg-cosmos-700 rounded-lg text-cosmos-400 hover:text-white transition-all backdrop-blur-sm"
            aria-label="返回学习主页"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            {/* 进度统计 */}
            <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-cosmos-800/80 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-star-400" />
                <span className="text-white text-sm">
                  {wordsStudied}/{targetWords}
                </span>
              </div>
              <div className="w-px h-4 bg-cosmos-600" />
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-white text-sm">{progress?.streak || 0}天</span>
              </div>
            </div>

            <button
              onClick={() => setShowHint(!showHint)}
              className="p-2 bg-cosmos-800/80 hover:bg-cosmos-700 rounded-lg text-cosmos-400 hover:text-white transition-all backdrop-blur-sm"
              aria-label={showHint ? '隐藏翻卡提示' : '显示翻卡提示'}
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
              {/* 卡片正面 - 只显示单词 */}
              <div 
                className="absolute inset-0 backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="h-full bg-cosmos-800/50 backdrop-blur-sm rounded-3xl border border-cosmos-700/50 p-8 flex flex-col items-center justify-center">
                  {/* 新词标记 */}
                  {isNew && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-star-400/20 text-star-400 text-sm rounded-full flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      新词
                    </div>
                  )}

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
                      aria-label={`播放 ${currentWord.word} 发音`}
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 提示 */}
                  {showHint && (
                    <p className="text-cosmos-500 text-sm flex items-center gap-2 animate-pulse">
                      <Keyboard className="w-4 h-4" />
                      按空格键翻转卡片
                    </p>
                  )}
                </div>
              </div>

              {/* 卡片背面 - 显示详细信息 */}
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
                        aria-label={`播放 ${currentWord.word} 发音`}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 释义 */}
                  <div className="text-center mb-6">
                    <p className="text-2xl text-sprout-400 font-medium">{currentWord.meaning}</p>
                  </div>

                  {/* 高亮短语 */}
                  {currentWord.chunk && (
                    <div className="mb-4 p-3 bg-star-400/10 border border-star-400/30 rounded-xl">
                      <p className="text-star-400 text-center">
                        <span className="text-cosmos-400 text-sm mr-2">常用搭配:</span>
                        <span className="font-medium">{currentWord.chunk}</span>
                      </p>
                    </div>
                  )}

                  {/* 例句 */}
                  <div className="mb-4 p-4 bg-cosmos-700/30 rounded-xl">
                    <p className="text-white mb-2 italic">"{currentWord.example}"</p>
                    <p className="text-cosmos-400 text-sm">{currentWord.exampleCn}</p>
                  </div>

                  {/* 易混词警示 */}
                  {currentWord.confusingWords && currentWord.confusingWords.length > 0 && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-400/30 rounded-xl">
                      <p className="text-red-400 text-sm">
                        <span className="font-medium">⚠️ 易混词: </span>
                        {currentWord.confusingWords.join(', ')}
                      </p>
                    </div>
                  )}

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
                  不认识
                </span>
                <span className="text-cosmos-600 mx-1">|</span>
                <span className="inline-flex items-center">
                  <kbd className="px-2 py-0.5 bg-cosmos-700 rounded text-cosmos-300 text-xs mr-1">2</kbd>
                  模糊
                </span>
                <span className="text-cosmos-600 mx-1">|</span>
                <span className="inline-flex items-center">
                  <kbd className="px-2 py-0.5 bg-cosmos-700 rounded text-cosmos-300 text-xs mr-1">Enter</kbd>
                  认识
                </span>
              </p>
            </div>

            {/* 操作按钮 - 使用grid布局 */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => submitReview(0)}
                className="py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-400 rounded-xl transition-all flex flex-col items-center justify-center gap-1"
              >
                <X className="w-6 h-6" />
                <span className="text-sm font-medium">不认识</span>
              </button>
              <button
                onClick={() => submitReview(1)}
                className="py-4 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 text-yellow-400 rounded-xl transition-all flex flex-col items-center justify-center gap-1"
              >
                <Brain className="w-6 h-6" />
                <span className="text-sm font-medium">模糊</span>
              </button>
              <button
                onClick={() => submitReview(2)}
                className="py-4 bg-sprout-500/20 hover:bg-sprout-500/30 border border-sprout-400/30 text-sprout-400 rounded-xl transition-all flex flex-col items-center justify-center gap-1"
              >
                <ChevronRight className="w-6 h-6" />
                <span className="text-sm font-medium">认识</span>
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
