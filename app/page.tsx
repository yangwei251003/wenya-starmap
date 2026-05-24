'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Brain,
  ClipboardCheck,
  Compass,
  LineChart,
  Mic2,
  PenTool,
  Sparkles,
  Sprout,
  Stars,
  Target,
  Wand2,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'

const constellationWords = ['question', 'sprout', 'voice', 'memory', 'writing', 'growth']

const featureCards = [
  {
    title: 'AI 英语导师',
    desc: '文字对话、写作批改、错题解释和真实语音陪练，围绕你的表达持续追问。',
    icon: Brain,
    tone: 'text-[#00F5A0]',
  },
  {
    title: '星图式学习路径',
    desc: '把词汇、阅读、口语、写作拆成可点亮的节点，让进步变得看得见。',
    icon: Compass,
    tone: 'text-star-300',
  },
  {
    title: '记忆复习引擎',
    desc: '结合 FSRS 复习节奏记录单词掌握度，优先安排真正快忘掉的内容。',
    icon: Target,
    tone: 'text-cyan-300',
  },
  {
    title: '成长数据回声',
    desc: '学习时长、复习质量、星币流水和成长曲线进入后台，形成真实运营闭环。',
    icon: LineChart,
    tone: 'text-violet-300',
  },
]

const learningMoments = [
  { label: 'Listen', value: '08:30', icon: Mic2 },
  { label: 'Words', value: '42', icon: BookOpen },
  { label: 'Writing', value: 'A-', icon: PenTool },
]

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#070B15] text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#070B15]/72 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#00F5A0]/20 bg-[#00F5A0]/10">
              <Sprout className="h-5 w-5 text-[#00F5A0]" />
            </span>
            <span className="text-xl font-semibold tracking-normal text-white">问芽星图</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-cosmos-300 md:flex">
            <Link href="/dashboard" className="transition hover:text-white">学习控制台</Link>
            <Link href="/chat" className="transition hover:text-white">AI 对话</Link>
            <Link href="/growth-starmap" className="transition hover:text-white">成长星图</Link>
            <Link href="/competition" className="transition hover:text-white">评审中心</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/auth/login" className="btn-sprout px-4 py-2 text-sm sm:px-5">
              登录
            </Link>
            <Link href="/demo" className="btn-star px-4 py-2 text-sm sm:px-5">
              体验 Demo
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-screen overflow-hidden px-5 pt-28 sm:px-6">
          <div className="absolute inset-0 starfield opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(0,245,160,0.18),transparent_30%),radial-gradient(circle_at_85%_45%,rgba(253,230,138,0.14),transparent_26%),linear-gradient(180deg,rgba(7,11,21,0)_0%,#070B15_92%)]" />

          <div className="pointer-events-none absolute left-[7%] top-[24%] hidden h-56 w-56 rounded-full border border-[#00F5A0]/12 md:block" />
          <div className="pointer-events-none absolute right-[9%] top-[22%] hidden h-72 w-72 rounded-full border border-star-200/10 lg:block" />

          <div className="relative z-10 mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl items-center gap-12 pb-16 lg:grid-cols-[1.02fr_0.98fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00F5A0]/18 bg-[#00F5A0]/8 px-4 py-2 text-sm text-[#B9FFE4]">
                <Sparkles className="h-4 w-4" />
                智慧教育 AI 英语学习网站
              </div>

              <h1 className="text-5xl font-semibold leading-[1.04] tracking-normal text-white sm:text-6xl lg:text-7xl">
                问芽星图
                <span className="mt-3 block bg-gradient-to-r from-[#00F5A0] via-[#FDE68A] to-[#7DD3FC] bg-clip-text text-transparent">
                  让每个问题长成星光
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-cosmos-300">
                这里不是把英语拆成一堆任务，而是把发问、表达、复习和成长连成一张可点亮的知识星图。
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="/dashboard" className="btn-star inline-flex items-center gap-2 px-6 py-3 text-base">
                  开始学习
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/chat" className="btn-sprout inline-flex items-center gap-2 px-6 py-3 text-base">
                  AI 语音陪练
                  <Mic2 className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="relative min-h-[520px]"
            >
              <div className="absolute inset-0 rounded-full bg-[#00F5A0]/8 blur-3xl" />
              <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
              <div className="absolute left-1/2 top-1/2 h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00F5A0]/16" />

              {constellationWords.map((word, index) => {
                const angle = (index / constellationWords.length) * Math.PI * 2
                const x = Math.cos(angle) * 190
                const y = Math.sin(angle) * 150

                return (
                  <motion.div
                    key={word}
                    className="absolute left-1/2 top-1/2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm text-cosmos-200 backdrop-blur-xl"
                    style={{ x, y }}
                    animate={{ y: [y, y - 10, y], opacity: [0.72, 1, 0.72] }}
                    transition={{ duration: 3 + index * 0.25, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {word}
                  </motion.div>
                )
              })}

              <Card className="absolute left-1/2 top-1/2 w-[min(92vw,360px)] -translate-x-1/2 -translate-y-1/2 border-[#00F5A0]/18 bg-[#07131F]/88 p-6 text-center shadow-[0_0_70px_rgba(0,245,160,0.16)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[#00F5A0]/20 bg-[#00F5A0]/10">
                  <Stars className="h-8 w-8 text-[#00F5A0]" />
                </div>
                <div className="mt-5 text-xs uppercase tracking-[0.3em] text-cosmos-400">Learning Orbit</div>
                <h2 className="mt-3 text-2xl font-semibold text-white">诊断 · 练习 · 反馈 · 生长</h2>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {learningMoments.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="rounded-2xl border border-white/8 bg-white/5 p-3">
                        <Icon className="mx-auto h-4 w-4 text-star-300" />
                        <div className="mt-2 text-lg font-semibold text-white">{item.value}</div>
                        <div className="text-xs text-cosmos-400">{item.label}</div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        <section className="relative px-5 py-16 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-sm text-[#B9FFE4]">
                <Wand2 className="h-4 w-4" />
                主要功能
              </div>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">一套能记录、能陪练、能反馈的英语学习系统</h2>
            </div>

            <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {featureCards.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card
                    key={feature.title}
                    className="min-h-[220px] border-white/8 bg-white/[0.045] p-5"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${feature.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-cosmos-300">{feature.desc}</p>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(0,245,160,0.10),rgba(125,211,252,0.06),rgba(253,230,138,0.08))] p-6 sm:p-8">
              <div className="flex items-center gap-2 text-sm text-[#B9FFE4]">
                <Sprout className="h-4 w-4" />
                今日生长曲线
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-4">
                {[36, 58, 74, 92].map((height, index) => (
                  <div key={height} className="flex h-52 flex-col justify-end rounded-2xl border border-white/8 bg-black/20 p-3">
                    <motion.div
                      className="rounded-xl bg-gradient-to-t from-[#00F5A0] via-[#7DD3FC] to-[#FDE68A]"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: index * 0.12 }}
                    />
                    <div className="mt-3 text-center text-xs text-cosmos-400">Stage {index + 1}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/8 bg-white/[0.045] p-6 sm:p-8">
              <div className="flex items-center gap-2 text-sm text-star-200">
                <ClipboardCheck className="h-4 w-4" />
                仍保留评审材料
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-white">评审中心已移到顶部菜单</h2>
              <p className="mt-4 text-sm leading-6 text-cosmos-300">
                面向学习者的首页会优先呈现产品理念和学习体验；比赛材料、展示脚本和评分维度仍可从评审中心进入。
              </p>
              <Link href="/competition" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-star-300/20 bg-star-300/10 px-5 py-3 text-sm text-star-100 transition hover:border-star-300/40">
                打开评审中心
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
