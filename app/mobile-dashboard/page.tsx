'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MobileNavigation from '@/components/mobile/MobileNavigation'
import { 
  MobileContainer, 
  MobileGrid, 
  MobileStatCard, 
  MobileLearningCard,
  MobileQuickAction,
  MobileSpacing
} from '@/components/mobile/MobileOptimized'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Brain, 
  BookOpen, 
  Star, 
  Target, 
  Trophy, 
  Flame, 
  Users, 
  MessageCircle,
  ShoppingCart,
  Gift,
  BarChart3,
  Play,
  Sparkles,
  TrendingUp,
  Calendar,
  Award,
  Zap,
  Heart
} from 'lucide-react'
import { starCoinService } from '@/lib/star-coin-service'

export default function MobileDashboardPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [starCoins, setStarCoins] = useState(0)
  const [studyStats, setStudyStats] = useState({ 
    streak: 0, 
    todayCompleted: 0, 
    totalMastered: 0,
    weeklyGoal: 100,
    weeklyProgress: 65
  })
  const [dailyChallenges, setDailyChallenges] = useState([
    { id: 1, title: '单词达人', target: 20, current: 12, reward: 50, completed: false },
    { id: 2, title: '连续学习', target: 3, current: 2, reward: 30, completed: false },
    { id: 3, title: '完美记忆', target: 90, current: 85, reward: 100, completed: false }
  ])

  useEffect(() => {
    // 获取用户数据
    const storedUser = localStorage.getItem('wenya_user')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      setStarCoins(starCoinService.getBalance(user.id))
      
      // 获取学习统计
      const today = new Date().toISOString().split('T')[0]
      const sessionKey = `wenya_study_session_${user.id}_${today}`
      const session = localStorage.getItem(sessionKey)
      const userWordsKey = `wenya_user_words_${user.id}`
      const userWords = localStorage.getItem(userWordsKey)
      
      let streak = 0
      let todayCompleted = 0
      let totalMastered = 0
      
      if (session) {
        const sessionData = JSON.parse(session)
        todayCompleted = sessionData.totalWords || 0
      }
      
      if (userWords) {
        const words = JSON.parse(userWords)
        totalMastered = words.filter((w: any) => w.interval >= 7).length
      }
      
      // 计算连续天数
      for (let i = 0; i < 365; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const daySession = localStorage.getItem(`wenya_study_session_${user.id}_${dateStr}`)
        if (daySession) {
          const dayData = JSON.parse(daySession)
          if (dayData.totalWords > 0) {
            streak++
          } else {
            break
          }
        } else if (i > 0) {
          break
        }
      }
      
      setStudyStats(prev => ({ 
        ...prev, 
        streak, 
        todayCompleted, 
        totalMastered 
      }))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('wenya_user')
    router.push('/')
  }

  const quickActions = [
    {
      title: '智能学习',
      subtitle: 'FSRS算法',
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      onClick: () => router.push('/study-fsrs'),
      color: 'purple' as const
    },
    {
      title: '传统学习',
      subtitle: '经典模式',
      icon: <BookOpen className="w-6 h-6 text-blue-400" />,
      onClick: () => router.push('/study'),
      color: 'blue' as const
    },
    {
      title: '成长星图',
      subtitle: '学习数据',
      icon: <Star className="w-6 h-6 text-star-400" />,
      onClick: () => router.push('/growth-starmap'),
      color: 'star' as const
    },
    {
      title: 'AI对话',
      subtitle: '智能练习',
      icon: <MessageCircle className="w-6 h-6 text-orange-400" />,
      onClick: () => router.push('/chat'),
      color: 'orange' as const
    },
    {
      title: '社区',
      subtitle: '星光殿堂',
      icon: <Users className="w-6 h-6 text-pink-400" />,
      onClick: () => router.push('/community'),
      color: 'pink' as const
    },
    {
      title: '课程商店',
      subtitle: '购买课程',
      icon: <ShoppingCart className="w-6 h-6 text-sprout-400" />,
      onClick: () => router.push('/store'),
      color: 'sprout' as const
    }
  ]

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

  return (
    <div className="min-h-screen bg-cosmos-900">
      <MobileNavigation 
        userData={userData}
        starCoins={starCoins}
        onLogout={handleLogout}
      />

      <MobileContainer>
        {/* 欢迎区域 */}
        <Card className="p-6 bg-gradient-to-r from-sprout-500/20 to-star-500/20 border-sprout-400/30 mb-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-sprout-400 to-star-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              欢迎回来，{userData.username}！
            </h2>
            <p className="text-cosmos-300 flex items-center justify-center gap-2">
              <Star className="w-4 h-4 text-star-400" />
              {userData.level === 'beginner' && '初学者 - 开始学习之旅'}
              {userData.level === 'intermediate' && '中级学习者 - 继续提升'}
              {userData.level === 'advanced' && '高级学习者 - 追求卓越'}
            </p>
          </div>
        </Card>

        {/* 学习统计 */}
        <MobileGrid cols={{ mobile: 2, tablet: 4, desktop: 4 }} className="mb-6">
          <MobileStatCard
            title="连续天数"
            value={studyStats.streak}
            subtitle="天"
            icon={<Flame className="w-5 h-5" />}
            color="orange"
            trend={{ value: 12, isPositive: true }}
          />
          <MobileStatCard
            title="今日已学"
            value={studyStats.todayCompleted}
            subtitle="个单词"
            icon={<Target className="w-5 h-5" />}
            color="blue"
          />
          <MobileStatCard
            title="已掌握"
            value={studyStats.totalMastered}
            subtitle="个单词"
            icon={<Trophy className="w-5 h-5" />}
            color="sprout"
            trend={{ value: 8, isPositive: true }}
          />
          <MobileStatCard
            title="星币余额"
            value={starCoins}
            subtitle="可用"
            icon={<Star className="w-5 h-5" />}
            color="star"
          />
        </MobileGrid>

        {/* 今日目标 */}
        <Card className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/30 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              今日目标
            </h3>
            <span className="text-purple-400 text-sm font-medium">
              {Math.round((studyStats.todayCompleted / 30) * 100)}%
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-cosmos-400">学习单词</span>
              <span className="text-white">{studyStats.todayCompleted}/30</span>
            </div>
            <div className="w-full h-3 bg-cosmos-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((studyStats.todayCompleted / 30) * 100, 100)}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-cosmos-400">本周进度</span>
              <span className="text-white">{studyStats.weeklyProgress}/{studyStats.weeklyGoal}</span>
            </div>
            <div className="w-full h-3 bg-cosmos-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sprout-400 to-star-400 rounded-full transition-all duration-500"
                style={{ width: `${(studyStats.weeklyProgress / studyStats.weeklyGoal) * 100}%` }}
              />
            </div>
          </div>
        </Card>

        {/* 学习模式选择 */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Play className="w-6 h-6 text-sprout-400" />
            开始学习
          </h3>
          
          <MobileGrid cols={{ mobile: 1, tablet: 2, desktop: 2 }} gap={4}>
            <MobileLearningCard
              title="智能学习 (FSRS)"
              description="使用最新FSRS算法，智能安排复习时间，提高记忆效率"
              progress={75}
              buttonText="开始智能学习"
              onButtonClick={() => router.push('/study-fsrs')}
              icon={<Brain className="w-6 h-6 text-purple-400" />}
              color="purple"
              isActive={true}
            />
            
            <MobileLearningCard
              title="传统学习模式"
              description="经典的间隔重复算法，稳定可靠的学习体验"
              progress={60}
              buttonText="开始传统学习"
              onButtonClick={() => router.push('/study')}
              icon={<BookOpen className="w-6 h-6 text-blue-400" />}
              color="blue"
            />
          </MobileGrid>
        </div>

        {/* 每日挑战 */}
        <Card className="p-5 bg-gradient-to-br from-star-500/10 to-orange-500/10 border-star-400/30 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-star-400" />
              每日挑战
            </h3>
            <span className="text-star-400 text-sm">
              {dailyChallenges.filter(c => c.completed).length}/{dailyChallenges.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {dailyChallenges.map((challenge) => (
              <div key={challenge.id} className="p-3 bg-cosmos-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{challenge.title}</h4>
                  <div className="flex items-center gap-1 text-star-400">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-bold">{challenge.reward}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-cosmos-400">
                    进度: {challenge.current}/{challenge.target}
                  </span>
                  <span className="text-white">
                    {Math.round((challenge.current / challenge.target) * 100)}%
                  </span>
                </div>
                
                <div className="w-full h-2 bg-cosmos-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-star-400 to-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((challenge.current / challenge.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 快捷操作 */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-star-400" />
            快捷操作
          </h3>
          
          <MobileGrid cols={{ mobile: 2, tablet: 3, desktop: 3 }} gap={3}>
            {quickActions.map((action, index) => (
              <MobileQuickAction
                key={index}
                title={action.title}
                subtitle={action.subtitle}
                icon={action.icon}
                onClick={action.onClick}
                color={action.color}
              />
            ))}
          </MobileGrid>
        </div>

        {/* 学习分析 */}
        <Card className="p-5 bg-gradient-to-br from-sprout-500/10 to-blue-500/10 border-sprout-400/30 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sprout-400" />
              学习分析
            </h3>
            <Button
              variant="sprout"
              onClick={() => router.push('/growth-starmap')}
              className="text-sm px-3 py-1"
            >
              查看详情
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-cosmos-800/50 rounded-lg">
              <div className="text-2xl font-bold text-sprout-400 mb-1">85%</div>
              <div className="text-cosmos-400 text-sm">记忆准确率</div>
            </div>
            <div className="text-center p-3 bg-cosmos-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-1">12</div>
              <div className="text-cosmos-400 text-sm">平均学习时长(分钟)</div>
            </div>
          </div>
        </Card>

        {/* 激励信息 */}
        <Card className="p-5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 text-center">
          <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3 animate-pulse" />
          <h3 className="text-lg font-bold text-white mb-2">坚持就是胜利！</h3>
          <p className="text-cosmos-300 text-sm">
            你已经连续学习了 {studyStats.streak} 天，继续保持这个好习惯吧！
          </p>
        </Card>

        <MobileSpacing size="xl" />
      </MobileContainer>
    </div>
  )
}