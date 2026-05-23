'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  CheckCircle,
  Compass,
  Crown,
  Flame,
  Gift,
  LogOut,
  Mic,
  MoonStar,
  Play,
  Rocket,
  Sparkles,
  Star,
  Target,
  Wand2,
} from 'lucide-react'

import { useDashboard } from '@/hooks/useDashboard'
import AIAssistant from '@/components/dashboard/AIAssistant'
import DailyChallenge from '@/components/dashboard/DailyChallenge'
import { GrowthAnimation } from '@/components/dashboard/GrowthAnimation'
import LeaderBoard from '@/components/dashboard/LeaderBoard'
import { RecommendedLessons } from '@/components/dashboard/RecommendedLessons'
import StudyGoals from '@/components/dashboard/StudyGoals'
import { StarMap } from '@/components/dashboard/StarMap'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { starCoinService } from '@/lib/star-coin-service'
import { smartLearningService } from '@/lib/smart-learning-service'
import { AIDiagnosis } from '@/types'

type DashboardTab = 'overview' | 'ai' | 'growth' | 'ecosystem'

type EcosystemSectionKey = 'loop' | 'community' | 'business'

const isValidTab = (tab: string | null): tab is DashboardTab =>
  tab === 'overview' || tab === 'ai' || tab === 'growth' || tab === 'ecosystem'

const tabMeta: Array<{
  key: DashboardTab
  label: string
  hint: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: 'overview', label: '今日路径', hint: '发问与学习入口', icon: MoonStar },
  { key: 'ai', label: 'NovaSprout', hint: '语音与诊断', icon: Bot },
  { key: 'growth', label: '语言星座', hint: '成长与目标', icon: Star },
  { key: 'ecosystem', label: '生态入口', hint: '功能航线', icon: Compass },
]

const ecosystemOrder: EcosystemSectionKey[] = ['loop', 'community', 'business']

const ecosystemCopy: Record<EcosystemSectionKey, { title: string; focus: string; judge: string }> = {
  loop: {
    title: '发问闭环',
    focus: '诊断 -> 学习 -> 练习 -> 反馈',
    judge: '体验完整度',
  },
  community: {
    title: '内容与陪伴',
    focus: '课程内容 + 社区互动 + 日常留存',
    judge: '内容运营能力',
  },
  business: {
    title: '燃料与转化',
    focus: '权益补给 + 课程购买 + 续费路径',
    judge: '商业闭环',
  },
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefersReducedMotion = useReducedMotion()
  const tabQuery = searchParams.get('tab')
  const isWelcome = searchParams.get('welcome') === 'true'

  const { learningPath, achievements, isLoading, error, refreshData } = useDashboard()

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
    theme: '全部',
  })
  const [showPlanConfig, setShowPlanConfig] = useState(false)
  const [studyStats, setStudyStats] = useState({ streak: 0, todayCompleted: 0, totalMastered: 0 })
  const [activeTab, setActiveTab] = useState<DashboardTab>(isValidTab(tabQuery) ? tabQuery : 'overview')
  const [aiDiagnosis, setAiDiagnosis] = useState<AIDiagnosis | null>(null)
  const [aiDiagnosisLoading, setAiDiagnosisLoading] = useState(false)
  const [activeEcosystemGuide, setActiveEcosystemGuide] = useState<EcosystemSectionKey>('loop')
  const [isEcosystemDemoMode, setIsEcosystemDemoMode] = useState(false)
  const [ecosystemDemoStep, setEcosystemDemoStep] = useState(0)
  const [showAnimation, setShowAnimation] = useState(isWelcome)

  const ecosystemSectionRefs = useRef<Record<EcosystemSectionKey, HTMLDivElement | null>>({
    loop: null,
    community: null,
    business: null,
  })

  useEffect(() => {
    const storedUser = localStorage.getItem('wenya_user')
    if (!storedUser) return

    const user = JSON.parse(storedUser)
    setUserData(user)
    setStarCoins(starCoinService.getBalance(user.id))

    const checkinInfo = starCoinService.getCheckinInfo(user.id)
    setCanCheckin(checkinInfo.canCheckin)
    setCheckinStreak(checkinInfo.streak)

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
      totalMastered = words.filter((item: any) => item.interval >= 7).length
    }

    for (let index = 0; index < 365; index += 1) {
      const date = new Date()
      date.setDate(date.getDate() - index)
      const dateStr = date.toISOString().split('T')[0]
      const daySession = localStorage.getItem(`wenya_study_session_${user.id}_${dateStr}`)
      if (daySession) {
        const dayData = JSON.parse(daySession)
        if (dayData.totalWords > 0) {
          streak += 1
        } else {
          break
        }
      } else if (index > 0) {
        break
      }
    }

    setStudyStats({ streak, todayCompleted, totalMastered })

    const savedPlan = localStorage.getItem(`wenya_study_plan_${user.id}`)
    if (savedPlan) {
      setStudyPlan(JSON.parse(savedPlan))
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
    focusEcosystemSection(ecosystemOrder[step])
    setEcosystemDemoStep(step)

    const timer = window.setInterval(() => {
      step += 1
      if (step >= ecosystemOrder.length) {
        setIsEcosystemDemoMode(false)
        window.clearInterval(timer)
        return
      }

      focusEcosystemSection(ecosystemOrder[step])
      setEcosystemDemoStep(step)
    }, 2200)

    return () => window.clearInterval(timer)
  }, [isEcosystemDemoMode, activeTab])

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.replace(`/dashboard?${params.toString()}`)
  }

  const handleLogout = () => {
    localStorage.removeItem('wenya_user')
    router.push('/')
  }

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

  const startStudy = () => {
    if (!userData) return
    localStorage.setItem(`wenya_study_plan_${userData.id}`, JSON.stringify(studyPlan))
    router.push('/study')
  }

  const savePlan = () => {
    if (!userData) return
    localStorage.setItem(`wenya_study_plan_${userData.id}`, JSON.stringify(studyPlan))
    setShowPlanConfig(false)
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
            accuracy: Math.round(studyStats.todayCompleted > 0 ? 85 : 0),
            totalMastered: studyStats.totalMastered,
          },
        }),
      })

      const data = await response.json()
      if (data?.data) setAiDiagnosis(data.data)
    } catch (diagnosisError) {
      console.error('AI诊断生成失败:', diagnosisError)
    } finally {
      setAiDiagnosisLoading(false)
    }
  }

  const focusEcosystemSection = (key: EcosystemSectionKey, useSmoothScroll = true) => {
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
    focusEcosystemSection(ecosystemOrder[0], false)
  }

  const handleStopEcosystemDemo = () => {
    setIsEcosystemDemoMode(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full border border-[#00F5A0]/40 border-t-transparent animate-spin" />
          <p className="text-cosmos-300">正在点亮路径...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <p className="mb-4 text-red-300">{error}</p>
          <Button onClick={refreshData}>重新发问</Button>
        </Card>
      </div>
    )
  }

  const pathSteps = [
    {
      title: '先发问',
      description: '把今日最想弄懂的一个问题放到起点。',
      href: '/chat',
      cta: '开启对话',
      icon: Mic,
    },
    {
      title: '再萌芽',
      description: '进入课程与练习，让理解长出新的分支。',
      href: '/study-fsrs',
      cta: '进入学习',
      icon: BookOpen,
    },
    {
      title: '再点亮',
      description: '去语言星图里看见已经照亮的路径。',
      href: '/growth-starmap',
      cta: '查看星图',
      icon: Star,
    },
  ]

  const quickMetrics = [
    { label: '连续发问', value: `${studyStats.streak} 天`, tone: 'text-[#00F5A0]' },
    { label: '今日完成', value: `${studyStats.todayCompleted} 词`, tone: 'text-star-300' },
    { label: '已掌握', value: `${studyStats.totalMastered}`, tone: 'text-cyan-300' },
    { label: '星币', value: `${starCoins}`, tone: 'text-amber-300' },
  ]

  const ecosystemMetrics = [
    { label: '7日留存', value: '35%+', color: 'text-sprout-400' },
    { label: 'AI触达率', value: '60%+', color: 'text-star-300' },
    { label: '日均学习时长', value: '18 min', color: 'text-cyan-300' },
    { label: '转化率', value: '8-12%', color: 'text-purple-300' },
  ]

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <div className="sticky top-0 z-40 border-b border-white/8 bg-[#0B0F19]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#00F5A0]/25 bg-white/5 text-[#00F5A0] shadow-[0_0_20px_rgba(0,245,160,0.18)] transition-transform duration-300 group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm uppercase tracking-[0.22em] text-cosmos-400">Wenya Star-Map</div>
              <div className="text-lg font-semibold text-white">问芽星图</div>
            </div>
          </Link>

          <div className="hidden gap-2 rounded-full border border-white/8 bg-white/5 p-1 md:flex">
            {tabMeta.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.key

              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all ${
                    active
                      ? 'bg-[#00F5A0]/15 text-[#B9FFE4] shadow-[0_0_18px_rgba(0,245,160,0.12)]'
                      : 'text-cosmos-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            {userData && (
              <>
                <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-sm text-cosmos-300 sm:flex">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00F5A0]/15 text-[#00F5A0]">
                    <Crown className="h-4 w-4" />
                  </div>
                  {userData.username}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-sm text-cosmos-300 transition-all hover:border-red-400/40 hover:text-red-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">退出</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        {userData && (
          <motion.section
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"
          >
            <Card className="p-6">
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.28em] text-cosmos-400">今日发问路径</p>
                    <h1 className="text-3xl font-semibold text-white md:text-4xl">欢迎回来，{userData.username}</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-cosmos-300 md:text-base">
                      从一个问题开始，让理解慢慢发芽。先发问，再学习，再把已经点亮的语言路径串成星座。
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href="/chat">
                      <Button className="gap-2">
                        <Mic className="h-4 w-4" />
                        发问
                      </Button>
                    </Link>
                    <Button variant="cosmos" onClick={handleCheckin} disabled={!canCheckin} className="gap-2">
                      <Gift className="h-4 w-4" />
                      {canCheckin ? '今日签到' : '已签到'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {quickMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                      <p className="text-xs text-cosmos-400">{metric.label}</p>
                      <p className={`mt-1 text-lg font-semibold ${metric.tone}`}>{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cosmos-400">NovaSprout 指引</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">让 AI 语音像星光一样回应你</h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00F5A0]/12 text-[#00F5A0]">
                  <Wand2 className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-cosmos-300">
                下一步可以直接进入对话，或者先生成学习诊断，让 NovaSprout 带着你沿着最短路径继续点亮星图。
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link href="/chat" className="block">
                  <div className="rounded-2xl border border-[#00F5A0]/20 bg-[#00F5A0]/8 p-4 transition-all hover:-translate-y-0.5 hover:border-[#00F5A0]/35">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00F5A0]/12 text-[#00F5A0]">
                        <Mic className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">发起对话</p>
                        <p className="text-xs text-cosmos-400">让问题先长出来</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={handleGenerateDiagnosis}
                  className="rounded-2xl border border-white/8 bg-white/5 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/15"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-star-400/12 text-star-300">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {aiDiagnosisLoading ? '正在点亮路径...' : '生成指引'}
                      </p>
                      <p className="text-xs text-cosmos-400">AI 诊断与下一步建议</p>
                    </div>
                  </div>
                </button>
              </div>
            </Card>
          </motion.section>
        )}

        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-cosmos-400">今日发问路径</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">从问题出发，把学习变成一条可见的光路</h2>
                  </div>
                  <Link href="/growth-starmap" className="text-sm text-[#B9FFE4] transition-colors hover:text-[#00F5A0]">
                    查看完整星图
                  </Link>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {pathSteps.map((step, index) => {
                    const Icon = step.icon
                    return (
                      <motion.div
                        key={step.title}
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: index * 0.08 }}
                        className="rounded-2xl border border-white/8 bg-white/5 p-4"
                      >
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00F5A0]/10 text-[#00F5A0]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                        <p className="mt-2 min-h-[3rem] text-sm leading-6 text-cosmos-300">{step.description}</p>
                        <Link href={step.href} className="mt-4 inline-flex items-center gap-2 text-sm text-[#B9FFE4] hover:text-[#00F5A0]">
                          {step.cta}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-cosmos-400">语言星座</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">把已完成的学习节点，连成一张会发光的地图</h2>
                  </div>
                  <div className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-cosmos-300">
                    {achievements.length} 个已点亮节点
                  </div>
                </div>
                <div className="mt-5 overflow-hidden rounded-3xl border border-white/8 bg-[#050810]">
                  <StarMap achievements={achievements} width={720} height={420} />
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-cosmos-400">学习节律</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">今天这颗星正在怎么长</h3>
                  </div>
                  <BarChart3 className="h-5 w-5 text-[#00F5A0]" />
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    { label: '连续天数', value: `${studyStats.streak} 天` },
                    { label: '今日完成', value: `${studyStats.todayCompleted} 词` },
                    { label: '累计掌握', value: `${studyStats.totalMastered}` },
                    { label: '星币余额', value: `${starCoins}` },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                      <span className="text-sm text-cosmos-300">{item.label}</span>
                      <span className="text-sm font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {learningPath && (
                <RecommendedLessons lessons={learningPath.recommendedNext.slice(0, 2)} onStartLesson={(lessonId) => router.push(`/lesson/${lessonId}`)} />
              )}

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-star-400/10 text-star-300">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">今日提醒</h3>
                    <p className="text-sm text-cosmos-300">
                      {canCheckin ? '可以进行一次签到，把今天的学习也纳入星图。' : `你已经完成签到，连续领取了 ${checkinStreak} 天。`}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="star" onClick={startStudy} className="gap-2">
                    <Play className="h-4 w-4" />
                    开始学习
                  </Button>
                  <Button variant="cosmos" onClick={() => handleTabChange('ai')} className="gap-2">
                    <Wand2 className="h-4 w-4" />
                    看 NovaSprout
                  </Button>
                  <Button variant="cosmos" onClick={() => setShowPlanConfig(true)} className="gap-2">
                    <Target className="h-4 w-4" />
                    调整计划
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cosmos-400">NovaSprout 指引</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">用声音、节奏和诊断，让 AI 像一株会回应的星光种子</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-cosmos-300">
                    这一页保留 AI 能力，但把语境换成“发问、萌芽、指路”。你可以直接生成诊断，也可以继续进入语音对话。
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="star" onClick={handleGenerateDiagnosis} disabled={aiDiagnosisLoading} className="gap-2">
                    <Bot className="h-4 w-4" />
                    {aiDiagnosisLoading ? '正在生成...' : '生成指引'}
                  </Button>
                  <Link href="/chat">
                    <Button variant="cosmos" className="gap-2">
                      <Mic className="h-4 w-4" />
                      进入对话
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  '先说出一个你最想弄懂的句子。',
                  '让 NovaSprout 把它拆成可执行的学习路径。',
                  '在语音里继续追问，直到理解真正长出来。',
                ].map((item, index) => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-[#00F5A0]/10 text-sm font-semibold text-[#00F5A0]">
                      0{index + 1}
                    </div>
                    <p className="text-sm leading-6 text-cosmos-200">{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <AIAssistant
                userId={userData?.id || 'demo'}
                diagnosis={aiDiagnosis}
                diagnosisLoading={aiDiagnosisLoading}
                onGenerateDiagnosis={handleGenerateDiagnosis}
                studyStats={{
                  streak: studyStats.streak,
                  todayCompleted: studyStats.todayCompleted,
                  accuracy: Math.round(studyStats.todayCompleted > 0 ? 85 : 0),
                  totalMastered: studyStats.totalMastered,
                }}
              />

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-cosmos-400">语音入口</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">让问题自己开口</h3>
                  </div>
                  <Mic className="h-5 w-5 text-[#00F5A0]" />
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    { href: '/chat', title: 'AI 对话陪练', desc: '把句子问清楚', icon: Rocket },
                    { href: '/ai-writing', title: 'AI 写作工坊', desc: '让表达破土', icon: Wand2 },
                    { href: '/competition', title: '评审中心', desc: '保留演示映射', icon: Compass },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <Link key={item.href} href={item.href} className="block rounded-2xl border border-white/8 bg-white/5 p-4 transition-all hover:-translate-y-0.5 hover:border-[#00F5A0]/20">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00F5A0]/10 text-[#00F5A0]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{item.title}</p>
                            <p className="text-xs text-cosmos-400">{item.desc}</p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {aiDiagnosis && (
                  <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4">
                    <p className="mb-3 text-sm font-medium text-white">最新指引</p>
                    <div className="space-y-2 text-sm text-cosmos-300">
                      <p>优势：{aiDiagnosis.strengths[0] ?? '继续保持稳定输入，路径会更清楚。'}</p>
                      <p>薄弱：{aiDiagnosis.weaknesses[0] ?? '下一次把问题说得更具体一点。'}</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'growth' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cosmos-400">语言星座</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">把成长拆成能被看见、能被继续点亮的节点</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="star" onClick={handleGenerateDiagnosis} disabled={aiDiagnosisLoading} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    生成今日星光
                  </Button>
                  <Button variant="cosmos" onClick={() => handleTabChange('overview')} className="gap-2">
                    <Target className="h-4 w-4" />
                    返回路径
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <AIAssistant
                userId={userData?.id || 'demo'}
                diagnosis={aiDiagnosis}
                diagnosisLoading={aiDiagnosisLoading}
                onGenerateDiagnosis={handleGenerateDiagnosis}
                studyStats={{
                  streak: studyStats.streak,
                  todayCompleted: studyStats.todayCompleted,
                  accuracy: Math.round(studyStats.todayCompleted > 0 ? 85 : 0),
                  totalMastered: studyStats.totalMastered,
                }}
              />

              <LeaderBoard
                userId={userData?.id || 'demo'}
                currentUserStats={{
                  streak: studyStats.streak,
                  todayCompleted: studyStats.todayCompleted,
                  accuracy: Math.round(studyStats.todayCompleted > 0 ? 85 : 0),
                  totalMastered: studyStats.totalMastered,
                }}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <StudyGoals
                userId={userData?.id || 'demo'}
                studyStats={{
                  streak: studyStats.streak,
                  todayCompleted: studyStats.todayCompleted,
                  accuracy: Math.round(studyStats.todayCompleted > 0 ? 85 : 0),
                  totalMastered: studyStats.totalMastered,
                }}
              />

              <DailyChallenge
                userId={userData?.id || 'demo'}
                studyStats={{
                  streak: studyStats.streak,
                  todayCompleted: studyStats.todayCompleted,
                  accuracy: Math.round(studyStats.todayCompleted > 0 ? 85 : 0),
                  totalMastered: studyStats.totalMastered,
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'ecosystem' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cosmos-400">生态入口</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">保留完整功能，但把语言改得更像产品而不是答辩稿</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-cosmos-300">
                    这一层仍然承接课程、社区和转化，只是把呈现方式从展示面板收敛成更克制的工作台。
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="star"
                    onClick={isEcosystemDemoMode ? handleStopEcosystemDemo : handleStartEcosystemDemo}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {isEcosystemDemoMode ? '停止巡航' : '一键巡航'}
                  </Button>
                  <Link href="/competition">
                    <Button variant="cosmos" className="gap-2">
                      <Compass className="h-4 w-4" />
                      评审映射
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {ecosystemMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                    <p className="text-xs text-cosmos-400">{metric.label}</p>
                    <p className={`mt-1 text-lg font-semibold ${metric.color}`}>{metric.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-5">
              {ecosystemOrder.map((key, index) => (
                <div
                  key={key}
                  ref={(element) => {
                    ecosystemSectionRefs.current[key] = element
                  }}
                  className={`scroll-mt-28 rounded-3xl border p-0 transition-all ${
                    activeEcosystemGuide === key
                      ? 'border-[#00F5A0]/35 shadow-[0_0_24px_rgba(0,245,160,0.12)]'
                      : 'border-white/8'
                  }`}
                >
                  <Card className="p-6">
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{index + 1}. {ecosystemCopy[key].title}</h3>
                          {activeEcosystemGuide === key && (
                            <span className="rounded-full bg-[#00F5A0]/12 px-2 py-1 text-[11px] text-[#B9FFE4]">
                              当前高亮
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-cosmos-300">{ecosystemCopy[key].focus}</p>
                      </div>
                      <div className="text-xs text-cosmos-400">对应维度：{ecosystemCopy[key].judge}</div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {(
                        {
                          loop: [
                            { href: '/study-fsrs', title: '智能学习', desc: '把记忆调度做成日常路径', badge: '核心路径' },
                            { href: '/quiz', title: '练习中心', desc: '继续巩固和回响', badge: '能力提升' },
                            { href: '/chat', title: 'AI 对话', desc: '实时双语陪练', badge: '高互动' },
                            { href: '/growth-starmap', title: '成长星图', desc: '学习成果可视化', badge: '成果展示' },
                          ],
                          community: [
                            { href: '/lesson', title: '免费课程', desc: '系统化入门内容', badge: '拉新入口' },
                            { href: '/my-courses', title: '我的课程', desc: '课程资产管理', badge: '留存锚点' },
                            { href: '/community', title: '星光殿堂', desc: '打卡与讨论互动', badge: '社交裂变' },
                            { href: '/competition', title: '评审中心', desc: '评分映射与脚本', badge: '演示入口' },
                          ],
                          business: [
                            { href: '/store', title: '课程商店', desc: '课程包与服务组合', badge: '核心变现' },
                            { href: '/recharge', title: '星图补给', desc: '星币与权益获取', badge: '支付转化' },
                            { href: '/dashboard?tab=growth', title: '增长运营', desc: '目标、挑战、榜单', badge: '活跃拉升' },
                          ],
                        }[key]
                      ).map((item) => (
                        <Link key={item.href} href={item.href} className="group block rounded-2xl border border-white/8 bg-white/5 p-4 transition-all hover:-translate-y-0.5 hover:border-[#00F5A0]/25">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00F5A0]/10 text-[#00F5A0]">
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                          </div>
                          <p className="mt-3 text-sm font-medium text-white">{item.title}</p>
                          <p className="mt-1 text-xs text-cosmos-400">{item.desc}</p>
                          <span className="mt-3 inline-flex rounded-full bg-white/5 px-2 py-1 text-[11px] text-cosmos-300">
                            {item.badge}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pb-8 pt-12 text-center">
          <p className="inline-flex items-center gap-2 text-sm text-cosmos-400">
            <Sparkles className="h-4 w-4" />
            发问、萌芽、点亮路径
            <Sparkles className="h-4 w-4" />
          </p>
        </div>
      </main>

      <GrowthAnimation
        isVisible={showAnimation}
        onComplete={() => setShowAnimation(false)}
        achievementTitle="恭喜！新星点亮"
      />

      {showCheckinResult && checkinResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Card className="w-full max-w-sm p-6 text-center">
            {checkinResult.success ? (
              <>
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#00F5A0]/10">
                  {checkinResult.isHoliday ? <Sparkles className="h-10 w-10 text-purple-300" /> : <Gift className="h-10 w-10 text-[#00F5A0]" />}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  {checkinResult.isHoliday ? '节日签到成功' : '签到成功'}
                </h3>
                <p className="mb-4 text-cosmos-300">{checkinResult.message}</p>
                <p className="mb-4 text-sm text-cosmos-400">
                  当前余额：<span className="font-semibold text-star-300">{starCoins}</span> 星币
                </p>
                <Button variant="sprout" onClick={() => setShowCheckinResult(false)} className="w-full">
                  太棒了
                </Button>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
                  <CheckCircle className="h-10 w-10 text-cosmos-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">今日已签到</h3>
                <p className="mb-4 text-cosmos-300">{checkinResult.message}</p>
                <Button variant="cosmos" onClick={() => setShowCheckinResult(false)} className="w-full">
                  知道了
                </Button>
              </>
            )}
          </Card>
        </div>
      )}

      {showPlanConfig && userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">调整今日路径</h3>
              <button className="text-sm text-cosmos-400" onClick={() => setShowPlanConfig(false)}>
                关闭
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-cosmos-300">
              <p>当前计划：新词 {studyPlan.newWords}，复习 {studyPlan.reviewWords}，词表 {studyPlan.wordType}。</p>
              <p>这个面板先保留，后续再按“萌芽采集器”的语言重新整理。</p>
              <div className="flex gap-3">
                <Button onClick={savePlan}>保存</Button>
                <Button variant="cosmos" onClick={() => setShowPlanConfig(false)}>
                  取消
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
