'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useDashboard } from '@/hooks/useDashboard'
import { ProgressCard } from '@/components/dashboard/ProgressCard'
import { StarMap } from '@/components/dashboard/StarMap'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RecommendedLessons } from '@/components/dashboard/RecommendedLessons'
import { GrowthAnimation } from '@/components/dashboard/GrowthAnimation'
import AIAssistant from '@/components/dashboard/AIAssistant'
import LeaderBoard from '@/components/dashboard/LeaderBoard'
import StudyGoals from '@/components/dashboard/StudyGoals'
import DailyChallenge from '@/components/dashboard/DailyChallenge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { User, Star, Sparkles, Rocket, BookOpen, Target, Trophy, LogOut, Sprout, Coins, Gift, CheckCircle, ShoppingCart, Crown, Users, Brain, Flame, Settings, Play, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { starCoinService } from '@/lib/star-coin-service'

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'
  const isWelcome = searchParams.get('welcome') === 'true'
  
  const { learningPath, achievements, stats, isLoading, error, refreshData } = useDashboard()
  const [showAnimation, setShowAnimation] = useState(isWelcome)
  const [userData, setUserData] = useState<any>(null)
  const [starCoins, setStarCoins] = useState(0)
  const [canCheckin, setCanCheckin] = useState(false)
  const [checkinStreak, setCheckinStreak] = useState(0)
  const [showCheckinResult, setShowCheckinResult] = useState(false)
  const [checkinResult, setCheckinResult] = useState<{ success: boolean; message: string; isHoliday: boolean } | null>(null)
  const [studyPlan, setStudyPlan] = useState({
    newWords: 10,
    reviewWords: 20,
    wordType: 'CET4',
    theme: '全部'
  })
  const [showPlanConfig, setShowPlanConfig] = useState(false)
  const [studyStats, setStudyStats] = useState({ streak: 0, todayCompleted: 0, totalMastered: 0 })

  useEffect(() => {
    // 获取用户数据
    const storedUser = localStorage.getItem('wenya_user')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      // 获取星币信息
      setStarCoins(starCoinService.getBalance(user.id))
      const checkinInfo = starCoinService.getCheckinInfo(user.id)
      setCanCheckin(checkinInfo.canCheckin)
      setCheckinStreak(checkinInfo.streak)
      
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
      
      setStudyStats({ streak, todayCompleted, totalMastered })
      
      // 获取保存的学习计划
      const savedPlan = localStorage.getItem(`wenya_study_plan_${user.id}`)
      if (savedPlan) {
        setStudyPlan(JSON.parse(savedPlan))
      }
    }
  }, [])

  // 签到
  const handleCheckin = () => {
    if (!userData) return
    const result = starCoinService.dailyCheckin(userData.id)
    setCheckinResult(result)
    setShowCheckinResult(true)
    if (result.success) {
      setStarCoins(starCoinService.getBalance(userData.id))
      setCanCheckin(false)
      setCheckinStreak(result.streak)
    }
  }

  const handleStartLesson = (lessonId: string) => {
    console.log('Starting lesson:', lessonId)
    // 导航到课程详情页
    router.push(`/lesson/${lessonId}`)
  }

  const handleLogout = () => {
    localStorage.removeItem('wenya_user')
    router.push('/')
  }

  // 保存学习计划
  const savePlan = () => {
    if (userData) {
      localStorage.setItem(`wenya_study_plan_${userData.id}`, JSON.stringify(studyPlan))
      setShowPlanConfig(false)
    }
  }

  // 开始学习
  const startStudy = () => {
    if (userData) {
      localStorage.setItem(`wenya_study_plan_${userData.id}`, JSON.stringify(studyPlan))
      router.push('/study')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cosmos-300">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={refreshData}>重试</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* 顶部导航栏 */}
      <div className="glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Sprout className="w-8 h-8 text-sprout-400 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent">
                问芽星图
              </span>
            </Link>

            {/* 用户信息和操作 */}
            <div className="flex items-center gap-4">
              {userData && (
                <>
                  <div className="hidden sm:flex items-center gap-2 text-cosmos-300">
                    <div className="w-8 h-8 bg-gradient-to-br from-sprout-400 to-star-400 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">{userData.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cosmos-800/50 hover:bg-red-500/20 text-cosmos-400 hover:text-red-400 transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">退出</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* 欢迎横幅 */}
        {userData && (
          <Card className="mb-8 p-6 bg-gradient-to-r from-sprout-500/20 to-star-500/20 border-sprout-400/30">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 bg-gradient-to-br from-sprout-400 to-star-400 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    欢迎回来，{userData.username}！
                  </h2>
                  <p className="text-cosmos-300 flex items-center gap-2 flex-wrap">
                    <Star className="w-4 h-4 text-star-400" />
                    {userData.level === 'beginner' && '初学者 - 让我们一起开始学习之旅'}
                    {userData.level === 'intermediate' && '中级学习者 - 继续提升你的英语水平'}
                    {userData.level === 'advanced' && '高级学习者 - 追求更高的语言境界'}
                    {isDemo && (
                      <span className="ml-2 px-2 py-1 bg-star-400/20 text-star-300 text-xs rounded-full">
                        演示模式
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              {/* 星币和签到区域 */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* 星币余额 */}
                <Link href="/recharge" className="group">
                  <div className="flex items-center gap-2 px-4 py-2 bg-star-400/20 rounded-lg hover:bg-star-400/30 transition-all">
                    <Coins className="w-5 h-5 text-star-400" />
                    <span className="text-lg font-bold text-star-400">{starCoins}</span>
                    <Crown className="w-4 h-4 text-star-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
                
                {/* 签到按钮 */}
                <button
                  onClick={handleCheckin}
                  disabled={!canCheckin}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    canCheckin 
                      ? 'bg-sprout-400 hover:bg-sprout-500 text-white cursor-pointer' 
                      : 'bg-cosmos-700 text-cosmos-400 cursor-not-allowed'
                  }`}
                >
                  {canCheckin ? (
                    <>
                      <Gift className="w-5 h-5" />
                      <span>签到</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>已签到</span>
                    </>
                  )}
                </button>
                
                {/* 连续签到天数 */}
                {checkinStreak > 0 && (
                  <div className="hidden sm:flex items-center gap-1 px-3 py-2 bg-purple-400/20 rounded-lg">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-400">连续{checkinStreak}天</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent mb-2">
            学习仪表板
          </h1>
          <p className="text-cosmos-300 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-star-400" />
            你的成长星图
            <Sparkles className="w-4 h-4 text-star-400" />
          </p>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* 左侧列 - 进度和统计 */}
          <div className="lg:col-span-1 space-y-6">
            {learningPath && (
              <ProgressCard
                currentLevel={learningPath.currentLevel}
                targetLevel={learningPath.targetLevel}
                progress={learningPath.progress}
                completedLessons={learningPath.completedLessons.length}
                totalLessons={learningPath.recommendedNext.length + learningPath.completedLessons.length}
              />
            )}

            <StatsCard stats={stats} />
            
            {/* 今日学习目标卡片 */}
            <Card className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/30">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                今日目标
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-cosmos-400 text-sm">背单词</span>
                  <span className="text-white text-sm">{studyStats.todayCompleted}/{studyPlan.newWords + studyPlan.reviewWords} 词</span>
                </div>
                <div className="w-full h-2 bg-cosmos-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all" style={{ width: `${Math.min((studyStats.todayCompleted / (studyPlan.newWords + studyPlan.reviewWords)) * 100, 100)}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cosmos-400 text-sm">课程学习</span>
                  <span className="text-white text-sm">{learningPath?.completedLessons.length || 0} 节</span>
                </div>
                <div className="w-full h-2 bg-cosmos-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sprout-400 to-star-400 rounded-full" style={{ width: `${learningPath ? (learningPath.completedLessons.length / Math.max(learningPath.recommendedNext.length + learningPath.completedLessons.length, 1)) * 100 : 0}%` }} />
                </div>
              </div>
            </Card>
          </div>

          {/* 中间列 - 背单词功能区 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 背单词主卡片 */}
            <Card className="p-6 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-cyan-400/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Brain className="w-6 h-6 text-cyan-400" />
                  背单词
                </h3>
                <button
                  onClick={() => setShowPlanConfig(!showPlanConfig)}
                  className="p-2 bg-cosmos-700/50 hover:bg-cosmos-600/50 rounded-lg text-cosmos-400 hover:text-white transition-all"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              {/* 学习统计 */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-cosmos-800/50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
                    <Flame className="w-4 h-4" />
                    <span className="text-lg font-bold">{studyStats.streak}</span>
                  </div>
                  <p className="text-cosmos-500 text-xs">连续天数</p>
                </div>
                <div className="bg-cosmos-800/50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-lg font-bold">{studyStats.todayCompleted}</span>
                  </div>
                  <p className="text-cosmos-500 text-xs">今日已学</p>
                </div>
                <div className="bg-cosmos-800/50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-sprout-400 mb-1">
                    <Trophy className="w-4 h-4" />
                    <span className="text-lg font-bold">{studyStats.totalMastered}</span>
                  </div>
                  <p className="text-cosmos-500 text-xs">已掌握</p>
                </div>
              </div>

              {/* 学习计划配置 */}
              {showPlanConfig ? (
                <div className="space-y-4 mb-4 p-4 bg-cosmos-800/30 rounded-xl">
                  <div>
                    <label className="text-cosmos-400 text-sm mb-2 block">新词数量</label>
                    <div className="flex gap-2">
                      {[5, 10, 15, 20].map(num => (
                        <button
                          key={num}
                          onClick={() => setStudyPlan(p => ({ ...p, newWords: num }))}
                          className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                            studyPlan.newWords === num
                              ? 'bg-cyan-400 text-white'
                              : 'bg-cosmos-700 text-cosmos-400 hover:bg-cosmos-600'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-cosmos-400 text-sm mb-2 block">复习数量</label>
                    <div className="flex gap-2">
                      {[10, 20, 30, 50].map(num => (
                        <button
                          key={num}
                          onClick={() => setStudyPlan(p => ({ ...p, reviewWords: num }))}
                          className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                            studyPlan.reviewWords === num
                              ? 'bg-purple-400 text-white'
                              : 'bg-cosmos-700 text-cosmos-400 hover:bg-cosmos-600'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-cosmos-400 text-sm mb-2 block">单词类型</label>
                    <div className="flex gap-2 flex-wrap">
                      {['CET4', 'CET6', '考研', '托福'].map(type => (
                        <button
                          key={type}
                          onClick={() => setStudyPlan(p => ({ ...p, wordType: type }))}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            studyPlan.wordType === type
                              ? 'bg-star-400 text-cosmos-900'
                              : 'bg-cosmos-700 text-cosmos-400 hover:bg-cosmos-600'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-cosmos-400 text-sm mb-2 block">主题</label>
                    <div className="flex gap-2 flex-wrap">
                      {['全部', '日常', '学术', '商务'].map(theme => (
                        <button
                          key={theme}
                          onClick={() => setStudyPlan(p => ({ ...p, theme }))}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            studyPlan.theme === theme
                              ? 'bg-sprout-400 text-white'
                              : 'bg-cosmos-700 text-cosmos-400 hover:bg-cosmos-600'
                          }`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={savePlan}
                    className="w-full py-2 bg-cosmos-600 hover:bg-cosmos-500 text-white rounded-lg transition-all"
                  >
                    保存设置
                  </button>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-cosmos-800/30 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cosmos-400">今日计划</span>
                    <span className="text-white">
                      新词 <span className="text-cyan-400 font-bold">{studyPlan.newWords}</span> + 
                      复习 <span className="text-purple-400 font-bold">{studyPlan.reviewWords}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-cosmos-400">词库</span>
                    <span className="text-star-400">{studyPlan.wordType} · {studyPlan.theme}</span>
                  </div>
                </div>
              )}

              {/* 开始学习按钮 */}
              <button
                onClick={startStudy}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 group mb-3"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                开始学习 (传统模式)
              </button>

              {/* FSRS 智能学习按钮 */}
              <Link href="/study-fsrs" className="block mb-3">
                <button className="w-full py-4 bg-gradient-to-r from-sprout-500 to-star-500 hover:from-sprout-400 hover:to-star-400 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 group">
                  <Brain className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  智能学习 (FSRS)
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                </button>
              </Link>

              {/* 成长星图入口 */}
              <Link href="/growth-starmap" className="block">
                <button className="w-full py-3 bg-gradient-to-r from-star-500/20 to-purple-500/20 hover:from-star-500/30 hover:to-purple-500/30 border border-star-400/30 hover:border-star-400/50 text-star-400 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group">
                  <Star className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  查看成长星图
                  <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </Link>
            </Card>
          </div>

          {/* 右侧列 - 星图和新模块 */}
          <div className="lg:col-span-1 space-y-6">
            <StarMap achievements={achievements} width={400} height={300} />

            {learningPath && (
              <RecommendedLessons
                lessons={learningPath.recommendedNext.slice(0, 2)}
                onStartLesson={handleStartLesson}
              />
            )}
          </div>
        </div>

        {/* 新增模块区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* AI 智能助手 */}
          <div>
            <AIAssistant 
              userId={userData?.id || 'demo'} 
              studyStats={{
                streak: studyStats.streak,
                todayCompleted: studyStats.todayCompleted,
                accuracy: Math.round((studyStats.todayCompleted > 0 ? 85 : 0)), // 模拟准确率
                totalMastered: studyStats.totalMastered
              }}
            />
          </div>

          {/* 学习排行榜 */}
          <div>
            <LeaderBoard 
              userId={userData?.id || 'demo'}
              currentUserStats={{
                streak: studyStats.streak,
                todayCompleted: studyStats.todayCompleted,
                accuracy: Math.round((studyStats.todayCompleted > 0 ? 85 : 0)), // 模拟准确率
                totalMastered: studyStats.totalMastered
              }}
            />
          </div>
        </div>

        {/* 额外内容模块区域 - 填充圆圈区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 学习目标追踪 */}
          <div>
            <StudyGoals 
              userId={userData?.id || 'demo'} 
              studyStats={{
                streak: studyStats.streak,
                todayCompleted: studyStats.todayCompleted,
                accuracy: Math.round((studyStats.todayCompleted > 0 ? 85 : 0)), // 模拟准确率
                totalMastered: studyStats.totalMastered
              }}
            />
          </div>

          {/* 每日挑战 */}
          <div>
            <DailyChallenge 
              userId={userData?.id || 'demo'}
              studyStats={{
                streak: studyStats.streak,
                todayCompleted: studyStats.todayCompleted,
                accuracy: Math.round((studyStats.todayCompleted > 0 ? 85 : 0)), // 模拟准确率
                totalMastered: studyStats.totalMastered
              }}
            />
          </div>
        </div>

        {/* 快捷操作区 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-8">
          <Link href="/growth-starmap" className="group">
            <Card className="p-4 text-center hover:border-star-400/50 transition-all duration-300 group-hover:scale-105 bg-gradient-to-br from-star-500/20 to-yellow-500/20 border-star-400/50">
              <div className="w-12 h-12 bg-star-400/30 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-star-400 animate-pulse" />
              </div>
              <h4 className="font-semibold text-white mb-1">成长星图</h4>
              <p className="text-xs text-cosmos-400">学习数据</p>
            </Card>
          </Link>

          <Link href="/community" className="group">
            <Card className="p-4 text-center hover:border-purple-400/50 transition-all duration-300 group-hover:scale-105 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/30">
              <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="font-semibold text-white mb-1">星光殿堂</h4>
              <p className="text-xs text-cosmos-400">社区交流</p>
            </Card>
          </Link>

          <Link href="/store" className="group">
            <Card className="p-4 text-center hover:border-star-400/50 transition-all duration-300 group-hover:scale-105">
              <div className="w-12 h-12 bg-star-400/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-6 h-6 text-star-400" />
              </div>
              <h4 className="font-semibold text-white mb-1">课程商店</h4>
              <p className="text-xs text-cosmos-400">购买课程</p>
            </Card>
          </Link>

          <Link href="/my-courses" className="group">
            <Card className="p-4 text-center hover:border-sprout-400/50 transition-all duration-300 group-hover:scale-105">
              <div className="w-12 h-12 bg-sprout-400/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-sprout-400" />
              </div>
              <h4 className="font-semibold text-white mb-1">我的课程</h4>
              <p className="text-xs text-cosmos-400">已购课程</p>
            </Card>
          </Link>

          <Link href="/lesson" className="group">
            <Card className="p-4 text-center hover:border-blue-400/50 transition-all duration-300 group-hover:scale-105">
              <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="font-semibold text-white mb-1">免费课程</h4>
              <p className="text-xs text-cosmos-400">系统课程</p>
            </Card>
          </Link>
          
          <Link href="/quiz" className="group">
            <Card className="p-4 text-center hover:border-green-400/50 transition-all duration-300 group-hover:scale-105">
              <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="font-semibold text-white mb-1">练习中心</h4>
              <p className="text-xs text-cosmos-400">互动练习</p>
            </Card>
          </Link>
          
          <Link href="/chat" className="group">
            <Card className="p-4 text-center hover:border-orange-400/50 transition-all duration-300 group-hover:scale-105">
              <div className="w-12 h-12 bg-orange-400/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Rocket className="w-6 h-6 text-orange-400" />
              </div>
              <h4 className="font-semibold text-white mb-1">AI对话</h4>
              <p className="text-xs text-cosmos-400">智能练习</p>
            </Card>
          </Link>
          
          <Link href="/recharge" className="group">
            <Card className="p-4 text-center hover:border-yellow-400/50 transition-all duration-300 group-hover:scale-105">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Coins className="w-6 h-6 text-yellow-400" />
              </div>
              <h4 className="font-semibold text-white mb-1">充值中心</h4>
              <p className="text-xs text-cosmos-400">获取星币</p>
            </Card>
          </Link>
        </div>
        {/* 底部导航提示 */}
        <div className="text-center mt-12 pb-8">
          <p className="text-cosmos-500 text-sm flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            每天学习一点，进步看得见
            <Sparkles className="w-4 h-4" />
          </p>
        </div>
      </div>

      {/* 成长动画 */}
      <GrowthAnimation
        isVisible={showAnimation}
        onComplete={() => setShowAnimation(false)}
        achievementTitle="恭喜！新成就解锁"
      />

      {/* 签到结果弹窗 */}
      {showCheckinResult && checkinResult && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm p-6 animate-fade-in-up text-center">
            {checkinResult.success ? (
              <>
                <div className="w-20 h-20 bg-sprout-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {checkinResult.isHoliday ? (
                    <Sparkles className="w-10 h-10 text-purple-400" />
                  ) : (
                    <Gift className="w-10 h-10 text-sprout-400" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {checkinResult.isHoliday ? '🎊 节日签到成功！' : '✅ 签到成功！'}
                </h3>
                <p className="text-cosmos-300 mb-4">{checkinResult.message}</p>
                <p className="text-sm text-cosmos-400 mb-4">
                  当前余额：<span className="text-star-400 font-bold">{starCoins}</span> 星币
                </p>
                <Button variant="sprout" onClick={() => setShowCheckinResult(false)} className="w-full">
                  太棒了！
                </Button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-cosmos-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-cosmos-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">今日已签到</h3>
                <p className="text-cosmos-300 mb-4">{checkinResult.message}</p>
                <Button variant="cosmos" onClick={() => setShowCheckinResult(false)} className="w-full">
                  知道了
                </Button>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}