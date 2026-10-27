'use client'

import { useEffect, useState } from 'react'
import { Star, Trophy, Sparkles, Heart, Rocket, ArrowRight, Home } from 'lucide-react'
import { Button } from './Button'

interface CompletionCelebrationProps {
  isVisible: boolean
  onClose: () => void
  onContinue?: () => void
  onGoHome?: () => void
  title?: string
  subtitle?: string
  score?: number
  maxScore?: number
  correctCount?: number
  totalCount?: number
  timeSpent?: number
  xpEarned?: number
  streakDays?: number
  encouragement?: string
}

export function CompletionCelebration({
  isVisible,
  onClose,
  onContinue,
  onGoHome,
  title = '太棒了！',
  subtitle = '你完成了今天的学习',
  score,
  maxScore,
  correctCount,
  totalCount,
  timeSpent,
  xpEarned = 50,
  streakDays = 1,
  encouragement
}: CompletionCelebrationProps) {
  const [showContent, setShowContent] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([])

  useEffect(() => {
    if (isVisible) {
      // 生成彩带
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        color: ['#22c55e', '#facc15', '#a855f7', '#3b82f6', '#ef4444'][Math.floor(Math.random() * 5)]
      }))
      setConfetti(newConfetti)

      // 依次显示内容
      setTimeout(() => setShowContent(true), 300)
      setTimeout(() => setShowStats(true), 800)
      setTimeout(() => setShowButtons(true), 1300)
    } else {
      setShowContent(false)
      setShowStats(false)
      setShowButtons(false)
      setConfetti([])
    }
  }, [isVisible])

  if (!isVisible) return null

  const accuracy = totalCount ? Math.round((correctCount || 0) / totalCount * 100) : 0
  const formatTime = (seconds?: number) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 根据正确率生成鼓励语
  const getEncouragement = () => {
    if (encouragement) return encouragement
    if (accuracy >= 90) return '🌟 完美表现！你是学习之星！'
    if (accuracy >= 70) return '💪 做得很好！继续保持！'
    if (accuracy >= 50) return '🌱 不错的开始，继续努力！'
    return '❤️ 每一次练习都是进步，加油！'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-cosmos-900/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 彩带效果 */}
      {confetti.map(c => (
        <div
          key={c.id}
          className="absolute w-3 h-3 rounded-full animate-confetti"
          style={{
            left: `${c.x}%`,
            top: '-20px',
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      {/* 主要内容 */}
      <div className={`relative bg-gradient-to-br from-cosmos-800 to-cosmos-900 rounded-3xl p-8 max-w-md w-full mx-4 border border-star-400/30 shadow-2xl transform transition-all duration-500 ${showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        {/* 顶部装饰 */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <div className="w-16 h-16 bg-gradient-to-br from-star-400 to-star-600 rounded-full flex items-center justify-center shadow-lg shadow-star-400/50 animate-bounce-soft">
            <Trophy className="w-8 h-8 text-cosmos-900" />
          </div>
        </div>

        {/* 标题 */}
        <div className="text-center mt-8 mb-6">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-star-400 animate-pulse" />
            {title}
            <Sparkles className="w-6 h-6 text-star-400 animate-pulse" />
          </h2>
          <p className="text-cosmos-300">{subtitle}</p>
        </div>

        {/* 统计数据 */}
        <div className={`space-y-4 mb-6 transition-all duration-500 ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* 分数/正确率 */}
          {(score !== undefined || correctCount !== undefined) && (
            <div className="bg-cosmos-800/50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-cosmos-400">正确率</span>
                <span className="text-2xl font-bold text-sprout-400">{accuracy}%</span>
              </div>
              <div className="w-full h-3 bg-cosmos-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sprout-400 to-star-400 rounded-full transition-all duration-1000"
                  style={{ width: `${accuracy}%` }}
                />
              </div>
              {correctCount !== undefined && totalCount !== undefined && (
                <p className="text-sm text-cosmos-400 mt-2 text-center">
                  答对 {correctCount} / {totalCount} 题
                </p>
              )}
            </div>
          )}

          {/* 其他统计 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-cosmos-800/50 rounded-xl p-3 text-center">
              <Star className="w-5 h-5 text-star-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">+{xpEarned}</div>
              <div className="text-xs text-cosmos-400">经验值</div>
            </div>
            <div className="bg-cosmos-800/50 rounded-xl p-3 text-center">
              <Rocket className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{formatTime(timeSpent)}</div>
              <div className="text-xs text-cosmos-400">用时</div>
            </div>
            <div className="bg-cosmos-800/50 rounded-xl p-3 text-center">
              <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{streakDays}天</div>
              <div className="text-xs text-cosmos-400">连续学习</div>
            </div>
          </div>

          {/* 鼓励语 */}
          <div className="text-center py-3 bg-gradient-to-r from-sprout-400/10 to-star-400/10 rounded-xl border border-sprout-400/20">
            <p className="text-lg text-cosmos-200">{getEncouragement()}</p>
          </div>
        </div>

        {/* 按钮 */}
        <div className={`flex gap-3 transition-all duration-500 ${showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {onGoHome && (
            <Button
              variant="outline"
              onClick={onGoHome}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              返回主页
            </Button>
          )}
          {onContinue && (
            <Button
              variant="star"
              onClick={onContinue}
              className="flex-1 flex items-center justify-center gap-2"
            >
              继续学习
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
          {!onContinue && !onGoHome && (
            <Button
              variant="sprout"
              onClick={onClose}
              className="w-full"
            >
              完成
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
