'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  BookOpen,
  Brain,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Target,
  Rocket,
  Users,
  LineChart,
  ClipboardCheck
} from 'lucide-react'
import { Card } from '@/components/ui/Card'

const scoreDimensions = [
  {
    title: '创意与原创性',
    desc: 'AI诊断 + 错题解析 + 写作工坊构成完整学习闭环。',
    icon: Sparkles,
    color: 'text-star-400'
  },
  {
    title: '用户体验设计',
    desc: '学习流程按任务拆分，降低单页认知负担。',
    icon: Target,
    color: 'text-cyan-400'
  },
  {
    title: '技术实现',
    desc: 'GLM接口与离线演示双模式，保证稳定可展示。',
    icon: ShieldCheck,
    color: 'text-sprout-400'
  },
  {
    title: '商业价值与可行性',
    desc: '课程商店、星币体系、成长激励形成转化路径。',
    icon: LineChart,
    color: 'text-orange-400'
  },
  {
    title: '上线运营能力',
    desc: '内置运营面板、挑战机制、留存指标与行动计划。',
    icon: BarChart3,
    color: 'text-purple-400'
  }
]

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)
      const isSmallScreen = window.innerWidth < 768
      if (isMobileDevice || isSmallScreen) {
        router.push('/mobile')
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [router])

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-50 border-b border-cosmos-700/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent">
            问芽星图
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-cosmos-300">
            <Link href="/competition" className="hover:text-white transition-colors">评审中心</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">学习控制台</Link>
            <Link href="/ai-writing" className="hover:text-white transition-colors">AI写作工坊</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-sprout">登录</Link>
            <Link href="/demo" className="btn-star">体验Demo</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-14 space-y-14">
        <section className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cosmos-800/60 border border-cosmos-600/50 text-cosmos-300 text-sm mb-6">
              <Brain className="w-4 h-4 text-star-400" />
              智慧教育赛道 · AI + Web 前端应用
            </p>
            <h1 className="text-5xl leading-tight font-bold text-white mb-5">
              一个面向比赛评分标准
              <span className="block bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent">可直接演示的英语学习平台</span>
            </h1>
            <p className="text-cosmos-300 text-lg leading-relaxed mb-8">
              当前版本将学习路径、AI诊断、练习反馈、写作批改与运营指标打通，形成完整的智慧教育产品闭环。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard" className="btn-star text-base px-6 py-3 inline-flex items-center gap-2">
                进入学习控制台
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/competition" className="btn-sprout text-base px-6 py-3 inline-flex items-center gap-2">
                打开评审中心
                <ClipboardCheck className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <Card className="p-6 bg-gradient-to-br from-cosmos-800/80 to-cosmos-900/80 border-cosmos-600/40">
            <h2 className="text-white text-xl font-semibold mb-5">核心能力矩阵</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-cosmos-800/60 border border-cosmos-700/50">
                <span className="text-cosmos-300">AI学习诊断</span>
                <span className="text-sprout-400 font-medium">已上线</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-cosmos-800/60 border border-cosmos-700/50">
                <span className="text-cosmos-300">AI错题解析</span>
                <span className="text-sprout-400 font-medium">已上线</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-cosmos-800/60 border border-cosmos-700/50">
                <span className="text-cosmos-300">AI写作批改</span>
                <span className="text-sprout-400 font-medium">已上线</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-cosmos-800/60 border border-cosmos-700/50">
                <span className="text-cosmos-300">运营与商业化展示</span>
                <span className="text-star-400 font-medium">评审模式</span>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">评分维度对齐设计</h2>
            <p className="text-cosmos-300">每个维度都有对应功能和可演示证据。</p>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
            {scoreDimensions.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.title} className="p-5 bg-cosmos-800/40 border-cosmos-700/50 hover:border-cosmos-500/60 transition-all">
                  <Icon className={`w-6 h-6 mb-3 ${item.color}`} />
                  <h3 className="text-white font-semibold mb-2 text-sm">{item.title}</h3>
                  <p className="text-cosmos-300 text-sm leading-relaxed">{item.desc}</p>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2 bg-gradient-to-r from-sprout-500/10 to-blue-500/10 border-sprout-400/30">
            <h3 className="text-white text-2xl font-semibold mb-3">学习闭环流程</h3>
            <p className="text-cosmos-300 mb-5">从诊断到执行再到反馈，路径清晰，适合评审现场快速演示。</p>
            <div className="grid md:grid-cols-4 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-cosmos-800/50 border border-cosmos-700/50">1. AI诊断</div>
              <div className="p-3 rounded-lg bg-cosmos-800/50 border border-cosmos-700/50">2. 任务计划</div>
              <div className="p-3 rounded-lg bg-cosmos-800/50 border border-cosmos-700/50">3. 学习与练习</div>
              <div className="p-3 rounded-lg bg-cosmos-800/50 border border-cosmos-700/50">4. AI反馈与运营指标</div>
            </div>
          </Card>

          <Card className="p-6 bg-cosmos-800/40 border-cosmos-700/50">
            <h3 className="text-white text-lg font-semibold mb-4">快速入口</h3>
            <div className="space-y-3 text-sm">
              <Link href="/dashboard" className="flex items-center justify-between p-3 rounded-lg bg-cosmos-800/60 hover:bg-cosmos-700/60 transition-colors">
                <span>学习控制台</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/chat" className="flex items-center justify-between p-3 rounded-lg bg-cosmos-800/60 hover:bg-cosmos-700/60 transition-colors">
                <span>AI对话陪练</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/ai-writing" className="flex items-center justify-between p-3 rounded-lg bg-cosmos-800/60 hover:bg-cosmos-700/60 transition-colors">
                <span>AI写作工坊</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/competition" className="flex items-center justify-between p-3 rounded-lg bg-cosmos-800/60 hover:bg-cosmos-700/60 transition-colors">
                <span>评审中心</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>
        </section>

        <section className="text-center pt-2">
          <div className="inline-flex items-center gap-2 text-cosmos-400 text-sm">
            <BookOpen className="w-4 h-4" />
            前端为主，AI增强，支持演示模式与真实API模式
          </div>
        </section>
      </main>

      <footer className="glass border-t border-cosmos-700/40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between gap-3 text-sm text-cosmos-400">
          <span>问芽星图 · WenYa StarMap</span>
          <div className="flex items-center gap-5">
            <Link href="/competition" className="hover:text-white transition-colors">评审中心</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">学习控制台</Link>
            <Link href="/community" className="hover:text-white transition-colors">学习社区</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
