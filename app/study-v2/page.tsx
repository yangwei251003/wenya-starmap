'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  X, Volume2, ChevronRight, Sparkles, Brain, Target, 
  Flame, Award, ArrowLeft, Keyboard, Settings, Play,
  CheckCircle, TrendingUp, BookOpen
} from 'lucide-react'
import { enhancedSRSService, StudyGroup, StudyStats } from '@/lib/enhanced-srs-service'
import { Word, ReviewQuality } from '@/types'

type PageState = 'config' | 'studying' | 'groupComplete' | 'allComplete'

export default function StudyV2Page() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState('')
  const [pageState, setPageState] = useState<PageState>('config')
  
  // 配置相关
  const [wordsPerGroup, setWordsPerGroup] = useState(20)
  const [newWordsPerGroup, setNewWordsPerGroup] = useState(10)
  
  // 学习相关
  const [currentGroup, setCurrentGroup] = useState<StudyGroup | null>(null)
  const [currentWord, setCurrentWord] = useState<Word | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [stats, setStats] = useState<StudyStats | null>(null)
  
  // 动画相关
  const [isShaking, setIsShaking] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [groupStartTime] = useState(Date.now())

  // 完成后自动跳转到结算页面
  useEffect(() => {
    if (pageState === 'groupComplete' && stats) {
      const totalCorrect = stats.todayCorrect || 0
      const totalWrong = stats.todayWrong || 0
      const totalWords = stats.todayWords || 0
      const studyTimeSeconds = Math.floor((Date.now() - groupStartTime) / 1000)

      const timer = setTimeout(() => {
        const params = new URLSearchParams({
          groups: stats.todayGroups.toString(),
          words: totalWords.toString(),
          correct: totalCorrect.toString(),
          wrong: totalWrong.toString(),
          time: studyTimeSeconds.toString(),
          streak: stats.streak.toString()
        })
        router.push(`/study-v2/summary?${params.toString()}`)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [pageState, stats, groupStartTime, router])

  // 初始化
  useEffect(() => {
    setMounted(true)
    const user = localStorage.getItem('wenya_user')
    if (user) {
      const userData = JSON.parse(user)
      setUserId(userData.id)
      
      // 加载配置
      const config = enhancedSRSService.getConfig(userData.id)
      setWordsPerGroup(config.wordsPerGroup)
      setNewWordsPerGroup(config.newWordsPerGroup)
      
      // 加载统计
      setStats(enhancedSRSService.getFullStats(userData.id))
      
      // 检查是否有未完成的学习组
      const existingGroup = enhancedSRSService.getCurrentGroup(userData.id)
      if (existingGroup && existingGroup.completed < existingGroup.total) {
        setCurrentGroup(existingGroup)
        loadNextWord(userData.id)
        setPageState('studying')
      }
    }
  }, [])

  // 开始新的学习组
  const startNewGroup = useCallback(() => {
    if (!userId) return
    
    // 保存配置
    enhancedSRSService.saveConfig(userId, {
      wordsPerGroup,
      newWordsPerGroup,
      reviewWordsPerGroup: wordsPerGroup - newWordsPerGroup,
      unlimitedMode: true,
      autoNextGroup: false
    })
    
    // 创建新学习组
    const group = enhancedSRSService.createStudyGroup(userId)
    
    if (group) {
      setCurrentGroup(group)
      loadNextWord(userId)
      setPageState('studying')
    } else {
      setPageState('allComplete')
    }
  }, [userId, wordsPerGroup, newWordsPerGroup])

  // 加载下一个单词
  const loadNextWord = useCallback((uid: string) => {
    const next = enhancedSRSService.getNextWordInGroup(uid)
    
    if (next) {
      setCurrentWord(next.word)
      setIsNew(next.isNew)
      setProgress(next.progress)
      setIsFlipped(false)
      setShowHint(true)
    } else {
      // 当前组完成
      enhancedSRSService.completeCurrentGroup(uid)
      setStats(enhancedSRSService.getFullStats(uid))
      setPageState('groupComplete')
    }
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

    enhancedSRSService.submitWordReview(userId, currentWord.id, quality)
    
    if (quality === 2) {
      enhancedSRSService.playSound('correct')
    } else {
      enhancedSRSService.playSound('wrong')
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    }

    // 加载下一个单词
    setTimeout(() => {
      loadNextWord(userId)
    }, quality === 2 ? 300 : 600)
  }, [currentWord, userId, loadNextWord])

  // 键盘事件
  useEffect(() => {
    if (pageState !== 'studying') return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          flipCard()
          break
        case 'Enter':
          e.preventDefault()
          if (isFlipped) submitReview(2)
          break
        case 'Digit1':
        case 'Numpad1':
          e.preventDefault()
          if (isFlipped) submitReview(0)
          break
        case 'Digit2':
        case 'Numpad2':
          e.preventDefault()
          if (isFlipped) submitReview(1)
          break
        case 'Escape':
          router.push('/dashboard')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pageState, isFlipped, flipCard, submitReview, router])

  // 朗读单词
  const speakWord = () => {
    if (!currentWord || typeof window === 'undefined') return
    const utterance = new SpeechSynthesisUtterance(currentWord.word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-cosmos-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // 配置页面
  if (pageState === 'config') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900 p-6">
        <div className="max-w-2xl mx-auto">
          {/* 返回按钮 */}
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-6 p-2 bg-cosmos-800 hover:bg-cosmos-700 rounded-lg text-cosmos-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">开始学习</h1>
            <p className="text-cosmos-300">设置你的学习计划</p>
          </div>

          {/* 今日统计 */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="sprout-card p-4 text-center">
                <div className="text-3xl font-bold text-sprout-400 mb-1">{stats.todayGroups}</div>
                <div className="text-sm text-cosmos-300">已完成组数</div>
              </div>
              <div className="star-card p-4 text-center">
                <div className="text-3xl font-bold text-star-400 mb-1">{stats.todayWords}</div>
                <div className="text-sm text-cosmos-300">已学单词</div>
              </div>
              <div className="cosmos-card p-4 text-center border-2 border-orange-500/30">
                <div className="text-3xl font-bold text-orange-400 mb-1">{stats.streak}</div>
                <div className="text-sm text-cosmos-300">连续天数</div>
              </div>
            </div>
          )}

          {/* 配置表单 */}
          <div className="cosmos-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-star-400" />
              <h2 className="text-xl font-semibold text-white">学习设置</h2>
            </div>

            <div className="space-y-6">
              {/* 每组单词数 */}
              <div>
                <label className="block text-white mb-3">
                  每组学习单词数: <span className="text-star-400 text-2xl font-bold">{wordsPerGroup}</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={wordsPerGroup}
                  onChange={(e) => setWordsPerGroup(Number(e.target.value))}
                  className="w-full h-2 bg-cosmos-700 rounded-lg appearance-none cursor-pointer accent-star-400"
                />
                <div className="flex justify-between text-xs text-cosmos-400 mt-1">
                  <span>10</span>
                  <span>30</span>
                  <span>50</span>
                </div>
              </div>

              {/* 新词数量 */}
              <div>
                <label className="block text-white mb-3">
                  每组新词数量: <span className="text-sprout-400 text-2xl font-bold">{newWordsPerGroup}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max={wordsPerGroup}
                  step="5"
                  value={newWordsPerGroup}
                  onChange={(e) => setNewWordsPerGroup(Number(e.target.value))}
                  className="w-full h-2 bg-cosmos-700 rounded-lg appearance-none cursor-pointer accent-sprout-400"
                />
                <div className="flex justify-between text-xs text-cosmos-400 mt-1">
                  <span>0 (纯复习)</span>
                  <span>{Math.floor(wordsPerGroup / 2)}</span>
                  <span>{wordsPerGroup} (纯新词)</span>
                </div>
              </div>

              {/* 说明 */}
              <div className="p-4 bg-cosmos-800/50 rounded-lg border border-cosmos-700">
                <p className="text-sm text-cosmos-300">
                  📚 复习词数: <span className="text-yellow-400 font-semibold">{wordsPerGroup - newWordsPerGroup}</span>
                </p>
                <p className="text-xs text-cosmos-400 mt-2">
                  系统会优先安排需要复习的单词，然后补充新词
                </p>
              </div>
            </div>
          </div>

          {/* 开始按钮 */}
          <button
            onClick={startNewGroup}
            className="w-full btn-star text-xl py-6 flex items-center justify-center gap-3 group"
          >
            <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
            开始学习
            <Sparkles className="w-5 h-5 animate-pulse" />
          </button>

          {/* 提示 */}
          <div className="mt-6 text-center text-sm text-cosmos-400">
            <p>💡 完成一组后可以继续学习下一组</p>
            <p className="mt-1">⌨️ 支持键盘快捷键操作</p>
          </div>
        </div>
      </div>
    )
  }

  // 学习完成页面
  if (pageState === 'groupComplete') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-sprout-400 to-star-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">🎉 本组完成！</h1>
          <p className="text-cosmos-300 mb-4">正在生成学习报告...</p>
          <div className="w-16 h-16 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  // 全部完成页面
  if (pageState === 'allComplete') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-sprout-400 to-star-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">🌟 太棒了！</h1>
          <p className="text-xl text-cosmos-300 mb-8">暂时没有需要学习的单词了</p>
          
          {stats && (
            <div className="cosmos-card p-6 mb-6">
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-star-400 mb-2">{stats.totalMastered}</div>
                <div className="text-cosmos-300">已掌握单词</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-cosmos-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-sprout-400">{stats.todayWords}</div>
                  <div className="text-xs text-cosmos-400">今日学习</div>
                </div>
                <div className="p-3 bg-cosmos-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">{stats.streak}</div>
                  <div className="text-xs text-cosmos-400">连续天数</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.push('/growth-starmap')}
              className="w-full btn-star text-lg py-4 flex items-center justify-center gap-2"
            >
              <Award className="w-5 h-5" />
              查看成长星图
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full btn-cosmos text-lg py-4"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 学习页面
  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900 flex flex-col">
      {/* 顶部进度条 */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-cosmos-800 z-50">
        <div 
          className="h-full bg-gradient-to-r from-sprout-400 to-star-400 transition-all duration-500"
          style={{ width: `${(progress.current / progress.total) * 100}%` }}
        />
      </div>

      {/* 顶部工具栏 */}
      <div className="fixed top-4 left-0 right-0 px-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setPageState('config')}
            className="p-2 bg-cosmos-800/80 hover:bg-cosmos-700 rounded-lg text-cosmos-400 hover:text-white transition-all backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 px-4 py-2 bg-cosmos-800/80 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-star-400" />
              <span className="text-white text-sm font-medium">
                {progress.current}/{progress.total}
              </span>
            </div>
            {stats && (
              <>
                <div className="w-px h-4 bg-cosmos-600" />
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-white text-sm">{stats.streak}天</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 单词卡片 */}
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
                  {isNew && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-star-400/20 text-star-400 text-sm rounded-full flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      新词
                    </div>
                  )}

                  <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 text-center">
                    {currentWord.word}
                  </h1>

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

                  <div className="text-center mb-6">
                    <p className="text-2xl text-sprout-400 font-medium">{currentWord.meaning}</p>
                  </div>

                  {currentWord.chunk && (
                    <div className="mb-4 p-3 bg-star-400/10 border border-star-400/30 rounded-xl">
                      <p className="text-star-400 text-center">
                        <span className="text-cosmos-400 text-sm mr-2">常用搭配:</span>
                        <span className="font-medium">{currentWord.chunk}</span>
                      </p>
                    </div>
                  )}

                  <div className="mb-4 p-4 bg-cosmos-700/30 rounded-xl">
                    <p className="text-white mb-2 italic">"{currentWord.example}"</p>
                    <p className="text-cosmos-400 text-sm">{currentWord.exampleCn}</p>
                  </div>

                  {currentWord.confusingWords && currentWord.confusingWords.length > 0 && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-400/30 rounded-xl">
                      <p className="text-red-400 text-sm">
                        <span className="font-medium">⚠️ 易混词: </span>
                        {currentWord.confusingWords.join(', ')}
                      </p>
                    </div>
                  )}

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
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-cosmos-900 via-cosmos-900/95 to-transparent pb-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-3">
              <p className="text-cosmos-500 text-xs">
                <kbd className="px-2 py-1 bg-cosmos-700 rounded text-cosmos-300 text-xs">1</kbd>
                <span className="mx-2">不认识</span>
                <span className="text-cosmos-600">|</span>
                <kbd className="px-2 py-1 bg-cosmos-700 rounded text-cosmos-300 text-xs mx-2">2</kbd>
                <span className="mx-2">模糊</span>
                <span className="text-cosmos-600">|</span>
                <kbd className="px-2 py-1 bg-cosmos-700 rounded text-cosmos-300 text-xs mx-2">Enter</kbd>
                <span className="mx-2">认识</span>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => submitReview(0)}
                className="py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-400 rounded-xl transition-all flex flex-col items-center justify-center gap-1 font-medium"
              >
                <X className="w-5 h-5" />
                <span className="text-sm">不认识</span>
              </button>
              <button
                onClick={() => submitReview(1)}
                className="py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 text-yellow-400 rounded-xl transition-all flex flex-col items-center justify-center gap-1 font-medium"
              >
                <Brain className="w-5 h-5" />
                <span className="text-sm">模糊</span>
              </button>
              <button
                onClick={() => submitReview(2)}
                className="py-3 bg-sprout-500/20 hover:bg-sprout-500/30 border border-sprout-400/30 text-sprout-400 rounded-xl transition-all flex flex-col items-center justify-center gap-1 font-medium"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="text-sm">认识</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
