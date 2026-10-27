'use client'

import Link from 'next/link'
import { type CSSProperties, type PointerEvent, useState } from 'react'
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

const constellationWords = [
  { id: 'question', label: 'question', x: 210, y: 0, delay: 0.1 },
  { id: 'sprout', label: 'sprout', x: 122, y: 144, delay: 0.28 },
  { id: 'voice', label: 'voice', x: -92, y: 158, delay: 0.46 },
  { id: 'memory', label: 'memory', x: -214, y: -10, delay: 0.64 },
  { id: 'writing', label: 'writing', x: -112, y: -154, delay: 0.82 },
  { id: 'growth', label: 'growth', x: 136, y: -132, delay: 1 },
]

const floatingGlyphs = [
  { id: 'why', text: 'WHY?', left: '9%', top: '32%', size: 'text-5xl', color: 'text-star-200/45', duration: 7 },
  { id: 'speak', text: 'speak', left: '18%', top: '76%', size: 'text-2xl', color: 'text-[#7DD3FC]/45', duration: 8.6 },
  { id: 'listen', text: 'listen', left: '37%', top: '18%', size: 'text-xl', color: 'text-white/35', duration: 6.4 },
  { id: 'grow', text: 'grow', left: '64%', top: '18%', size: 'text-3xl', color: 'text-[#00F5A0]/45', duration: 7.6 },
  { id: 'review', text: 'review', left: '79%', top: '70%', size: 'text-xl', color: 'text-star-100/40', duration: 8 },
  { id: 'aha', text: 'Aha!', left: '88%', top: '30%', size: 'text-2xl', color: 'text-white/35', duration: 6.9 },
  { id: 'grammar', text: 'grammar', left: '49%', top: '82%', size: 'text-lg', color: 'text-[#B9FFE4]/40', duration: 8.8 },
]

const brightStars = [
  { id: 's1', left: '6%', top: '18%', size: 6, delay: 0 },
  { id: 's2', left: '17%', top: '58%', size: 9, delay: 0.3 },
  { id: 's3', left: '33%', top: '23%', size: 5, delay: 0.7 },
  { id: 's4', left: '47%', top: '54%', size: 7, delay: 0.2 },
  { id: 's5', left: '72%', top: '25%', size: 6, delay: 0.9 },
  { id: 's6', left: '86%', top: '61%', size: 8, delay: 0.45 },
  { id: 's7', left: '92%', top: '18%', size: 5, delay: 1.1 },
  { id: 's8', left: '58%', top: '76%', size: 10, delay: 0.55 },
]

const featureCards = [
  {
    title: 'AI 英语导师',
    desc: '文字对话、写作批改、错题解释和语音陪练，围绕你的表达持续追问。',
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
    desc: '结合复习节奏记录掌握度，优先安排真正快忘掉的内容。',
    icon: Target,
    tone: 'text-cyan-300',
  },
  {
    title: '成长数据回声',
    desc: '学习时长、复习质量、星币流水和成长曲线进入后台，形成真实闭环。',
    icon: LineChart,
    tone: 'text-violet-300',
  },
]

const learningMoments = [
  { label: 'Listen', value: '08:30', icon: Mic2 },
  { label: 'Words', value: '42', icon: BookOpen },
  { label: 'Writing', value: 'A-', icon: PenTool },
]

const orbitNodes = [
  { id: 'q', cx: 80, cy: 126, label: '?' },
  { id: 'a', cx: 178, cy: 58, label: 'A' },
  { id: 'b', cx: 302, cy: 96, label: 'B' },
  { id: 'c', cx: 350, cy: 214, label: 'C' },
  { id: 'd', cx: 218, cy: 286, label: 'D' },
  { id: 'e', cx: 94, cy: 244, label: 'E' },
]

export default function HomePage() {
  const [pointer, setPointer] = useState({ x: 58, y: 38 })

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setPointer({
      x: Math.round(((event.clientX - rect.left) / rect.width) * 100),
      y: Math.round(((event.clientY - rect.top) / rect.height) * 100),
    })
  }

  const pointerGlowStyle: CSSProperties = {
    background: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(0,245,160,0.25), rgba(125,211,252,0.12) 18%, transparent 34%)`,
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#050914] text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050914]/76 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#00F5A0]/30 bg-[#00F5A0]/12 shadow-[0_0_28px_rgba(0,245,160,0.18)] transition group-hover:scale-105">
              <Sprout className="h-5 w-5 text-[#00F5A0]" />
            </span>
            <span className="text-xl font-semibold tracking-normal text-white">问芽星图</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-cosmos-300 md:flex">
            <Link href="/dashboard" className="transition hover:text-white">学习控制台</Link>
            <Link href="/chat" className="transition hover:text-white">AI 对话</Link>
            <Link href="/growth-starmap" className="transition hover:text-white">成长星图</Link>
            <Link href="/admin" className="transition hover:text-white">后台</Link>
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
        <section
          className="relative min-h-screen overflow-hidden px-5 pt-28 sm:px-6"
          onPointerMove={handlePointerMove}
        >
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 starfield opacity-100"
            animate={{ backgroundPosition: ['0px 0px', '160px 220px'] }}
            transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
          />
          <div aria-hidden="true" className="absolute inset-0" style={pointerGlowStyle} />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_26%_25%,rgba(0,245,160,0.18),transparent_28%),radial-gradient(circle_at_82%_40%,rgba(253,230,138,0.16),transparent_25%),linear-gradient(180deg,rgba(5,9,20,0)_0%,#050914_92%)]"
          />

          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {brightStars.map((star) => (
              <motion.span
                key={star.id}
                className="absolute rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.8)]"
                style={{ left: star.left, top: star.top, width: star.size, height: star.size }}
                animate={{ opacity: [0.25, 1, 0.35], scale: [0.75, 1.35, 0.75] }}
                transition={{ duration: 2.6, delay: star.delay, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
            {floatingGlyphs.map((glyph) => (
              <motion.span
                key={glyph.id}
                className={`absolute font-semibold tracking-normal ${glyph.size} ${glyph.color} mix-blend-screen`}
                style={{ left: glyph.left, top: glyph.top }}
                animate={{ y: [-10, 12, -10], opacity: [0.3, 0.75, 0.3], rotate: [-2, 2, -2] }}
                transition={{ duration: glyph.duration, repeat: Infinity, ease: 'easeInOut' }}
              >
                {glyph.text}
              </motion.span>
            ))}
            <motion.span
              className="absolute left-[13%] top-[44%] h-2 w-36 rounded-full bg-gradient-to-r from-transparent via-star-200 to-transparent opacity-60 blur-[1px]"
              animate={{ x: [0, 220], y: [0, 70], opacity: [0, 0.8, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, repeatDelay: 2.6, ease: 'easeOut' }}
            />
            <motion.span
              className="absolute right-[8%] top-[24%] h-2 w-44 rounded-full bg-gradient-to-r from-transparent via-[#7DD3FC] to-transparent opacity-60 blur-[1px]"
              animate={{ x: [0, -260], y: [0, 120], opacity: [0, 0.72, 0] }}
              transition={{ duration: 5.2, repeat: Infinity, repeatDelay: 3.2, ease: 'easeOut' }}
            />
          </div>

          <div className="relative z-10 mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl items-center gap-10 pb-16 lg:grid-cols-[0.96fr_1.04fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00F5A0]/28 bg-[#00F5A0]/10 px-4 py-2 text-sm text-[#B9FFE4] shadow-[0_0_30px_rgba(0,245,160,0.16)]">
                <Sparkles className="h-4 w-4" />
                智慧教育 AI 英语学习网站
              </div>

              <h1 className="text-5xl font-semibold leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
                问芽星图
                <span className="mt-3 block bg-gradient-to-r from-[#00F5A0] via-[#FDE68A] to-[#7DD3FC] bg-clip-text text-transparent">
                  让每个问题长成星光
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-cosmos-200">
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
              className="relative min-h-[560px]"
            >
              <motion.div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00F5A0]/18 shadow-[0_0_80px_rgba(0,245,160,0.14)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 44, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-star-200/18"
                animate={{ rotate: -360 }}
                transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
              />
              <div aria-hidden="true" className="absolute inset-0 rounded-full bg-[#00F5A0]/10 blur-3xl" />

              <svg
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-[390px] w-[430px] -translate-x-1/2 -translate-y-1/2 overflow-visible"
                viewBox="0 0 430 340"
              >
                <motion.path
                  d="M80 126 L178 58 L302 96 L350 214 L218 286 L94 244 Z"
                  fill="none"
                  stroke="rgba(185,255,228,0.36)"
                  strokeWidth="1.5"
                  strokeDasharray="8 12"
                  animate={{ strokeDashoffset: [0, -80] }}
                  transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
                />
                <motion.path
                  d="M178 58 C214 166 260 194 350 214 M94 244 C152 188 218 169 302 96"
                  fill="none"
                  stroke="rgba(253,230,138,0.32)"
                  strokeWidth="1"
                  animate={{ pathLength: [0.35, 1, 0.35], opacity: [0.28, 0.82, 0.28] }}
                  transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut' }}
                />
                {orbitNodes.map((node, index) => (
                  <g key={node.id}>
                    <motion.circle
                      cx={node.cx}
                      cy={node.cy}
                      r="6"
                      fill={index === 0 ? '#FDE68A' : '#00F5A0'}
                      animate={{ r: [5, 8, 5], opacity: [0.65, 1, 0.65] }}
                      transition={{ duration: 2.4, delay: index * 0.18, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <text
                      x={node.cx}
                      y={node.cy - 14}
                      textAnchor="middle"
                      className="fill-white/60 text-[14px] font-semibold"
                    >
                      {node.label}
                    </text>
                  </g>
                ))}
              </svg>

              {constellationWords.map((word) => (
                <motion.div
                  key={word.id}
                  className="absolute left-1/2 top-1/2 rounded-full border border-white/12 bg-white/[0.07] px-3 py-1 text-sm text-cosmos-100 shadow-[0_0_20px_rgba(125,211,252,0.10)] backdrop-blur-xl"
                  style={{ x: word.x, y: word.y }}
                  animate={{ y: [word.y, word.y - 14, word.y], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3.2 + word.delay, delay: word.delay, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {word.label}
                </motion.div>
              ))}

              <Card className="absolute left-1/2 top-1/2 w-[min(92vw,390px)] -translate-x-1/2 -translate-y-1/2 border-[#B9FFE4]/30 bg-[#07131F]/88 p-6 text-center shadow-[0_0_85px_rgba(0,245,160,0.20)]">
                <motion.div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[#00F5A0]/25 bg-[#00F5A0]/12"
                  animate={{ boxShadow: ['0 0 18px rgba(0,245,160,0.22)', '0 0 44px rgba(0,245,160,0.42)', '0 0 18px rgba(0,245,160,0.22)'] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Stars className="h-8 w-8 text-[#00F5A0]" />
                </motion.div>
                <div className="mt-5 text-xs uppercase tracking-[0.3em] text-cosmos-300">Learning Orbit</div>
                <h2 className="mt-3 text-2xl font-semibold text-white">诊断 · 练习 · 反馈 · 生长</h2>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {learningMoments.map((item) => {
                    const Icon = item.icon
                    return (
                      <motion.div
                        key={item.label}
                        className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"
                        whileHover={{ y: -5, borderColor: 'rgba(253,230,138,0.42)' }}
                      >
                        <Icon className="mx-auto h-4 w-4 text-star-300" />
                        <div className="mt-2 text-lg font-semibold text-white">{item.value}</div>
                        <div className="text-xs text-cosmos-300">{item.label}</div>
                      </motion.div>
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
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                  >
                    <Card className="min-h-[220px] border-white/8 bg-white/[0.045] p-5 transition hover:-translate-y-1 hover:border-[#00F5A0]/30 hover:bg-white/[0.07]">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${feature.tone}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-cosmos-300">{feature.desc}</p>
                    </Card>
                  </motion.div>
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
