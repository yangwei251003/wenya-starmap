'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Award,
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  Crown,
  Flame,
  Grid3X3,
  Library,
  LogOut,
  Newspaper,
  PenLine,
  Play,
  Route,
  ShoppingBag,
  Sparkles,
  Star,
  Target,
  User,
  Users,
  Wallet,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { coreServices, supportServices, type SiteService } from '@/lib/site-services'
import { starCoinService } from '@/lib/star-coin-service'

type UserData = {
  id: string
  username?: string
  level?: string
}

const iconMap = {
  award: Award,
  book: BookOpen,
  bot: Bot,
  brain: Brain,
  check: CheckCircle2,
  library: Library,
  newspaper: Newspaper,
  pen: PenLine,
  route: Route,
  stars: Star,
  store: ShoppingBag,
  user: User,
  users: Users,
  wallet: Wallet,
}

function getTodayKey(userId: string) {
  const today = new Date().toISOString().split('T')[0]
  return `wenya_study_session_${userId}_${today}`
}

function parseStored<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function ServiceCard({ service, featured = false }: { service: SiteService; featured?: boolean }) {
  const Icon = iconMap[service.icon as keyof typeof iconMap] || Sparkles

  return (
    <Link href={service.href} className="group block h-full">
      <Card variant={featured ? 'sprout' : 'cosmos'} className={`h-full p-5 ${featured ? 'min-h-[210px]' : 'min-h-[132px]'}`}>
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#00F5A0]/12 text-[#00F5A0]">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white">{service.title}</h3>
            <p className="mt-2 text-sm leading-6 text-cosmos-300">{service.summary}</p>
          </div>
        </div>
        <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#B9FFE4]">
          {service.action}
          <Sparkles className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </Card>
    </Link>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [starCoins, setStarCoins] = useState(0)
  const [canCheckin, setCanCheckin] = useState(false)
  const [checkinStreak, setCheckinStreak] = useState(0)
  const [todayCompleted, setTodayCompleted] = useState(0)
  const [totalMastered, setTotalMastered] = useState(0)

  const userName = userData?.username || '学习者'

  const quickMetrics = useMemo(
    () => [
      { label: '今日完成', value: `${todayCompleted} 词`, tone: 'text-star-300' },
      { label: '已掌握', value: `${totalMastered}`, tone: 'text-[#00F5A0]' },
      { label: '连续签到', value: `${checkinStreak} 天`, tone: 'text-sky-300' },
      { label: '星币', value: `${starCoins}`, tone: 'text-amber-300' },
    ],
    [todayCompleted, totalMastered, checkinStreak, starCoins]
  )

  const nextStep = useMemo(() => {
    if (!userData) {
      return {
        title: '先登录保存进度',
        summary: '登录后才能同步单词、签到和成长记录。',
        primaryHref: '/auth/login',
        primaryLabel: '去登录',
        secondaryHref: '/services',
        secondaryLabel: '查看服务',
      }
    }

    if (todayCompleted === 0) {
      return {
        title: '先背 10 个词',
        summary: '今天先完成一组新词，系统会自动补上复习与成长记录。',
        primaryHref: '/vocab',
        primaryLabel: '开始背词',
        secondaryHref: '/chat',
        secondaryLabel: '先发问',
      }
    }

    if (canCheckin) {
      return {
        title: '先完成签到',
        summary: '签到能保持连续节奏，也能顺手领取今天的星币奖励。',
        primaryHref: '/dashboard',
        primaryLabel: '立即签到',
        secondaryHref: '/growth-starmap',
        secondaryLabel: '看成长',
      }
    }

    if (todayCompleted < 20) {
      return {
        title: '继续补完今日目标',
        summary: '再学一组词，今天的学习记录就会更完整。',
        primaryHref: '/vocab',
        primaryLabel: '继续背词',
        secondaryHref: '/growth-starmap',
        secondaryLabel: '看成长',
      }
    }

    return {
      title: '去看成长星图',
      summary: '今天已经有学习记录了，下一步适合看看进步和遗忘曲线。',
      primaryHref: '/growth-starmap',
      primaryLabel: '查看星图',
      secondaryHref: '/services',
      secondaryLabel: '全部服务',
    }
  }, [userData, todayCompleted, canCheckin])

  const PrimaryStepIcon = nextStep.primaryLabel === '立即签到' ? Crown : Play

  useEffect(() => {
    setMounted(true)
    const storedUser = window.localStorage.getItem('wenya_user')
    const parsedUser = parseStored<UserData | null>(storedUser, null)

    if (!parsedUser?.id) return

    setUserData(parsedUser)
    setStarCoins(starCoinService.getBalance(parsedUser.id))

    const checkinInfo = starCoinService.getCheckinInfo(parsedUser.id)
    setCanCheckin(checkinInfo.canCheckin)
    setCheckinStreak(checkinInfo.streak)

    const session = parseStored<any>(window.localStorage.getItem(getTodayKey(parsedUser.id)), {})
    setTodayCompleted(Number(session.totalWords || 0))

    const words = parseStored<any[]>(window.localStorage.getItem(`wenya_user_words_${parsedUser.id}`), [])
    setTotalMastered(words.filter((item) => item?.interval >= 7).length)
  }, [])

  const handleLogout = () => {
    window.localStorage.removeItem('wenya_user')
    router.push('/')
  }

  const handleCheckin = () => {
    if (!userData) return
    const result = starCoinService.dailyCheckin(userData.id)
    if (result.success) {
      setStarCoins(starCoinService.getBalance(userData.id))
      setCanCheckin(false)
      setCheckinStreak(result.streak)
    }
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F19]">
        <div className="h-14 w-14 rounded-full border border-[#00F5A0]/40 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0B0F19]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#00F5A0]/25 bg-white/5 text-[#00F5A0] shadow-[0_0_20px_rgba(0,245,160,0.18)] transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-cosmos-400">Wenya Star-Map</div>
              <div className="text-lg font-semibold text-white">学习控制台</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/services">
              <Button variant="cosmos" size="sm" className="gap-2">
                <Grid3X3 className="h-4 w-4" />
                全部服务
              </Button>
            </Link>
            {userData ? (
              <button
                onClick={handleLogout}
                className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-cosmos-300 transition hover:border-red-400/40 hover:text-red-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">退出</span>
              </button>
            ) : (
              <Link href="/auth/login">
                <Button variant="star" size="sm">登录</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 md:px-6">
        <section className="mb-6 grid gap-5 lg:grid-cols-[1fr_0.78fr]">
          <Card variant="star" className="p-6">
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-star-100/75">Today Focus</p>
                <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                  {userData ? `欢迎回来，${userName}` : '从一个目标开始学习'}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-cosmos-200">
                  今天只需要先选一个入口：问清楚、记住词、看进度，或者进入课程。其他工具已经收进辅助服务区。
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/chat">
                  <Button variant="sprout" className="gap-2">
                    <Bot className="h-4 w-4" />
                    先发问
                  </Button>
                </Link>
                <Link href="/vocab">
                  <Button variant="star" className="gap-2">
                    <Play className="h-4 w-4" />
                    背单词
                  </Button>
                </Link>
                {userData ? (
                  <Button variant="cosmos" onClick={handleCheckin} disabled={!canCheckin} className="gap-2">
                    <Crown className="h-4 w-4" />
                    {canCheckin ? '签到' : '已签到'}
                  </Button>
                ) : (
                  <Link href="/auth/register">
                    <Button variant="cosmos" className="gap-2">
                      <Crown className="h-4 w-4" />
                      注册保存进度
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cosmos-500">Progress</p>
                <h2 className="mt-2 text-xl font-semibold text-white">今日状态</h2>
              </div>
              <Target className="h-5 w-5 text-[#00F5A0]" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {quickMetrics.map((metric) => (
                <div key={metric.label} className="rounded-lg border border-white/8 bg-white/5 p-4">
                  <p className="text-xs text-cosmos-400">{metric.label}</p>
                  <p className={`mt-2 text-xl font-semibold ${metric.tone}`}>{metric.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mb-7">
          <Card className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.28em] text-cosmos-500">Next Step</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{nextStep.title}</h2>
                <p className="mt-3 text-sm leading-6 text-cosmos-300">{nextStep.summary}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {nextStep.primaryLabel === '立即签到' ? (
                  <Button variant="sprout" onClick={handleCheckin} className="gap-2">
                    <PrimaryStepIcon className="h-4 w-4" />
                    {nextStep.primaryLabel}
                  </Button>
                ) : (
                  <Link href={nextStep.primaryHref}>
                    <Button variant="sprout" className="gap-2">
                      <PrimaryStepIcon className="h-4 w-4" />
                      {nextStep.primaryLabel}
                    </Button>
                  </Link>
                )}
                <Link href={nextStep.secondaryHref}>
                  <Button variant="cosmos" className="gap-2">
                    <Grid3X3 className="h-4 w-4" />
                    {nextStep.secondaryLabel}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </section>

        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cosmos-500">Core Path</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">核心功能</h2>
            </div>
            <p className="hidden max-w-md text-right text-sm text-cosmos-400 md:block">
              这些是网站主流程，分别独立成页，用户不需要在一个页面里找半天。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {coreServices.map((service) => (
              <ServiceCard key={service.href} service={service} featured />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cosmos-500">Need More</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">辅助服务</h2>
            </div>
            <Link href="/services" className="text-sm font-medium text-[#B9FFE4] transition hover:text-[#00F5A0]">
              查看全部
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {supportServices.slice(0, 8).map((service) => (
              <ServiceCard key={service.href} service={service} />
            ))}
          </div>
        </section>

        <Card className="mt-8 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#00F5A0]/12 text-[#00F5A0]">
                <Flame className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-white">推荐路径</h3>
                <p className="text-sm text-cosmos-300">AI 对话提出问题，再背单词巩固，最后去成长星图看变化。</p>
              </div>
            </div>
            <Link href="/growth-starmap">
              <Button variant="outline" className="gap-2">
                <Star className="h-4 w-4" />
                查看成长星图
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  )
}
