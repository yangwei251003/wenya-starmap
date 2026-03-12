'use client'

import React, { useState, useEffect, useRef } from 'react'
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
import { User, Star, Sparkles, Rocket, BookOpen, Target, Trophy, LogOut, Sprout, Coins, Gift, CheckCircle, ShoppingCart, Crown, Users, Brain, Flame, Settings, Play, BarChart3, Bot, Megaphone, Compass, ClipboardCheck } from 'lucide-react'
import Link from 'next/link'
import { starCoinService } from '@/lib/star-coin-service'
import { smartLearningService } from '@/lib/smart-learning-service'
import { AIDiagnosis } from '@/types'

type DashboardTab = 'overview' | 'ai' | 'growth' | 'ecosystem'
type EcosystemSectionKey = 'loop' | 'community' | 'business'

const isValidTab = (tab: string | null): tab is DashboardTab => {
  return tab === 'overview' || tab === 'ai' || tab === 'growth' || tab === 'ecosystem'
}

const ECOSYSTEM_DEMO_ORDER: EcosystemSectionKey[] = ['loop', 'community', 'business']

const ECOSYSTEM_JUDGE_MAPPING: Record<EcosystemSectionKey, { title: string; focus: string; judge: string }> = {
  loop: {
    title: '学习闭环入口',
    focus: '诊断 -> 学习 -> 练习 -> AI反馈',
    judge: '用户体验设计 + 技术实现'
  },
  community: {
    title: '社区与内容生态',
    focus: '内容互动 + 社区活跃 + 评审展示',
    judge: '创意与原创性 + 上线运营能力'
  },
  business: {
    title: '商业转化与运营',
    focus: '课程转化 + 充值体系 + 增长复盘',
    judge: '商业价值与可行性'
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'
  const isWelcome = searchParams.get('welcome') === 'true'
  const tabQuery = searchParams.get('tab')
  
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
  const [activeTab, setActiveTab] = useState<DashboardTab>(isValidTab(tabQuery) ? tabQuery : 'overview')
  const [aiDiagnosis, setAiDiagnosis] = useState<AIDiagnosis | null>(null)
  const [aiDiagnosisLoading, setAiDiagnosisLoading] = useState(false)
  const [activeEcosystemGuide, setActiveEcosystemGuide] = useState<EcosystemSectionKey>('loop')
  const [isEcosystemDemoMode, setIsEcosystemDemoMode] = useState(false)
  const [ecosystemDemoStep, setEcosystemDemoStep] = useState(0)
  const ecosystemSectionRefs = useRef<Record<EcosystemSectionKey, HTMLDivElement | null>>({
    loop: null,
    community: null,
    business: null
  })

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)
      const isSmallScreen = window.innerWidth < 768
      
      if (isMobileDevice || isSmallScreen) {
        // 如果是移动端，重定向到移动端优化页面
        router.push('/mobile-dashboard')
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [router])

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

  useEffect(() => {
    if (isValidTab(tabQuery) && tabQuery !== activeTab) {
      setActiveTab(tabQuery)
    }
  }, [tabQuery, activeTab])

  useEffect(() => {
    if (activeTab !== 'ecosystem' && isEcosystemDemoMode) {
      setIsEcosystemDemoMode(false)
    }
  }, [activeTab, isEcosystemDemoMode])

  useEffect(() => {
    if (!isEcosystemDemoMode || activeTab !== 'ecosystem') return

    let step = 0
    focusEcosystemSection(ECOSYSTEM_DEMO_ORDER[step])
    setEcosystemDemoStep(step)

    const timer = setInterval(() => {
      step += 1
      if (step >= ECOSYSTEM_DEMO_ORDER.length) {
        setIsEcosystemDemoMode(false)
        clearInterval(timer)
        return
      }
      focusEcosystemSection(ECOSYSTEM_DEMO_ORDER[step])
      setEcosystemDemoStep(step)
    }, 2200)

    return () => clearInterval(timer)
  }, [isEcosystemDemoMode, activeTab])

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

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.replace(`/dashboard?${params.toString()}`)
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

  const handleGenerateDiagnosis = async () => {
    if (!userData) return
    setAiDiagnosisLoading(true)
    try {
      const learningData = smartLearningService.getUserLearningData(userData.id)
      const response = await fetch('/api/ai/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          level: userData.level,
          learningData,
          studyStats: {
            streak: studyStats.streak,
            todayCompleted: studyStats.todayCompleted,
            accuracy: Math.round((studyStats.todayCompleted > 0 ? 85 : 0)),
            totalMastered: studyStats.totalMastered
          }
        })
      })
      const data = await response.json()
      if (data?.data) setAiDiagnosis(data.data)
    } catch (error) {
      console.error('AI诊断生成失败:', error)
    } finally {
      setAiDiagnosisLoading(false)
    }
  }

  const focusEcosystemSection = (key: EcosystemSectionKey, useSmoothScroll: boolean = true) => {
    setActiveEcosystemGuide(key)
    const sectionEl = ecosystemSectionRefs.current[key]
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: useSmoothScroll ? 'smooth' : 'auto', block: 'start' })
    }
  }

  const handleStartEcosystemDemo = () => {
    if (activeTab !== 'ecosystem') {
      handleTabChange('ecosystem')
    }
    setIsEcosystemDemoMode(true)
    setEcosystemDemoStep(0)
    focusEcosystemSection(ECOSYSTEM_DEMO_ORDER[0], false)
  }

  const handleStopEcosystemDemo = () => {
    setIsEcosystemDemoMode(false)
  }

  const ecosystemSections = [
    {
      key: 'loop' as EcosystemSectionKey,
      title: '学习闭环入口',
      description: '评审演示建议优先从这里开始：诊断 -> 学习 -> 练习 -> AI反馈。',
      items: [
        {
          href: '/study-fsrs',
          title: '智能学习',
          description: 'FSRS 记忆调度',
          badge: '核心路径',
          icon: Brain,
          iconWrapClass: 'bg-sprout-400/20',
          iconClass: 'text-sprout-300',
          cardClass: 'hover:border-sprout-300/50',
          badgeClass: 'bg-sprout-400/20 text-sprout-300'
        },
        {
          href: '/quiz',
          title: '练习中心',
          description: '闯关与错题解析',
          badge: '能力提升',
          icon: Trophy,
          iconWrapClass: 'bg-green-400/20',
          iconClass: 'text-green-300',
          cardClass: 'hover:border-green-300/50',
          badgeClass: 'bg-green-400/20 text-green-300'
        },
        {
          href: '/chat',
          title: 'AI 对话',
          description: '实时双语陪练',
          badge: '高互动',
          icon: Rocket,
          iconWrapClass: 'bg-orange-400/20',
          iconClass: 'text-orange-300',
          cardClass: 'hover:border-orange-300/50',
          badgeClass: 'bg-orange-400/20 text-orange-300'
        },
        {
          href: '/ai-writing',
          title: 'AI 写作工坊',
          description: '评分 + 纠错 + 改写',
          badge: '冲分功能',
          icon: ClipboardCheck,
          iconWrapClass: 'bg-purple-400/20',
          iconClass: 'text-purple-300',
          cardClass: 'hover:border-purple-300/50',
          badgeClass: 'bg-purple-400/20 text-purple-300'
        },
        {
          href: '/growth-starmap',
          title: '成长星图',
          description: '可视化学习复盘',
          badge: '成果展示',
          icon: Star,
          iconWrapClass: 'bg-star-400/20',
          iconClass: 'text-star-300',
          cardClass: 'hover:border-star-300/50',
          badgeClass: 'bg-star-400/20 text-star-300'
        }
      ]
    },
    {
      key: 'community' as EcosystemSectionKey,
      title: '社区与内容生态',
      description: '围绕课程内容和用户互动构建留存，提升站内活跃度。',
      items: [
        {
          href: '/lesson',
          title: '免费课程',
          description: '系统化入门内容',
          badge: '拉新入口',
          icon: Target,
          iconWrapClass: 'bg-blue-400/20',
          iconClass: 'text-blue-300',
          cardClass: 'hover:border-blue-300/50',
          badgeClass: 'bg-blue-400/20 text-blue-300'
        },
        {
          href: '/my-courses',
          title: '我的课程',
          description: '课程资产管理',
          badge: '留存锚点',
          icon: BookOpen,
          iconWrapClass: 'bg-cyan-400/20',
          iconClass: 'text-cyan-300',
          cardClass: 'hover:border-cyan-300/50',
          badgeClass: 'bg-cyan-400/20 text-cyan-300'
        },
        {
          href: '/community',
          title: '星光殿堂',
          description: '打卡与讨论互动',
          badge: '社交裂变',
          icon: Users,
          iconWrapClass: 'bg-pink-400/20',
          iconClass: 'text-pink-300',
          cardClass: 'hover:border-pink-300/50',
          badgeClass: 'bg-pink-400/20 text-pink-300'
        },
        {
          href: '/competition',
          title: '评审中心',
          description: '评分映射与脚本',
          badge: '答辩专用',
          icon: Compass,
          iconWrapClass: 'bg-indigo-400/20',
          iconClass: 'text-indigo-300',
          cardClass: 'hover:border-indigo-300/50',
          badgeClass: 'bg-indigo-400/20 text-indigo-300'
        }
      ]
    },
    {
      key: 'business' as EcosystemSectionKey,
      title: '商业转化与运营',
      description: '面向商业价值与可行性评分，突出可持续增长闭环。',
      items: [
        {
          href: '/store',
          title: '课程商店',
          description: '课程包与服务组合',
          badge: '核心变现',
          icon: ShoppingCart,
          iconWrapClass: 'bg-star-400/20',
          iconClass: 'text-star-300',
          cardClass: 'hover:border-star-300/50',
          badgeClass: 'bg-star-400/20 text-star-300'
        },
        {
          href: '/recharge',
          title: '充值中心',
          description: '星币与权益获取',
          badge: '支付转化',
          icon: Coins,
          iconWrapClass: 'bg-yellow-400/20',
          iconClass: 'text-yellow-300',
          cardClass: 'hover:border-yellow-300/50',
          badgeClass: 'bg-yellow-400/20 text-yellow-300'
        },
        {
          href: '/dashboard?tab=growth',
          title: '增长运营',
          description: '目标、挑战、榜单',
          badge: '活跃拉升',
          icon: Flame,
          iconWrapClass: 'bg-red-400/20',
          iconClass: 'text-red-300',
          cardClass: 'hover:border-red-300/50',
          badgeClass: 'bg-red-400/20 text-red-300'
        }
      ]
    }
  ]

  const ecosystemMetrics = [
    { label: '7日留存', value: '35%+', color: 'text-sprout-400' },
    { label: 'AI触达率', value: '60%+', color: 'text-star-400' },
    { label: '日均学习时长', value: '18 min', color: 'text-cyan-400' },
    { label: '课程转化率', value: '8-12%', color: 'text-purple-400' }
  ]

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

        {/* 分区导航 */}
        <Card className="mb-8 p-2 bg-cosmos-900/50 border-cosmos-700/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => handleTabChange('overview')}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-sprout-500/30 to-star-500/30 border border-sprout-400/50 text-white'
                  : 'bg-cosmos-800/50 border border-cosmos-700/40 text-cosmos-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              学习总览
            </button>
            <button
              onClick={() => handleTabChange('ai')}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-sprout-500/30 to-star-500/30 border border-sprout-400/50 text-white'
                  : 'bg-cosmos-800/50 border border-cosmos-700/40 text-cosmos-300 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              AI中心
            </button>
            <button
              onClick={() => handleTabChange('growth')}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'growth'
                  ? 'bg-gradient-to-r from-sprout-500/30 to-star-500/30 border border-sprout-400/50 text-white'
                  : 'bg-cosmos-800/50 border border-cosmos-700/40 text-cosmos-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              成长运营
            </button>
            <button
              onClick={() => handleTabChange('ecosystem')}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'ecosystem'
                  ? 'bg-gradient-to-r from-sprout-500/30 to-star-500/30 border border-sprout-400/50 text-white'
                  : 'bg-cosmos-800/50 border border-cosmos-700/40 text-cosmos-300 hover:text-white'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              生态运营
            </button>
          </div>
        </Card>

        {activeTab === 'overview' && (
          <>
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
          </>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6 mb-6">
            <Card className="p-6 bg-gradient-to-r from-purple-500/15 to-blue-500/15 border-purple-400/30">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">AI 学习诊断报告</h3>
                    <p className="text-cosmos-300 text-sm">一键生成优势、薄弱点、7天计划</p>
                  </div>
                </div>
                <div className="md:ml-auto">
                  <Button variant="star" onClick={handleGenerateDiagnosis} disabled={aiDiagnosisLoading}>
                    {aiDiagnosisLoading ? '生成中...' : '生成AI报告'}
                  </Button>
                </div>
              </div>

              {aiDiagnosis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-cosmos-800/40 rounded-lg p-4">
                    <h4 className="text-cosmos-200 font-medium mb-2">优势</h4>
                    <ul className="text-cosmos-300 text-sm space-y-1">{aiDiagnosis.strengths.map((item, idx) => <li key={idx}>• {item}</li>)}</ul>
                  </div>
                  <div className="bg-cosmos-800/40 rounded-lg p-4">
                    <h4 className="text-cosmos-200 font-medium mb-2">薄弱点</h4>
                    <ul className="text-cosmos-300 text-sm space-y-1">{aiDiagnosis.weaknesses.map((item, idx) => <li key={idx}>• {item}</li>)}</ul>
                  </div>
                  <div className="bg-cosmos-800/40 rounded-lg p-4">
                    <h4 className="text-cosmos-200 font-medium mb-2">改进建议</h4>
                    <ul className="text-cosmos-300 text-sm space-y-1">{aiDiagnosis.recommendations.map((item, idx) => <li key={idx}>• {item}</li>)}</ul>
                  </div>
                  <div className="bg-cosmos-800/40 rounded-lg p-4">
                    <h4 className="text-cosmos-200 font-medium mb-2">7天计划</h4>
                    <ul className="text-cosmos-300 text-sm space-y-1">{aiDiagnosis.weekPlan.map((item, idx) => <li key={idx}>• {item}</li>)}</ul>
                  </div>
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIAssistant
                userId={userData?.id || 'demo'}
                diagnosis={aiDiagnosis}
                diagnosisLoading={aiDiagnosisLoading}
                onGenerateDiagnosis={handleGenerateDiagnosis}
                studyStats={{
                  streak: studyStats.streak,
                  todayCompleted: studyStats.todayCompleted,
                  accuracy: Math.round((studyStats.todayCompleted > 0 ? 85 : 0)),
                  totalMastered: studyStats.totalMastered
                }}
              />
              <Card className="p-6">
                <h4 className="text-white text-lg font-semibold mb-4">AI 功能入口</h4>
                <div className="space-y-3">
                  <Link href="/chat" className="block p-3 rounded-lg bg-cosmos-800/60 hover:bg-cosmos-700/70 border border-cosmos-700/40 transition-all">
                    <div className="flex items-center gap-3">
                      <Rocket className="w-5 h-5 text-star-400" />
                      <div>
                        <p className="text-white text-sm font-medium">AI 对话陪练</p>
                        <p className="text-cosmos-400 text-xs">实时双语辅导</p>
                      </div>
                    </div>
                  </Link>
                  <Link href="/ai-writing" className="block p-3 rounded-lg bg-cosmos-800/60 hover:bg-cosmos-700/70 border border-cosmos-700/40 transition-all">
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="w-5 h-5 text-star-400" />
                      <div>
                        <p className="text-white text-sm font-medium">AI 写作工坊</p>
                        <p className="text-cosmos-400 text-xs">评分 + 纠错 + 改写</p>
                      </div>
                    </div>
                  </Link>
                  <Link href="/competition" className="block p-3 rounded-lg bg-cosmos-800/60 hover:bg-cosmos-700/70 border border-cosmos-700/40 transition-all">
                    <div className="flex items-center gap-3">
                      <Compass className="w-5 h-5 text-star-400" />
                      <div>
                        <p className="text-white text-sm font-medium">评审中心</p>
                        <p className="text-cosmos-400 text-xs">评分标准映射与演示脚本</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'growth' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <AIAssistant
                  userId={userData?.id || 'demo'}
                  diagnosis={aiDiagnosis}
                  diagnosisLoading={aiDiagnosisLoading}
                  onGenerateDiagnosis={handleGenerateDiagnosis}
                  studyStats={{
                    streak: studyStats.streak,
                    todayCompleted: studyStats.todayCompleted,
                    accuracy: Math.round((studyStats.todayCompleted > 0 ? 85 : 0)),
                    totalMastered: studyStats.totalMastered
                  }}
                />
              </div>

              <div>
                <LeaderBoard
                  userId={userData?.id || 'demo'}
                  currentUserStats={{
                    streak: studyStats.streak,
                    todayCompleted: studyStats.todayCompleted,
                    accuracy: Math.round((studyStats.todayCompleted > 0 ? 85 : 0)),
                    totalMastered: studyStats.totalMastered
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <StudyGoals
                  userId={userData?.id || 'demo'}
                  studyStats={{
                    streak: studyStats.streak,
                    todayCompleted: studyStats.todayCompleted,
                    accuracy: Math.round((studyStats.todayCompleted > 0 ? 85 : 0)),
                    totalMastered: studyStats.totalMastered
                  }}
                />
              </div>

              <div>
                <DailyChallenge
                  userId={userData?.id || 'demo'}
                  studyStats={{
                    streak: studyStats.streak,
                    todayCompleted: studyStats.todayCompleted,
                    accuracy: Math.round((studyStats.todayCompleted > 0 ? 85 : 0)),
                    totalMastered: studyStats.totalMastered
                  }}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'ecosystem' && (
          <div className="space-y-6 mb-6">
            <Card className="p-6 bg-gradient-to-r from-star-500/15 via-purple-500/10 to-cyan-500/10 border-star-400/35">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-white text-2xl font-semibold mb-2">生态运营工作台</h3>
                  <p className="text-cosmos-200">
                    拆分为「学习闭环、社区内容、商业转化」三层结构，降低认知负担并直连赛事评分维度。
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="star"
                    onClick={isEcosystemDemoMode ? handleStopEcosystemDemo : handleStartEcosystemDemo}
                    className="text-sm"
                  >
                    {isEcosystemDemoMode ? '停止演示模式' : '一键演示模式'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 min-w-[260px]">
                  <div className="rounded-lg bg-cosmos-800/60 border border-cosmos-700/50 px-3 py-2 text-xs text-cosmos-300">评审命中：商业价值</div>
                  <div className="rounded-lg bg-cosmos-800/60 border border-cosmos-700/50 px-3 py-2 text-xs text-cosmos-300">评审命中：上线运营</div>
                  <div className="rounded-lg bg-cosmos-800/60 border border-cosmos-700/50 px-3 py-2 text-xs text-cosmos-300">当前星币：<span className="text-star-300 font-semibold">{starCoins}</span></div>
                  <div className="rounded-lg bg-cosmos-800/60 border border-cosmos-700/50 px-3 py-2 text-xs text-cosmos-300">演示路径：先闭环后转化</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {ECOSYSTEM_DEMO_ORDER.map((key, index) => (
                  <button
                    key={key}
                    onClick={() => focusEcosystemSection(key)}
                    className={`px-3 py-2 rounded-lg text-xs border transition-all ${
                      activeEcosystemGuide === key
                        ? 'bg-star-400/20 border-star-300/60 text-star-200'
                        : 'bg-cosmos-800/50 border-cosmos-700/50 text-cosmos-300 hover:text-white'
                    }`}
                  >
                    {index + 1}. {ECOSYSTEM_JUDGE_MAPPING[key].title}
                  </button>
                ))}
              </div>

              <div className="rounded-lg bg-cosmos-900/60 border border-cosmos-700/50 px-4 py-3">
                <p className="text-xs text-cosmos-300">
                  {isEcosystemDemoMode ? '演示进行中：' : '当前引导：'}
                  <span className="text-star-300 font-semibold ml-1">
                    {ECOSYSTEM_JUDGE_MAPPING[activeEcosystemGuide].title}
                  </span>
                  {isEcosystemDemoMode && (
                    <span className="ml-2 text-cosmos-400">
                      （步骤 {ecosystemDemoStep + 1}/{ECOSYSTEM_DEMO_ORDER.length}）
                    </span>
                  )}
                </p>
                <p className="text-xs text-cosmos-400 mt-1">
                  核心路径：{ECOSYSTEM_JUDGE_MAPPING[activeEcosystemGuide].focus} ｜ 对应评分：{ECOSYSTEM_JUDGE_MAPPING[activeEcosystemGuide].judge}
                </p>
              </div>
            </Card>

            {ecosystemSections.map((section) => (
              <div
                key={section.title}
                ref={(el) => {
                  ecosystemSectionRefs.current[section.key] = el
                }}
                className={`scroll-mt-28 transition-all duration-500 ${
                  activeEcosystemGuide === section.key
                    ? 'rounded-2xl ring-2 ring-star-300/45 shadow-[0_0_24px_rgba(251,191,36,0.2)]'
                    : ''
                }`}
              >
                <Card className={`p-6 bg-cosmos-900/55 border-cosmos-700/45 transition-all duration-500 ${
                  activeEcosystemGuide === section.key ? 'border-star-300/60 bg-star-500/5' : ''
                }`}>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-4">
                  <div>
                    <h4 className="text-white text-lg font-semibold flex items-center gap-2">
                      {section.title}
                      {activeEcosystemGuide === section.key && (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-star-400/20 text-star-300 animate-pulse">
                          当前高亮
                        </span>
                      )}
                    </h4>
                    <p className="text-cosmos-300 text-sm mt-1">{section.description}</p>
                  </div>
                  <span className="text-xs text-cosmos-400">共 {section.items.length} 个关键入口</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link key={item.href + item.title} href={item.href} className="group">
                        <Card className={`h-full p-4 bg-cosmos-900/50 border-cosmos-700/50 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg ${item.cardClass}`}>
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${item.iconWrapClass}`}>
                            <Icon className={`w-5 h-5 ${item.iconClass}`} />
                          </div>
                          <h5 className="text-white font-medium mb-1">{item.title}</h5>
                          <p className="text-cosmos-400 text-xs">{item.description}</p>
                          <span className={`inline-flex mt-3 px-2 py-1 rounded-full text-[11px] ${item.badgeClass}`}>
                            {item.badge}
                          </span>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
                </Card>
              </div>
            ))}

            <Card className="p-6 bg-cosmos-900/60 border-cosmos-700/45">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white text-lg font-semibold">运营指标看板（演示目标）</h4>
                <Link href="/competition" className="text-sm text-star-300 hover:text-star-200 transition-colors">
                  查看完整评审映射
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ecosystemMetrics.map((metric) => (
                  <div key={metric.label} className="p-4 rounded-lg bg-cosmos-800/70 border border-cosmos-700/50">
                    <div className="text-cosmos-400 text-xs mb-1">{metric.label}</div>
                    <div className={`text-xl font-bold ${metric.color}`}>{metric.value}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 底部导航提示 */}
        <div className="text-center mt-12 pb-8">
          <p className="text-cosmos-500 text-sm flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            四分区工作台已启用，学习路径更清晰
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
