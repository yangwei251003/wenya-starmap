'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MobileNavigation from '@/components/mobile/MobileNavigation'
import { MobileContainer, MobileCard } from '@/components/mobile/MobileOptimized'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Brain, 
  BookOpen, 
  RotateCcw, 
  Volume2, 
  Eye, 
  EyeOff,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  X,
  Star,
  Target,
  Trophy,
  Flame
} from 'lucide-react'
import { wordsData } from '@/lib/words-data'

interface Word {
  id: string
  word: string
  phonetic: string
  meaning: string
  example: string
  translation: string
}

export default function MobileStudyPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [currentWord, setCurrentWord] = useState<Word | null>(null)
  const [wordIndex, setWordIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showMeaning, setShowMeaning] = useState(false)
  const [studyMode, setStudyMode] = useState<'learn' | 'review'>('learn')
  const [studyStats, setStudyStats] = useState({
    totalWords: 0,
    correctCount: 0,
    wrongCount: 0,
    streak: 0
  })
  const [sessionWords, setSessionWords] = useState<Word[]>([])
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    // 获取用户数据
    const storedUser = localStorage.getItem('wenya_user')
    if (storedUser) {
      setUserData(JSON.parse(storedUser))
    }

    // 初始化学习单词
    const shuffledWords = [...wordsData]
      .sort(() => Math.random() - 0.5)
      .slice(0, 20)
      .map((w) => ({
        ...w,
        translation: w.exampleCn || ''
      }))
    setSessionWords(shuffledWords)
    setCurrentWord(shuffledWords[0])
  }, [])

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    setShowMeaning(!showMeaning)
  }

  const handleAnswer = (difficulty: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentWord) return

    const isCorrect = difficulty === 'good' || difficulty === 'easy'
    
    setStudyStats(prev => ({
      ...prev,
      totalWords: prev.totalWords + 1,
      correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
      wrongCount: !isCorrect ? prev.wrongCount + 1 : prev.wrongCount,
      streak: isCorrect ? prev.streak + 1 : 0
    }))

    // 移动到下一个单词
    if (wordIndex < sessionWords.length - 1) {
      setWordIndex(wordIndex + 1)
      setCurrentWord(sessionWords[wordIndex + 1])
      setIsFlipped(false)
      setShowMeaning(false)
    } else {
      // 学习完成
      setIsCompleted(true)
      saveStudySession()
    }
  }

  const saveStudySession = () => {
    if (!userData) return

    const today = new Date().toISOString().split('T')[0]
    const sessionKey = `wenya_study_session_${userData.id}_${today}`
    
    const sessionData = {
      date: today,
      totalWords: studyStats.totalWords + 1,
      correctCount: studyStats.correctCount,
      wrongCount: studyStats.wrongCount,
      accuracy: Math.round(((studyStats.correctCount) / (studyStats.totalWords + 1)) * 100),
      duration: Date.now() - (sessionStartTime || Date.now()),
      mode: studyMode
    }

    localStorage.setItem(sessionKey, JSON.stringify(sessionData))
  }

  const [sessionStartTime] = useState(Date.now())

  const playAudio = () => {
    if (currentWord && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('wenya_user')
    router.push('/')
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cosmos-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cosmos-300">加载中...</p>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-cosmos-900">
        <MobileNavigation 
          userData={userData}
          onLogout={handleLogout}
        />

        <MobileContainer>
          <Card className="p-8 text-center bg-gradient-to-br from-sprout-500/20 to-star-500/20 border-sprout-400/30">
            <div className="w-20 h-20 bg-gradient-to-br from-sprout-400 to-star-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">学习完成！</h2>
            <p className="text-cosmos-300 mb-6">恭喜你完成了今天的学习任务</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-cosmos-800/50 rounded-xl">
                <div className="text-2xl font-bold text-sprout-400 mb-1">{studyStats.totalWords}</div>
                <div className="text-cosmos-400 text-sm">学习单词</div>
              </div>
              <div className="p-4 bg-cosmos-800/50 rounded-xl">
                <div className="text-2xl font-bold text-star-400 mb-1">
                  {Math.round((studyStats.correctCount / studyStats.totalWords) * 100)}%
                </div>
                <div className="text-cosmos-400 text-sm">正确率</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button
                variant="sprout"
                onClick={() => router.push('/mobile-dashboard')}
                className="w-full"
              >
                返回首页
              </Button>
              <Button
                variant="cosmos"
                onClick={() => router.push('/growth-starmap')}
                className="w-full"
              >
                查看成长星图
              </Button>
            </div>
          </Card>
        </MobileContainer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cosmos-900">
      <MobileNavigation 
        userData={userData}
        onLogout={handleLogout}
      />

      <MobileContainer>
        {/* 学习进度 */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">学习进度</h3>
            <span className="text-purple-400 text-sm">
              {wordIndex + 1} / {sessionWords.length}
            </span>
          </div>
          
          <div className="w-full h-3 bg-cosmos-700 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${((wordIndex + 1) / sessionWords.length) * 100}%` }}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-sprout-400">{studyStats.correctCount}</div>
              <div className="text-cosmos-400 text-xs">正确</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-400">{studyStats.wrongCount}</div>
              <div className="text-cosmos-400 text-xs">错误</div>
            </div>
            <div>
              <div className="text-lg font-bold text-star-400">{studyStats.streak}</div>
              <div className="text-cosmos-400 text-xs">连击</div>
            </div>
          </div>
        </Card>

        {/* 学习卡片 */}
        {currentWord && (
          <div className="mb-6">
            <Card className="relative min-h-[400px] p-6 bg-gradient-to-br from-cosmos-800/50 to-cosmos-700/30 border-cosmos-600/50">
              {/* 卡片翻转按钮 */}
              <button
                onClick={handleFlip}
                className="absolute top-4 right-4 p-2 bg-cosmos-700/50 rounded-lg text-cosmos-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {!isFlipped ? (
                /* 正面 - 单词 */
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="mb-6">
                    <h1 className="text-4xl font-bold text-white mb-4">
                      {currentWord.word}
                    </h1>
                    <p className="text-xl text-cosmos-300 mb-4">
                      {currentWord.phonetic}
                    </p>
                    
                    <button
                      onClick={playAudio}
                      className="flex items-center gap-2 mx-auto px-4 py-2 bg-sprout-400/20 rounded-lg text-sprout-400 hover:bg-sprout-400/30 transition-colors"
                    >
                      <Volume2 className="w-5 h-5" />
                      <span>发音</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowMeaning(!showMeaning)}
                      className="flex items-center gap-2 px-6 py-3 bg-cosmos-700/50 rounded-lg text-white hover:bg-cosmos-600/50 transition-colors"
                    >
                      {showMeaning ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      {showMeaning ? '隐藏释义' : '显示释义'}
                    </button>
                    
                    {showMeaning && (
                      <div className="p-4 bg-cosmos-800/50 rounded-xl">
                        <p className="text-white font-medium mb-2">{currentWord.meaning}</p>
                        <p className="text-cosmos-300 text-sm italic mb-3">{currentWord.example}</p>
                        <p className="text-cosmos-400 text-sm">{currentWord.translation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* 背面 - 释义 */
                <div className="flex flex-col justify-center h-full py-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">{currentWord.meaning}</h2>
                    <div className="p-4 bg-cosmos-800/50 rounded-xl mb-4">
                      <p className="text-cosmos-300 italic mb-2">{currentWord.example}</p>
                      <p className="text-cosmos-400 text-sm">{currentWord.translation}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* 评分按钮 */}
            {(isFlipped || showMeaning) && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button
                  variant="cosmos"
                  onClick={() => handleAnswer('again')}
                  className="flex items-center justify-center gap-2 min-h-[60px] bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-400/30"
                >
                  <X className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold">不认识</div>
                    <div className="text-xs opacity-80">Again</div>
                  </div>
                </Button>
                
                <Button
                  variant="cosmos"
                  onClick={() => handleAnswer('hard')}
                  className="flex items-center justify-center gap-2 min-h-[60px] bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border-orange-400/30"
                >
                  <Target className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold">困难</div>
                    <div className="text-xs opacity-80">Hard</div>
                  </div>
                </Button>
                
                <Button
                  variant="sprout"
                  onClick={() => handleAnswer('good')}
                  className="flex items-center justify-center gap-2 min-h-[60px]"
                >
                  <CheckCircle className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold">认识</div>
                    <div className="text-xs opacity-80">Good</div>
                  </div>
                </Button>
                
                <Button
                  variant="star"
                  onClick={() => handleAnswer('easy')}
                  className="flex items-center justify-center gap-2 min-h-[60px]"
                >
                  <Star className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold">简单</div>
                    <div className="text-xs opacity-80">Easy</div>
                  </div>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 操作提示 */}
        <Card className="p-4 bg-cosmos-800/30 border-cosmos-600/30">
          <div className="text-center">
            <p className="text-cosmos-400 text-sm mb-2">操作提示</p>
            <div className="flex items-center justify-center gap-4 text-xs text-cosmos-500">
              <span>点击卡片翻转</span>
              <span>•</span>
              <span>选择难度评分</span>
              <span>•</span>
              <span>点击发音按钮</span>
            </div>
          </div>
        </Card>
      </MobileContainer>
    </div>
  )
}
