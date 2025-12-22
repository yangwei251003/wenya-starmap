'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { CompletionCelebration } from '@/components/ui/CompletionCelebration'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BookOpen, Volume2, VolumeX, Check, X, Sparkles, RefreshCw, Play, Pause, SkipForward, Settings } from 'lucide-react'
import { SpeechPlayer } from '@/lib/speech-service'

interface VocabWord {
  id: string
  word: string
  phonetic: string
  meaning: string
  example: string
  level: 'easy' | 'medium' | 'hard'
}

const sampleWords: VocabWord[] = [
  { id: '1', word: 'accomplish', phonetic: '/əˈkɑːmplɪʃ/', meaning: '完成，实现', example: 'She accomplished her goal of learning English.', level: 'medium' },
  { id: '2', word: 'brilliant', phonetic: '/ˈbrɪliənt/', meaning: '杰出的，灿烂的', example: 'What a brilliant idea!', level: 'easy' },
  { id: '3', word: 'curiosity', phonetic: '/ˌkjʊriˈɑːsəti/', meaning: '好奇心', example: 'Curiosity is the key to learning.', level: 'medium' },
  { id: '4', word: 'determination', phonetic: '/dɪˌtɜːrmɪˈneɪʃn/', meaning: '决心，毅力', example: 'His determination led to success.', level: 'hard' },
  { id: '5', word: 'enthusiasm', phonetic: '/ɪnˈθuːziæzəm/', meaning: '热情，热忱', example: 'She shows great enthusiasm for learning.', level: 'medium' },
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
  
  // 语音相关状态
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

  // 自动播放当前单词
  useEffect(() => {
    if (mounted && autoPlay && speechEnabled && !isComplete) {
      const currentWord = sampleWords[currentIndex]
      if (currentWord) {
        // 延迟一点播放，让用户看到单词
        setTimeout(() => {
          speechPlayer.playWord(currentWord.word, currentWord.phonetic)
        }, 500)
      }
    }
  }, [currentIndex, mounted, autoPlay, speechEnabled, isComplete, speechPlayer])

  const currentWord = sampleWords[currentIndex]
  const progress = ((currentIndex) / sampleWords.length) * 100

  const handleKnow = () => {
    setKnownWords([...knownWords, currentWord.id])
    goToNext()
  }

  const handleDontKnow = () => {
    setUnknownWords([...unknownWords, currentWord.id])
    goToNext()
  }

  const goToNext = () => {
    speechPlayer.stop()
    setShowMeaning(false)
    
    if (currentIndex < sampleWords.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
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

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="词汇学习" 
        subtitle="扩展你的词汇星空"
        titleColor="sprout"
        backUrl="/dashboard"
      />

      <div className="max-w-2xl mx-auto px-4 pb-8">
        {!isComplete ? (
          <div className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            {/* 语音设置面板 */}
            {showSettings && (
              <Card className="p-4 mb-6 bg-cosmos-800/50 border-purple-400/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  语音设置
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-cosmos-300">启用语音</span>
                    <button
                      onClick={() => setSpeechEnabled(!speechEnabled)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        speechEnabled ? 'bg-sprout-400' : 'bg-cosmos-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        speechEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cosmos-300">自动播放</span>
                    <button
                      onClick={() => setAutoPlay(!autoPlay)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        autoPlay ? 'bg-sprout-400' : 'bg-cosmos-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        autoPlay ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cosmos-300">自动下一个</span>
                    <button
                      onClick={() => setAutoNext(!autoNext)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        autoNext ? 'bg-sprout-400' : 'bg-cosmos-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        autoNext ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {/* 进度条和控制 */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-sm text-cosmos-400 mb-2">
                <span>进度</span>
                <div className="flex items-center gap-2">
                  <span>{currentIndex + 1} / {sampleWords.length}</span>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1 hover:text-white transition-colors"
                    title="语音设置"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="h-2 bg-cosmos-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sprout-400 to-star-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* 导航控制 */}
            <div className="flex justify-between items-center mb-6">
              <Button
                variant="outline"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-2"
              >
                <SkipForward className="w-4 h-4 rotate-180" />
                上一个
              </Button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayWord}
                  disabled={!speechEnabled}
                  className={`p-3 rounded-full transition-all ${
                    isPlaying 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-sprout-400 hover:bg-sprout-500 text-white'
                  } ${!speechEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isPlaying ? '停止播放' : '播放单词'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                
                {speechEnabled ? (
                  <Volume2 className="w-5 h-5 text-sprout-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-cosmos-500" />
                )}
              </div>

              <Button
                variant="outline"
                onClick={goToNext}
                disabled={currentIndex === sampleWords.length - 1}
                className="flex items-center gap-2"
              >
                下一个
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* 单词卡片 */}
            <Card className="p-8 mb-6 text-center relative overflow-hidden">
              {/* 难度标签 */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(currentWord.level)}`}>
                {getLevelText(currentWord.level)}
              </div>

              {/* 单词 */}
              <div className="mb-6">
                <h2 className="text-4xl font-bold text-white mb-2">{currentWord.word}</h2>
                <div className="flex items-center justify-center gap-2 text-cosmos-400">
                  <span>{currentWord.phonetic}</span>
                  <button 
                    onClick={handlePlayWord}
                    disabled={!speechEnabled}
                    className={`p-1 hover:text-sprout-400 transition-colors ${
                      !speechEnabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 显示/隐藏释义 */}
              {!showMeaning ? (
                <Button
                  variant="outline"
                  onClick={() => setShowMeaning(true)}
                  className="mb-6"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  显示释义
                </Button>
              ) : (
                <div className="mb-6 animate-fade-in-up">
                  <p className="text-2xl text-sprout-400 font-medium mb-4">{currentWord.meaning}</p>
                  <div className="bg-cosmos-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <p className="text-cosmos-300 italic">"{currentWord.example}"</p>
                      <button 
                        onClick={handlePlayExample}
                        disabled={!speechEnabled}
                        className={`p-1 hover:text-sprout-400 transition-colors ${
                          !speechEnabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="播放例句"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={handleDontKnow}
                  className="flex-1 max-w-[150px] border-red-400/50 hover:bg-red-400/10 hover:border-red-400"
                >
                  <X className="w-4 h-4 mr-2 text-red-400" />
                  不认识
                </Button>
                <Button
                  variant="sprout"
                  onClick={handleKnow}
                  className="flex-1 max-w-[150px]"
                >
                  <Check className="w-4 h-4 mr-2" />
                  认识
                </Button>
              </div>
            </Card>

            {/* 统计 */}
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

        {/* 完成庆祝 */}
        <CompletionCelebration
          isVisible={showCelebration}
          onClose={handleCelebrationClose}
          onContinue={handleContinue}
          onGoHome={handleGoHome}
          title="词汇学习完成！"
          subtitle="你的词汇量又增加了"
          correctCount={knownWords.length}
          totalCount={sampleWords.length}
          timeSpent={getTimeSpent()}
          xpEarned={knownWords.length * 10}
        />
      </div>
    </div>
  )
}
