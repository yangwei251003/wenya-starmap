'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MobileNavigation from '@/components/mobile/MobileNavigation'
import { MobileContainer, MobileCard, MobileStatCard } from '@/components/mobile/MobileOptimized'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Star, 
  TrendingUp, 
  Calendar, 
  Battery, 
  Target, 
  Trophy,
  BookOpen,
  Flame,
  Brain,
  BarChart3,
  Activity,
  Clock,
  Zap
} from 'lucide-react'

export default function MobileGrowthStarmapPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [studyData, setStudyData] = useState({
    totalWords: 0,
    masteredWords: 0,
    streak: 0,
    accuracy: 0,
    studyTime: 0,
    memoryStrength: 85
  })
  const [weeklyData, setWeeklyData] = useState([
    { day: '周一', words: 25, accuracy: 88 },
    { day: '周二', words: 30, accuracy: 92 },
    { day: '周三', words: 20, accuracy: 85 },
    { day: '周四', words: 35, accuracy: 90 },
    { day: '周五', words: 28, accuracy: 87 },
    { day: '周六', words: 40, accuracy: 94 },
    { day: '周日', words: 32, accuracy: 89 }
  ])

  useEffect(() => {
    // 获取用户数据
    const storedUser = localStorage.getItem('wenya_user')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      
      // 计算学习统计
      calculateStudyStats(user.id)
    }
  }, [])

  const calculateStudyStats = (userId: string) => {
    let totalWords = 0
    let masteredWords = 0
    let streak = 0
    let totalAccuracy = 0
    let sessionCount = 0
    let totalTime = 0

    // 计算过去30天的数据
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const sessionKey = `wenya_study_session_${userId}_${dateStr}`
      const session = localStorage.getItem(sessionKey)
      
      if (session) {
        const sessionData = JSON.parse(session)
        totalWords += sessionData.totalWords || 0
        totalAccuracy += sessionData.accuracy || 0
        totalTime += sessionData.duration || 0
        sessionCount++
        
        if (i === 0 || sessionData.totalWords > 0) {
          streak++
        } else if (streak === i) {
          break
        }
      } else if (streak === i) {
        break
      }
    }

    // 计算掌握的单词数
    const userWordsKey = `wenya_user_words_${userId}`
    const userWords = localStorage.getItem(userWordsKey)
    if (userWords) {
      const words = JSON.parse(userWords)
      masteredWords = words.filter((w: any) => w.interval >= 7).length
    }

    setStudyData({
      totalWords,
      masteredWords,
      streak,
      accuracy: sessionCount > 0 ? Math.round(totalAccuracy / sessionCount) : 0,
      studyTime: Math.round(totalTime / (1000 * 60)), // 转换为分钟
      memoryStrength: Math.min(85 + (masteredWords / 10), 100)
    })
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

  return (
    <div className="min-h-screen bg-cosmos-900">
      <MobileNavigation 
        userData={userData}
        onLogout={handleLogout}
      />

      <MobileContainer>
        {/* 页面标题 */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-star-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-star-400 to-purple-400 bg-clip-text text-transparent mb-2">
            成长星图
          </h1>
          <p className="text-cosmos-300">你的学习数据可视化</p>
        </div>

        {/* 核心统计 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <MobileStatCard
            title="总学习"
            value={studyData.totalWords}
            subtitle="个单词"
            icon={<BookOpen className="w-5 h-5" />}
            color="sprout"
            trend={{ value: 12, isPositive: true }}
          />
          <MobileStatCard
            title="已掌握"
            value={studyData.masteredWords}
            subtitle="个单词"
            icon={<Trophy className="w-5 h-5" />}
            color="star"
            trend={{ value: 8, isPositive: true }}
          />
          <MobileStatCard
            title="连续天数"
            value={studyData.streak}
            subtitle="天"
            icon={<Flame className="w-5 h-5" />}
            color="orange"
          />
          <MobileStatCard
            title="准确率"
            value={`${studyData.accuracy}%`}
            subtitle="平均"
            icon={<Target className="w-5 h-5" />}
            color="purple"
          />
        </div>

        {/* 记忆强度 */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-400/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Battery className="w-5 h-5 text-purple-400" />
              记忆强度
            </h3>
            <span className="text-2xl font-bold text-purple-400">
              {studyData.memoryStrength}%
            </span>
          </div>
          
          <div className="relative">
            <div className="w-full h-4 bg-cosmos-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-1000"
                style={{ width: `${studyData.memoryStrength}%` }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                记忆电量充足
              </span>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-400">{studyData.studyTime}</div>
              <div className="text-cosmos-400 text-xs">学习时长(分钟)</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-400">
                {Math.round((studyData.masteredWords / Math.max(studyData.totalWords, 1)) * 100)}%
              </div>
              <div className="text-cosmos-400 text-xs">掌握率</div>
            </div>
            <div>
              <div className="text-lg font-bold text-star-400">A+</div>
              <div className="text-cosmos-400 text-xs">学习等级</div>
            </div>
          </div>
        </Card>

        {/* 本周学习趋势 */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-sprout-500/20 to-star-500/20 border-sprout-400/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sprout-400" />
              本周趋势
            </h3>
            <Button variant="cosmos" className="text-xs px-3 py-1">
              查看详情
            </Button>
          </div>
          
          <div className="space-y-3">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-cosmos-400 text-sm w-8">{day.day}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm">{day.words} 词</span>
                      <span className="text-sprout-400 text-sm">{day.accuracy}%</span>
                    </div>
                    <div className="w-full h-2 bg-cosmos-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-sprout-400 to-star-400 rounded-full transition-all duration-500"
                        style={{ width: `${(day.words / 40) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 学习热力图 */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-star-500/20 to-orange-500/20 border-star-400/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-star-400" />
              学习热力图
            </h3>
            <span className="text-star-400 text-sm">最近30天</span>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }, (_, i) => {
              const intensity = Math.random()
              const colorClass = intensity > 0.7 ? 'bg-star-400' : 
                               intensity > 0.4 ? 'bg-star-400/60' : 
                               intensity > 0.2 ? 'bg-star-400/30' : 'bg-cosmos-700'
              
              return (
                <div 
                  key={i}
                  className={`w-6 h-6 rounded-sm ${colorClass} transition-all hover:scale-110`}
                />
              )
            })}
          </div>
          
          <div className="flex items-center justify-between mt-4 text-xs text-cosmos-400">
            <span>少</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-cosmos-700 rounded-sm" />
              <div className="w-3 h-3 bg-star-400/30 rounded-sm" />
              <div className="w-3 h-3 bg-star-400/60 rounded-sm" />
              <div className="w-3 h-3 bg-star-400 rounded-sm" />
            </div>
            <span>多</span>
          </div>
        </Card>

        {/* 学习分析 */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            智能分析
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-cosmos-800/50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">最佳学习时间</span>
              </div>
              <p className="text-cosmos-300 text-sm">
                根据数据分析，你在 <span className="text-blue-400 font-bold">晚上8-10点</span> 学习效率最高
              </p>
            </div>
            
            <div className="p-4 bg-cosmos-800/50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">记忆模式</span>
              </div>
              <p className="text-cosmos-300 text-sm">
                你的记忆曲线显示 <span className="text-purple-400 font-bold">视觉记忆</span> 效果更佳
              </p>
            </div>
            
            <div className="p-4 bg-cosmos-800/50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-star-400" />
                <span className="text-white font-medium">学习建议</span>
              </div>
              <p className="text-cosmos-300 text-sm">
                建议每天学习 <span className="text-star-400 font-bold">25-30个</span> 新单词，复习效果最佳
              </p>
            </div>
          </div>
        </Card>

        {/* 成就展示 */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-400" />
            最近成就
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-cosmos-800/50 rounded-lg">
              <div className="w-10 h-10 bg-star-400/20 rounded-full flex items-center justify-center">
                <Flame className="w-5 h-5 text-star-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium">连续学习达人</h4>
                <p className="text-cosmos-400 text-sm">连续学习{studyData.streak}天</p>
              </div>
              <span className="text-star-400 text-sm">+50 星币</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-cosmos-800/50 rounded-lg">
              <div className="w-10 h-10 bg-sprout-400/20 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-sprout-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium">精准射手</h4>
                <p className="text-cosmos-400 text-sm">准确率超过{studyData.accuracy}%</p>
              </div>
              <span className="text-star-400 text-sm">+30 星币</span>
            </div>
          </div>
        </Card>

        {/* 操作按钮 */}
        <div className="space-y-4">
          <Button
            variant="sprout"
            onClick={() => router.push('/mobile-study')}
            className="w-full py-4 text-lg"
          >
            <Brain className="w-6 h-6 mr-2" />
            继续学习
          </Button>
          
          <Button
            variant="star"
            onClick={() => router.push('/mobile-dashboard')}
            className="w-full py-4 text-lg"
          >
            <BarChart3 className="w-6 h-6 mr-2" />
            返回首页
          </Button>
        </div>
      </MobileContainer>
    </div>
  )
}
