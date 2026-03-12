'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import {
  Sparkles,
  Palette,
  Cpu,
  Briefcase,
  Megaphone,
  CheckCircle,
  ArrowRight,
  LineChart,
  Users,
  Target,
  CalendarClock,
  ShieldCheck
} from 'lucide-react'

const criteria = [
  {
    name: '创意与原创性（15%）',
    icon: Sparkles,
    points: [
      'AI诊断 + 错题解析 + 写作批改三引擎协同',
      '学习任务由静态页面升级为可执行行动清单',
      '无API时可切换演示模式，评审现场稳定展示'
    ]
  },
  {
    name: '用户体验设计（20%）',
    icon: Palette,
    points: [
      '首页、控制台、评审页三层信息架构',
      'Dashboard分区展示，降低信息过载',
      '关键路径统一为 诊断 -> 学习 -> 反馈'
    ]
  },
  {
    name: '技术实现（25%）',
    icon: Cpu,
    points: [
      'Next.js + TypeScript + Tailwind 组件化实现',
      'AI接口标准化，含JSON结构化返回与fallback',
      '学习数据本地追踪与可视化链路完整'
    ]
  },
  {
    name: '商业价值与可行性（20%）',
    icon: Briefcase,
    points: [
      '课程商店 + 星币体系提供转化抓手',
      'AI增值服务可拆分为会员权益',
      '面向校园英语学习场景，需求明确'
    ]
  },
  {
    name: '上线运营能力（20%）',
    icon: Megaphone,
    points: [
      '每日挑战、连续学习、排行榜促活留存',
      '运营看板可跟踪活跃、转化、复习完成率',
      '支持演示账号，便于路演与灰度推广'
    ]
  }
]

const kpis = [
  { label: '7日留存目标', value: '35%+' },
  { label: '人均日学习时长', value: '18min' },
  { label: 'AI功能触达率', value: '60%+' },
  { label: '付费转化目标', value: '8%-12%' }
]

const roadmap = [
  {
    phase: '第1阶段：冷启动（第1-2周）',
    tasks: '校园社群拉新 + Demo账号引流 + 诊断报告裂变分享'
  },
  {
    phase: '第2阶段：增长（第3-6周）',
    tasks: '挑战赛活动 + AI写作打卡 + 周榜激励机制'
  },
  {
    phase: '第3阶段：转化（第7-10周）',
    tasks: '推出会员包（月卡/季卡）+ 学习包SKU + 数据复盘'
  }
]

const demoScript = [
  '00:00-00:20：打开评审中心，说明五维评分映射。',
  '00:20-00:50：进入 Dashboard 的 AI中心，生成 AI 学习诊断报告。',
  '00:50-01:20：进入练习中心完成一组题，展示 AI 错题解析。',
  '01:20-01:45：进入 AI 写作工坊，展示评分、纠错与改写。',
  '01:45-02:00：回到生态运营分区，展示 KPI 与运营节奏。'
]

export default function CompetitionPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <section className="rounded-2xl border border-cosmos-700/50 bg-gradient-to-r from-cosmos-900/80 to-cosmos-800/80 p-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
            <div>
              <p className="text-cosmos-300 text-sm mb-3">智慧教育赛道 · 评审展示模式</p>
              <h1 className="text-4xl font-bold text-white mb-3">问芽星图评审中心</h1>
              <p className="text-cosmos-300 max-w-2xl leading-relaxed">
                该页面用于路演和评审答辩，聚焦评分标准映射、业务可行性、运营计划与技术证据。
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard" className="btn-star inline-flex items-center gap-2">
                进入控制台
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/" className="btn-sprout">返回首页</Link>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">评分维度与证据映射</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {criteria.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.name} className="p-5 bg-cosmos-800/40 border-cosmos-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-5 h-5 text-star-400" />
                    <h3 className="text-white font-semibold text-sm">{item.name}</h3>
                  </div>
                  <div className="space-y-2 text-sm text-cosmos-300">
                    {item.points.map((p) => (
                      <p key={p} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-sprout-400 mt-0.5" />
                        <span>{p}</span>
                      </p>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-4">
          <Card className="p-5 lg:col-span-2 bg-gradient-to-r from-sprout-500/10 to-cyan-500/10 border-sprout-400/30">
            <h3 className="text-white text-xl font-semibold mb-4">商业模式与增长路径</h3>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-cosmos-800/50 border border-cosmos-700/40">
                <div className="text-cosmos-200 font-medium mb-1">流量入口</div>
                <div className="text-cosmos-300">Demo体验、校园传播、挑战赛活动</div>
              </div>
              <div className="p-3 rounded-lg bg-cosmos-800/50 border border-cosmos-700/40">
                <div className="text-cosmos-200 font-medium mb-1">价值交付</div>
                <div className="text-cosmos-300">个性化学习计划 + 可解释AI反馈</div>
              </div>
              <div className="p-3 rounded-lg bg-cosmos-800/50 border border-cosmos-700/40">
                <div className="text-cosmos-200 font-medium mb-1">变现方式</div>
                <div className="text-cosmos-300">会员订阅、课程商店、学习礼包</div>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-cosmos-800/40 border-cosmos-700/50">
            <h3 className="text-white text-lg font-semibold mb-4">核心KPI目标</h3>
            <div className="space-y-3">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="flex items-center justify-between p-2 rounded bg-cosmos-800/60">
                  <span className="text-cosmos-300 text-sm">{kpi.label}</span>
                  <span className="text-star-400 font-semibold">{kpi.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid lg:grid-cols-2 gap-4">
          <Card className="p-5 bg-cosmos-800/40 border-cosmos-700/50">
            <div className="flex items-center gap-2 mb-4">
              <CalendarClock className="w-5 h-5 text-purple-400" />
              <h3 className="text-white text-lg font-semibold">上线运营节奏</h3>
            </div>
            <div className="space-y-3">
              {roadmap.map((item) => (
                <div key={item.phase} className="p-3 rounded-lg bg-cosmos-800/60 border border-cosmos-700/40">
                  <div className="text-cosmos-100 font-medium text-sm mb-1">{item.phase}</div>
                  <p className="text-cosmos-300 text-sm">{item.tasks}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-cosmos-800/40 border-cosmos-700/50">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-sprout-400" />
              <h3 className="text-white text-lg font-semibold">技术与风控要点</h3>
            </div>
            <div className="space-y-3 text-sm text-cosmos-300">
              <p className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-sprout-400 mt-0.5" />AI接口异常自动降级到演示响应，保证稳定演示。</p>
              <p className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-sprout-400 mt-0.5" />前端任务流拆分，避免页面拥挤造成用户流失。</p>
              <p className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-sprout-400 mt-0.5" />关键学习行为可追踪，为后续A/B测试与精细化运营留接口。</p>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="p-2 rounded bg-cosmos-800/70">
                <Users className="w-4 h-4 mx-auto mb-1 text-star-400" />
                用户增长
              </div>
              <div className="p-2 rounded bg-cosmos-800/70">
                <Target className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                学习完成率
              </div>
              <div className="p-2 rounded bg-cosmos-800/70">
                <LineChart className="w-4 h-4 mx-auto mb-1 text-sprout-400" />
                转化效率
              </div>
            </div>
          </Card>
        </section>

        <section>
          <Card className="p-5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-400/30">
            <h3 className="text-white text-lg font-semibold mb-3">2分钟评审演示路线</h3>
            <div className="space-y-2 text-sm text-cosmos-300">
              {demoScript.map((item) => (
                <p key={item} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-sprout-400 mt-0.5" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
