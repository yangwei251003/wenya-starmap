import Link from 'next/link'
import {
  Award,
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  Library,
  Newspaper,
  PenLine,
  Route,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  User,
  Users,
  Wallet,
} from 'lucide-react'

import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { coreServices, supportServices, systemServices, type SiteService } from '@/lib/site-services'

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
  shield: Shield,
  stars: Star,
  store: ShoppingBag,
  user: User,
  users: Users,
  wallet: Wallet,
}

function ServiceCard({ service, featured = false }: { service: SiteService; featured?: boolean }) {
  const Icon = iconMap[service.icon as keyof typeof iconMap] || Sparkles

  return (
    <Link href={service.href} className="group block h-full">
      <Card
        variant={featured ? 'sprout' : 'cosmos'}
        className={`flex h-full flex-col p-5 ${featured ? 'min-h-[220px]' : 'min-h-[160px]'}`}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#00F5A0]/12 text-[#00F5A0]">
            <Icon className="h-5 w-5" />
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-cosmos-300">
            {featured ? '核心' : service.tier === 'system' ? '管理' : '辅助'}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-white">{service.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-cosmos-300">{service.summary}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#B9FFE4]">
          {service.action}
          <Sparkles className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Card>
    </Link>
  )
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen text-white">
      <PageHeader title="全部服务" subtitle="核心功能单独入口，辅助工具集中查找" titleColor="sprout" backUrl="/dashboard" />

      <main className="mx-auto max-w-7xl px-4 pb-12">
        <section className="mb-7 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Card variant="star" className="p-6">
            <p className="text-xs uppercase tracking-[0.26em] text-star-200/80">Wenya Service Map</p>
            <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">先选目标，再进功能。</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-cosmos-200">
              本站核心是 AI 发问、背单词、成长可视化和课程学习。其他服务保留在辅助区，需要时再进入。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/vocab">
                <Button variant="star" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  立即背单词
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="cosmos" className="gap-2">
                  <Bot className="h-4 w-4" />
                  AI 发问
                </Button>
              </Link>
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            {coreServices.map((service) => (
              <ServiceCard key={service.href} service={service} featured />
            ))}
          </div>
        </section>

        <section className="mb-7">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-cosmos-500">Support Area</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">辅助服务</h2>
            </div>
            <p className="hidden max-w-md text-right text-sm text-cosmos-400 sm:block">
              阅读、测验、写作、社区和支付放在这里，主路径不会被打断。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {supportServices.map((service) => (
              <ServiceCard key={service.href} service={service} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.26em] text-cosmos-500">System</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">展示与管理</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {systemServices.map((service) => (
              <ServiceCard key={service.href} service={service} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
