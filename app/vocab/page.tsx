'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { CompletionCelebration } from '@/components/ui/CompletionCelebration'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BookOpen, Volume2, Check, X, Sparkles, RefreshCw, Play, Pause, SkipForward, Settings, Globe } from 'lucide-react'
import { SpeechPlayer } from '@/lib/speech-service'

interface LiveWord {
  id: string
  word: string
  phonetic: string
  meaning: string
  example: string
  level: 'easy' | 'medium' | 'hard'
  partOfSpeech?: string
  audioUrl?: string
}

const seedWords = [
  { word: 'accomplish', level: 'medium' as const },
  { word: 'brilliant', level: 'easy' as const },
  { word: 'curiosity', level: 'medium' as const },
  { word: 'determination', level: 'hard' as const },
  { word: 'enthusiasm', level: 'medium' as const },
]

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

  const [speechPlayer] = useState(() => new SpeechPlayer((isPlaying) => setIsPlaying(isPlaying)))
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)
  const [autoNext, setAutoNext] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

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
                partOfSpeech: data.data?.partOfSpeech,
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
    if (mounted && autoPlay && speechEnabled && !isComplete) {
      const currentWord = liveWords[currentIndex]
      if (currentWord) {
        setTimeout(() => {
          speechPlayer.playWord(currentWord.word, currentWord.phonetic)
        }, 500)
      }
    }
  }, [currentIndex, mounted, autoPlay, speechEnabled, isComplete, speechPlayer, liveWords])

  const currentWord = liveWords[currentIndex]
  const progress = useMemo(() => {
    if (!liveWords.length) return 0
    return (currentIndex / liveWords.length) * 100
  }, [currentIndex, liveWords.length])

  const handleKnow = () => {
    if (!currentWord) return
    setKnownWords([...knownWords, currentWord.id])
    goToNext()
  }

  const handleDontKnow = () => {
    if (!currentWord) return
    setUnknownWords([...unknownWords, currentWord.id])
    goToNext()
  }

  const goToNext = () => {
    speechPlayer.stop()
    setShowMeaning(false)

    if (currentIndex < liveWords.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else if (liveWords.length > 0) {
      setIsComplete(true)
      setShowCelebration(true)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      speechPlayer.stop()
      setShowMeaning(false)
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handlePlayWord = async () => {
    if (!currentWord) return
    if (isPlaying) {
      speechPlayer.stop()
    } else {
      try {
        await speechPlayer.playWord(currentWord.word, currentWord.phonetic)
      } catch (error) {
        console.error('播放失败:', error)
      }
    }
  }

  const handlePlayExample = async () => {
    if (!currentWord) return
    if (isPlaying) {
      speechPlayer.stop()
    } else {
      try {
        await speechPlayer.playSentence(currentWord.example)
      } catch (error) {
        console.error('播放失败:', error)
      }
    }
  }

  const handleRestart = () => {
    speechPlayer.stop()
    setCurrentIndex(0)
    setKnownWords([])
    setUnknownWords([])
    setIsComplete(false)
    setShowMeaning(false)
  }

  const handleCelebrationClose = () => {
    setShowCelebration(false)
  }

  const handleContinue = () => {
    setShowCelebration(false)
    handleRestart()
  }

  const handleGoHome = () => {
    speechPlayer.stop()
    router.push('/dashboard')
  }

  const getTimeSpent = () => Math.floor((Date.now() - startTime) / 1000)

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'easy': return 'text-sprout-400 bg-sprout-400/20'
      case 'medium': return 'text-star-400 bg-star-400/20'
      case 'hard': return 'text-red-400 bg-red-400/20'
      default: return 'text-cosmos-400 bg-cosmos-400/20'
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'easy': return '简单'
      case 'medium': return '中等'
      case 'hard': return '困难'
      default: return level
    }
  }

  if (isLoadingWords || !currentWord) {
    return (
      <div className="min-h-screen">
        <PageHeader title="词汇学习" subtitle="正在连接外部词典星海" titleColor="sprout" backUrl="/dashboard" />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="p-8 text-center">
            <div className="w-14 h-14 border-4 border-star-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-cosmos-300">正在从 Dictionary API 加载单词...</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="词汇学习"
        subtitle="实时词典驱动的星芽词汇卡"
        titleColor="sprout"
        backUrl="/dashboard"
      />

      <div className="max-w-2xl mx-auto px-4 pb-8">
        <Card className="p-4 mb-4 bg-cosmos-900/60 border-cosmos-700/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-star-400" />
              <div>
                <p className="text-white text-sm font-medium">外部词典已连接</p>
                <p className="text-cosmos-400 text-xs">释义、音标和例句来自 Dictionary API</p>
              </div>
            </div>
            <Button variant="cosmos" size="sm" onClick={handleRestart}>
              <RefreshCw className="w-4 h-4 mr-2" />
              重新抽取
            </Button>
          </div>
        </Card>

        {!isComplete ? (
          <div className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            {showSettings && (
              <Card className="p-4 mb-6 bg-cosmos-800/50 border-purple-400/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  语音设置
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-cosmos-300">启用语音</span>
                    <button onClick={() => setSpeechEnabled(!speechEnabled)} className={`w-12 h-6 rounded-full transition-colors ${speechEnabled ? 'bg-sprout-400' : 'bg-cosmos-600'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${speechEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cosmos-300">自动播放</span>
                    <button onClick={() => setAutoPlay(!autoPlay)} className={`w-12 h-6 rounded-full transition-colors ${autoPlay ? 'bg-sprout-400' : 'bg-cosmos-600'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${autoPlay ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cosmos-300">自动下一个</span>
                    <button onClick={() => setAutoNext(!autoNext)} className={`w-12 h-6 rounded-full transition-colors ${autoNext ? 'bg-sprout-400' : 'bg-cosmos-600'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${autoNext ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </Card>
            )}

            <div className="mb-6">
              <div className="flex justify-between items-center text-sm text-cosmos-400 mb-2">
                <span>进度</span>
                <div className="flex items-center gap-2">
                  <span>{currentIndex + 1} / {liveWords.length}</span>
                  <button onClick={() => setShowSettings(!showSettings)} className="p-1 hover:text-white transition-colors" title="语音设置">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="h-2 bg-cosmos-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sprout-400 to-star-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <Button variant="outline" onClick={goToPrevious} disabled={currentIndex === 0} className="flex items-center gap-2">
                <SkipForward className="w-4 h-4 rotate-180" />
                上一个
              </Button>

              <div className="flex items-center gap-2">
                <button onClick={handlePlayWord} disabled={!speechEnabled} className={`p-3 rounded-full transition-all ${isPlaying ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-sprout-400 hover:bg-sprout-500 text-white'} ${!speechEnabled ? 'opacity-50 cursor-not-allowed' : ''}`} title={isPlaying ? '停止播放' : '播放单词'}>
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <Volume2 className="w-5 h-5 text-sprout-400" />
              </div>

              <Button variant="outline" onClick={goToNext} disabled={currentIndex === liveWords.length - 1} className="flex items-center gap-2">
                下一个
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            <Card className="p-8 mb-6 text-center relative overflow-hidden">
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(currentWord.level)}`}>
                {getLevelText(currentWord.level)}
              </div>

              <div className="mb-6">
                <h2 className="text-4xl font-bold text-white mb-2">{currentWord.word}</h2>
                <div className="flex items-center justify-center gap-2 text-cosmos-400">
                  <span>{currentWord.phonetic || '暂无音标'}</span>
                  <button onClick={handlePlayWord} disabled={!speechEnabled} className={`p-1 hover:text-sprout-400 transition-colors ${!speechEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {!showMeaning ? (
                <Button variant="outline" onClick={() => setShowMeaning(true)} className="mb-6">
                  <BookOpen className="w-4 h-4 mr-2" />
                  显示释义
                </Button>
              ) : (
                <div className="mb-6 animate-fade-in-up">
                  <p className="text-2xl text-sprout-400 font-medium mb-2">{currentWord.meaning}</p>
                  {currentWord.partOfSpeech && (
                    <p className="text-sm text-cosmos-400 mb-3">词性：{currentWord.partOfSpeech}</p>
                  )}
                  <div className="bg-cosmos-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <p className="text-cosmos-300 italic">"{currentWord.example}"</p>
                      <button onClick={handlePlayExample} disabled={!speechEnabled} className={`p-1 hover:text-sprout-400 transition-colors ${!speechEnabled ? 'opacity-50 cursor-not-allowed' : ''}`} title="播放例句">
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleDontKnow} className="flex-1 max-w-[150px] border-red-400/50 hover:bg-red-400/10 hover:border-red-400">
                  <X className="w-4 h-4 mr-2 text-red-400" />
                  不认识
                </Button>
                <Button variant="sprout" onClick={handleKnow} className="flex-1 max-w-[150px]">
                  <Check className="w-4 h-4 mr-2" />
                  认识
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-sprout-400/10 border border-sprout-400/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-sprout-400">{knownWords.length}</div>
                <div className="text-sm text-cosmos-400">已掌握</div>
              </div>
              <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{unknownWords.length}</div>
                <div className="text-sm text-cosmos-400">需复习</div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`text-center ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <Card className="p-8">
              <Sparkles className="w-16 h-16 text-star-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">学习完成！</h2>
              <p className="text-cosmos-300 mb-6">你已完成本轮词汇学习</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-sprout-400/10 rounded-xl p-4">
                  <div className="text-3xl font-bold text-sprout-400">{knownWords.length}</div>
                  <div className="text-sm text-cosmos-400">已掌握</div>
                </div>
                <div className="bg-red-400/10 rounded-xl p-4">
                  <div className="text-3xl font-bold text-red-400">{unknownWords.length}</div>
                  <div className="text-sm text-cosmos-400">需复习</div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={handleGoHome} className="flex-1">
                  返回主页
                </Button>
                <Button variant="sprout" onClick={handleRestart} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  再学一轮
                </Button>
              </div>
            </Card>
          </div>
        )}

        <CompletionCelebration
          isVisible={showCelebration}
          onClose={handleCelebrationClose}
          onContinue={handleContinue}
          onGoHome={handleGoHome}
          title="词汇学习完成！"
          subtitle="你的词汇星空又亮了一颗"
          correctCount={knownWords.length}
          totalCount={liveWords.length}
          timeSpent={getTimeSpent()}
          xpEarned={knownWords.length * 10}
        />
      </div>
    </div>
  )
}
