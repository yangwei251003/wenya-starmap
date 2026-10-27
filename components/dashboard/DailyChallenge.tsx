'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { 
  Zap, Star, Trophy, Clock, Target, 
  Flame, Gift, CheckCircle, Play,
  Sparkles, Award, Crown, Rocket
} from 'lucide-react'

interface Challenge {
  id: string
  title: string
  description: string
  type: 'speed' | 'accuracy' | 'streak' | 'volume' | 'special'
  difficulty: 'easy' | 'medium' | 'hard'
  target: number
  current: number
  unit: string
  reward: {
    coins: number
    exp: number
    badge?: string
  }
  timeLimit?: number // 分钟
  completed: boolean
  available: boolean
}

interface DailyChallengeProps {
  userId: string
  studyStats: {
    streak: number
    todayCompleted: number
    accuracy: number
    totalMastered: number
  }
}

export default function DailyChallenge({ userId, studyStats }: DailyChallengeProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  useEffect(() => {
    // 生成每日挑战
    const generateChallenges = () => {
      const today = new Date()
      const challengeDate = today.toISOString().split('T')[0]
      
      // 检查是否已完成挑战
      const completedChallenges = JSON.parse(
        localStorage.getItem(`wenya_challenges_${userId}_${challengeDate}`) || '[]'
      )

      const allChallenges: Challenge[] = [
        {
          id: 'speed-master',
          title: '⚡ 速度大师',
          description: '在15分钟内学习20个单词',
          type: 'speed',
          difficulty: 'medium',
          target: 20,
          current: studyStats.todayCompleted,
          unit: '个单词',
          reward: { coins: 50, exp: 100, badge: '速度之星' },
          timeLimit: 15,
          completed: completedChallenges.includes('speed-master'),
          available: true
        },
        {
          id: 'accuracy-pro',
          title: '🎯 精准射手',
          description: '保持95%以上准确率完成10个单词',
          type: 'accuracy',
          difficulty: 'hard',
          target: 95,
          current: studyStats.accuracy,
          unit: '%准确率',
          reward: { coins: 80, exp: 150, badge: '精准大师' },
          completed: completedChallenges.includes('accuracy-pro') || (studyStats.accuracy >= 95 && studyStats.todayCompleted >= 10),
          available: studyStats.todayCompleted >= 10
        },
        {
          id: 'streak-warrior',
          title: '🔥 连击战士',
          description: '连续学习达到7天',
          type: 'streak',
          difficulty: 'easy',
          target: 7,
          current: studyStats.streak,
          unit: '天',
          reward: { coins: 100, exp: 200, badge: '坚持之王' },
          completed: completedChallenges.includes('streak-warrior') || studyStats.streak >= 7,
          available: true
        },
        {
          id: 'volume-beast',
          title: '📚 学习狂魔',
          description: '单日学习50个单词',
          type: 'volume',
          difficulty: 'hard',
          target: 50,
          current: studyStats.todayCompleted,
          unit: '个单词',
          reward: { coins: 120, exp: 250, badge: '学习之兽' },
          completed: completedChallenges.includes('volume-beast'),
          available: true
        },
        {
          id: 'weekend-special',
          title: '🌟 周末特训',
          description: '周末完成双倍学习量',
          type: 'special',
          difficulty: 'medium',
          target: 40,
          current: studyStats.todayCompleted,
          unit: '个单词',
          reward: { coins: 150, exp: 300, badge: '周末英雄' },
          completed: completedChallenges.includes('weekend-special'),
          available: today.getDay() === 0 || today.getDay() === 6 // 周末
        }
      ]

      setChallenges(allChallenges.filter(c => c.available))
    }

    generateChallenges()
  }, [userId, studyStats])

  // 计算距离明天的时间
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeRemaining(`${hours}小时${minutes}分钟`)
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 60000)
    return () => clearInterval(interval)
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/20'
      case 'medium': return 'text-star-400 bg-star-400/20'
      case 'hard': return 'text-red-400 bg-red-400/20'
      default: return 'text-cosmos-400 bg-cosmos-400/20'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'speed': return <Zap className="w-5 h-5" />
      case 'accuracy': return <Target className="w-5 h-5" />
      case 'streak': return <Flame className="w-5 h-5" />
      case 'volume': return <Trophy className="w-5 h-5" />
      case 'special': return <Crown className="w-5 h-5" />
      default: return <Star className="w-5 h-5" />
    }
  }

  const startChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    // 跳转到学习页面并传递挑战参数
    if (typeof window !== 'undefined') {
      // 保存挑战信息到 localStorage
      localStorage.setItem('wenya_active_challenge', JSON.stringify(challenge))
      // 跳转到学习页面
      window.location.href = '/study'
    }
  }

  const completedCount = challenges.filter(c => c.completed).length
  const totalRewards = challenges
    .filter(c => c.completed)
    .reduce((sum, c) => sum + c.reward.coins, 0)

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/30">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">每日挑战</h3>
            <p className="text-cosmos-300 text-sm">挑战自我，获得奖励</p>
          </div>
        </div>
        
        {/* 倒计时 */}
        <div className="text-right">
          <div className="flex items-center gap-1 text-purple-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{timeRemaining}</span>
          </div>
          <div className="text-cosmos-500 text-xs">刷新时间</div>
        </div>
      </div>

      {/* 今日统计 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-cosmos-800/30 rounded-lg p-3 text-center">
          <div className="text-purple-400 font-bold text-lg">{completedCount}</div>
          <div className="text-cosmos-400 text-xs">已完成</div>
        </div>
        <div className="bg-cosmos-800/30 rounded-lg p-3 text-center">
          <div className="text-star-400 font-bold text-lg">{challenges.length}</div>
          <div className="text-cosmos-400 text-xs">总挑战</div>
        </div>
        <div className="bg-cosmos-800/30 rounded-lg p-3 text-center">
          <div className="text-sprout-400 font-bold text-lg">{totalRewards}</div>
          <div className="text-cosmos-400 text-xs">星币奖励</div>
        </div>
      </div>

      {/* 挑战列表 */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`p-4 rounded-lg border transition-all ${
              challenge.completed 
                ? 'bg-sprout-500/10 border-sprout-400/30' 
                : 'bg-cosmos-800/30 border-cosmos-600/30 hover:border-purple-400/50'
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-400/20 rounded-lg flex items-center justify-center text-purple-400">
                {getTypeIcon(challenge.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-medium text-sm">{challenge.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty === 'easy' ? '简单' : 
                     challenge.difficulty === 'medium' ? '中等' : '困难'}
                  </span>
                  {challenge.completed && (
                    <CheckCircle className="w-4 h-4 text-sprout-400" />
                  )}
                </div>
                <p className="text-cosmos-400 text-xs mb-2">{challenge.description}</p>
                
                {/* 进度 */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-cosmos-500">进度</span>
                      <span className="text-white">
                        {challenge.current}/{challenge.target} {challenge.unit}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-cosmos-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          challenge.completed ? 'bg-sprout-400' : 'bg-purple-400'
                        }`}
                        style={{ width: `${Math.min((challenge.current / challenge.target) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 奖励 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Gift className="w-3 h-3 text-star-400" />
                      <span className="text-star-400">{challenge.reward.coins} 星币</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span className="text-purple-400">{challenge.reward.exp} 经验</span>
                    </div>
                    {challenge.reward.badge && (
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-orange-400" />
                        <span className="text-orange-400">{challenge.reward.badge}</span>
                      </div>
                    )}
                  </div>
                  
                  {!challenge.completed && (
                    <button
                      onClick={() => startChallenge(challenge)}
                      className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-md text-xs font-medium transition-all flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      开始
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="mt-4 pt-4 border-t border-cosmos-600/30">
        <div className="flex items-center justify-center gap-2 text-sm text-cosmos-400">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>完成挑战获得额外奖励和成就徽章</span>
        </div>
      </div>
    </Card>
  )
}