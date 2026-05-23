'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Check, Globe, Pause, Play, RefreshCw, Settings, SkipForward, Sparkles, Volume2, X } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { CompletionCelebration } from '@/components/ui/CompletionCelebration'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SpeechPlayer } from '@/lib/speech-service'

interface LiveWord {
  id: string
  word: string
  phonetic: string
  meaning: string
  example: string
  level: 'easy' | 'medium' | 'hard'
  tags: string[]
  audioUrl?: string
}

const seedWords = [
  { word: 'accomplish', level: 'medium' as const },
  { word: 'brilliant', level: 'easy' as const },
  { word: 'curiosity', level: 'medium' as const },
  { word: 'determination', level: 'hard' as const },
  { word: 'enthusiasm', level: 'medium' as const },
]

const levelNames = {
  easy: '轻芽',
  medium: '中芽',
  hard: '硬芽',
}

export default function VocabPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showMeaning, setShowMeaning] = useState(false)
  const [knownWords, setKnownWords] = useState<string[]>([])
  const [unknownWords, setUnknownWords] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [startTime] = useState(Date.now())
  const [isLoadingWords, setIsLoadingWords] = useState(true)
  const [liveWords, setLiveWords] = useState<LiveWord[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)
  const [autoNext, setAutoNext] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  const autoPlayTimerRef = useRef<number | null>(null)
  const [speechPlayer] = useState(() => new SpeechPlayer((playing) => setIsPlaying(playing)))

  useEffect(() => {
    setMounted(true)
    speechPlayer.setAutoPlay(autoPlay)
  }, [speechPlayer, autoPlay])

  useEffect(() => {
    const loadWords = async () => {
      setIsLoadingWords(true)
      try {
        const results = await Promise.all(
          seedWords.map(async (seed, index) => {
            try {
              const response = await fetch(`/api/resources/word?word=${encodeURIComponent(seed.word)}`)
              if (!response.ok) throw new Error('lookup failed')

              const data = await response.json()
              return {
                id: `${seed.word}-${index}`,
                word: data.data?.word || seed.word,
                phonetic: data.data?.phonetic || '',
                meaning: data.data?.definition || '暂无释义',
                example: data.data?.example || `Try using ${seed.word} in a sentence.`,
                level: seed.level,
                tags: Array.isArray(data.data?.tags) && data.data.tags.length > 0 ? data.data.tags : [levelNames[seed.level]],
                audioUrl: data.data?.audioUrl,
              } as LiveWord
            } catch {
              return {
                id: `${seed.word}-${index}`,
                word: seed.word,
                phonetic: '',
                meaning: '暂无释义',
                example: `Try using ${seed.word} in a sentence.`,
                level: seed.level,
                tags: [levelNames[seed.level]],
              } as LiveWord
            }
          })
        )

        setLiveWords(results)
      } finally {
        setIsLoadingWords(false)
      }
    }

    loadWords()
  }, [])

  useEffect(() => {
    if (autoPlayTimerRef.current) {
      window.clearTimeout(autoPlayTimerRef.current)
      autoPlayTimerRef.current = null
    }

    if (mounted && autoPlay && speechEnabled && !isComplete) {
      const currentWord = liveWords[currentIndex]
      if (currentWord) {
        autoPlayTimerRef.current = window.setTimeout(() => {
          void speechPlayer.playWord(currentWord.word, currentWord.phonetic)
        }, 420)
      }
    }

    return () => {
      if (autoPlayTimerRef.current) {
        window.clearTimeout(autoPlayTimerRef.current)
        autoPlayTimerRef.current = null
      }
    }
  }, [currentIndex, mounted, autoPlay, speechEnabled, isComplete, speechPlayer, liveWords])

  const currentWord = liveWords[currentIndex]
  const progress = useMemo(() => {
    if (!liveWords.length) return 0
    return (currentIndex / liveWords.length) * 100
  }, [currentIndex, liveWords.length])

  const getTimeSpent = () => Math.floor((Date.now() - startTime) / 1000)

  const goToNext = () => {
    speechPlayer.stop()
    setShowMeaning(false)

    if (currentIndex < liveWords.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      return
    }

    if (liveWords.length > 0) {
      setIsComplete(true)
      setShowCelebration(true)
    }
  }

  const goToPrevious = () => {
    if (currentIndex === 0) return
    speechPlayer.stop()
    setShowMeaning(false)
    setCurrentIndex((prev) => prev - 1)
  }

  const handlePlayWord = async () => {
    if (!currentWord || !speechEnabled) return
    if (isPlaying) {
      speechPlayer.stop()
      return
    }

    try {
      await speechPlayer.playWord(currentWord.word, currentWord.phonetic)
      if (autoNext) goToNext()
    } catch (error) {
      console.error('播放失败:', error)
    }
  }

  const handlePlayExample = async () => {
    if (!currentWord || !speechEnabled) return
    if (isPlaying) {
      speechPlayer.stop()
      return
    }

    try {
      await speechPlayer.playSentence(currentWord.example)
      if (autoNext) goToNext()
    } catch (error) {
      console.error('播放失败:', error)
    }
  }

  const handleKnow = () => {
    if (!currentWord) return
    setKnownWords((prev) => [...prev, currentWord.id])
    goToNext()
  }

  const handleDontKnow = () => {
    if (!currentWord) return
    setUnknownWords((prev) => [...prev, currentWord.id])
    goToNext()
  }

  const handleRestart = () => {
    speechPlayer.stop()
    setCurrentIndex(0)
    setKnownWords([])
    setUnknownWords([])
    setIsComplete(false)
    setShowMeaning(false)
    setShowCelebration(false)
  }

  const handleGoHome = () => {
    speechPlayer.stop()
    router.push('/dashboard')
  }

  const getLevelStyle = (level: LiveWord['level']) => {
    switch (level) {
      case 'easy':
        return 'text-sprout-300 bg-sprout-400/10 border-sprout-400/20'
      case 'medium':
        return 'text-star-300 bg-star-400/10 border-star-400/20'
      case 'hard':
        return 'text-red-300 bg-red-400/10 border-red-400/20'
    }
  }

  if (isLoadingWords || !currentWord) {
    return (
      <div className="min-h-screen bg-[#0B0F19]">
        <PageHeader title="萌芽采集器" subtitle="正在连接词典星海" titleColor="sprout" backUrl="/dashboard" />
        <div className="mx-auto max-w-2xl px-4 py-16">
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border border-[#00F5A0]/35 border-t-transparent" />
            <p className="text-cosmos-300">正在从 Dictionary API 装载词芽...</p>
          </Card>
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white">
        <PageHeader title="萌芽采集器" subtitle="这一轮词芽已经全部长稳" titleColor="sprout" backUrl="/dashboard" />
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pb-8">
          <Card className="p-8 text-center">
            <Sparkles className="mx-auto mb-4 h-16 w-16 text-star-300" />
            <h2 className="text-2xl font-semibold text-white">词芽采集完成</h2>
            <p className="mt-2 text-cosmos-300">你刚刚把一批单词送进了语言星图。</p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="text-xl font-semibold text-[#00F5A0]">{knownWords.length}</div>
                <div className="mt-1 text-xs text-cosmos-400">已扎根</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="text-xl font-semibold text-orange-300">{unknownWords.length}</div>
                <div className="mt-1 text-xs text-cosmos-400">待返工</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="text-xl font-semibold text-sky-300">{getTimeSpent()}s</div>
                <div className="mt-1 text-xs text-cosmos-400">用时</div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="cosmos" onClick={handleGoHome} className="flex-1">
                返回星图
              </Button>
              <Button variant="star" onClick={handleRestart} className="flex-1 gap-2">
                <RefreshCw className="h-4 w-4" />
                再学一轮
              </Button>
            </div>
          </Card>
        </div>

        <CompletionCelebration
          isVisible={showCelebration}
          onClose={() => setShowCelebration(false)}
          onContinue={() => {
            setShowCelebration(false)
            handleRestart()
          }}
          onGoHome={handleGoHome}
          title="词芽采集完成"
          subtitle="你刚刚把一批单词送进了语言星图"
          correctCount={knownWords.length}
          totalCount={liveWords.length}
          timeSpent={getTimeSpent()}
          xpEarned={knownWords.length * 10}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <PageHeader
        title="萌芽采集器"
        subtitle="把单词翻面、收集、点亮，再连回语言星图"
        titleColor="sprout"
        backUrl="/dashboard"
      />

      <div className="mx-auto max-w-4xl px-4 pb-8">
        <Card className="mb-4 border-white/8 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-[#00F5A0]" />
              <div>
                <p className="text-sm font-medium text-white">外部词典已连接</p>
                <p className="text-xs text-cosmos-400">释义、音标和例句来自 Dictionary API</p>
              </div>
            </div>
            <Button variant="cosmos" size="sm" onClick={handleRestart} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              重新采集
            </Button>
          </div>
        </Card>

        {showSettings && (
          <Card className="mb-6 border-white/8 bg-white/5 p-4">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Settings className="h-5 w-5 text-[#00F5A0]" />
              星语设置
            </h3>
            <div className="space-y-4">
              {[
                { label: '启用语音', value: speechEnabled, onToggle: () => setSpeechEnabled((prev) => !prev) },
                { label: '自动朗读', value: autoPlay, onToggle: () => setAutoPlay((prev) => !prev) },
                { label: '自动前进', value: autoNext, onToggle: () => setAutoNext((prev) => !prev) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-cosmos-300">{item.label}</span>
                  <button
                    onClick={item.onToggle}
                    className={`h-6 w-12 rounded-full transition-colors ${item.value ? 'bg-[#00F5A0]' : 'bg-cosmos-600'}`}
                  >
                    <div className={`h-5 w-5 rounded-full bg-white transition-transform ${item.value ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm text-cosmos-400">
            <span>采集进度</span>
            <div className="flex items-center gap-2">
              <span>
                {currentIndex + 1} / {liveWords.length}
              </span>
              <button onClick={() => setShowSettings((prev) => !prev)} className="p-1 transition-colors hover:text-white" title="星语设置">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/6">
            <div className="h-full rounded-full bg-gradient-to-r from-[#00F5A0] to-star-300 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-3">
          <Button variant="outline" onClick={goToPrevious} disabled={currentIndex === 0} className="gap-2">
            <SkipForward className="h-4 w-4 rotate-180" />
            上一芽
          </Button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayWord}
              disabled={!speechEnabled}
              className={`rounded-full p-3 transition-all ${
                isPlaying ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#00F5A0] text-[#07111d] hover:bg-[#4ff0bc]'
              } ${!speechEnabled ? 'cursor-not-allowed opacity-50' : ''}`}
              title={isPlaying ? '停止播放' : '朗读词芽'}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <Volume2 className="h-5 w-5 text-[#00F5A0]" />
          </div>

          <Button variant="outline" onClick={goToNext} disabled={currentIndex === liveWords.length - 1} className="gap-2">
            下一芽
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <Card className="relative mb-6 overflow-hidden border-white/8 bg-white/5 p-8 text-center">
          <div className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-xs font-medium ${getLevelStyle(currentWord.level)}`}>
            {currentWord.tags[0] || '词芽'}
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-4xl font-semibold text-white">{currentWord.word}</h2>
            <div className="flex items-center justify-center gap-2 text-cosmos-400">
              <span>{currentWord.phonetic || '暂无音标'}</span>
              <button
                onClick={handlePlayWord}
                disabled={!speechEnabled}
                className={`p-1 transition-colors hover:text-[#00F5A0] ${!speechEnabled ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <Volume2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!showMeaning ? (
            <Button variant="outline" onClick={() => setShowMeaning(true)} className="mb-6 gap-2">
              <BookOpen className="h-4 w-4" />
              展开释义
            </Button>
          ) : (
            <div className="mb-6 animate-fade-in-up">
              <p className="mb-2 text-2xl font-medium text-[#00F5A0]">{currentWord.meaning}</p>
              <div className="mb-3 flex flex-wrap justify-center gap-2">
                {currentWord.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-cosmos-300">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <p className="italic text-cosmos-200">"{currentWord.example}"</p>
                  <button
                    onClick={handlePlayExample}
                    disabled={!speechEnabled}
                    className={`p-1 transition-colors hover:text-[#00F5A0] ${!speechEnabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    title="播放例句"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button variant="outline" onClick={handleDontKnow} className="flex-1 max-w-[160px] gap-2 border-red-400/40 hover:border-red-400 hover:bg-red-400/10">
              <X className="h-4 w-4 text-red-300" />
              再发芽
            </Button>
            <Button variant="sprout" onClick={handleKnow} className="flex-1 max-w-[160px] gap-2">
              <Check className="h-4 w-4" />
              已扎根
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-sprout-400/20 bg-sprout-400/10 p-4 text-center">
            <div className="text-2xl font-semibold text-sprout-300">{knownWords.length}</div>
            <div className="text-sm text-cosmos-400">已扎根</div>
          </div>
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-center">
            <div className="text-2xl font-semibold text-red-300">{unknownWords.length}</div>
            <div className="text-sm text-cosmos-400">待返工</div>
          </div>
        </div>
      </div>

      <CompletionCelebration
        isVisible={showCelebration}
        onClose={() => setShowCelebration(false)}
        onContinue={() => {
          setShowCelebration(false)
          handleRestart()
        }}
        onGoHome={handleGoHome}
        title="词芽采集完成"
        subtitle="你刚刚把一批单词送进了语言星图"
        correctCount={knownWords.length}
        totalCount={liveWords.length}
        timeSpent={getTimeSpent()}
        xpEarned={knownWords.length * 10}
      />
    </div>
  )
}
