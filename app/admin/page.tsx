'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Database,
  RefreshCw,
  Server,
  Shield,
  Sparkles,
  Star,
  User,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'

type AdminUser = {
  id: string
  username?: string
  email?: string
  level?: string
  star_coins?: number
  learning_progress?: number
  created_at?: string
  updated_at?: string
}

type AdminOperator = {
  id: string
  email?: string
  username?: string
  level?: string
  isAdmin?: boolean
}

type AdminTransaction = {
  id: string
  user_id: string
  type: string
  amount: number
  balance: number
  description: string
  related_id?: string
  created_at?: string
}

type AdminOrder = {
  id: string
  user_id: string
  product_type: string
  product_id: string
  product_name: string
  amount_cny: number
  star_coins: number
  currency: string
  provider: string
  status: string
  created_at?: string
  completed_at?: string
}

type AdminPurchase = {
  user_id: string
  course_id: string
  price: number
  progress: number
  purchase_date?: string
  last_study_date?: string
  updated_at?: string
}

type AdminSubscription = {
  user_id: string
  plan_id: string
  provider: string
  status: string
  current_period_start?: string
  current_period_end?: string
  cancel_at_period_end?: boolean
  created_at?: string
  updated_at?: string
}

type AdminLog = {
  user_id: string
  word_id: string
  state?: string
  stability?: number
  difficulty?: number
  next_review?: string
  rating?: number
  review_time?: string
  created_at?: string
  updated_at?: string
}

type AdminOverview = {
  success: boolean
  generatedAt: string
  serviceStatus: {
    api: { ok: boolean; status: number; message: string }
    supabaseConfigured: boolean
    supabaseServiceRole: boolean
    databaseConnected: boolean
    schemaReady: boolean
    openRouter: boolean
    stripeConfigured: boolean
    stripeWebhookConfigured: boolean
    databaseUrlConfigured: boolean
    appUrl: string
  }
  summary: {
    userProfiles: number | null
    starCoinTransactions: number | null
    purchaseOrders: number | null
    purchasedCourses: number | null
    subscriptions: number | null
    studyLogs: number | null
    reviewLogs: number | null
  }
  recent: {
    users: AdminUser[]
    transactions: AdminTransaction[]
    orders: AdminOrder[]
    purchases: AdminPurchase[]
    subscriptions: AdminSubscription[]
    studyLogs: AdminLog[]
    reviewLogs: AdminLog[]
  }
  errors: Array<{ table: string; message: string }>
}

const initialOverview: AdminOverview = {
  success: false,
  generatedAt: '',
  serviceStatus: {
    api: { ok: false, status: 0, message: '未加载' },
    supabaseConfigured: false,
    supabaseServiceRole: false,
    databaseConnected: false,
    schemaReady: false,
    openRouter: false,
    stripeConfigured: false,
    stripeWebhookConfigured: false,
    databaseUrlConfigured: false,
    appUrl: '',
  },
  summary: {
    userProfiles: null,
    starCoinTransactions: null,
    purchaseOrders: null,
    purchasedCourses: null,
    subscriptions: null,
    studyLogs: null,
    reviewLogs: null,
  },
  recent: {
    users: [],
    transactions: [],
    orders: [],
    purchases: [],
    subscriptions: [],
    studyLogs: [],
    reviewLogs: [],
  },
  errors: [],
}

function formatDate(value?: string) {
  if (!value) return '未知'
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function statusTone(ok: boolean) {
  return ok ? 'text-[#00F5A0] bg-[#00F5A0]/10 border-[#00F5A0]/20' : 'text-red-300 bg-red-400/10 border-red-400/20'
}

export default function AdminPage() {
  const [overview, setOverview] = useState<AdminOverview>(initialOverview)
  const [loading, setLoading] = useState(true)
  const [authChecking, setAuthChecking] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<'users' | 'wallet' | 'orders' | 'logs'>('users')
  const [detailOpen, setDetailOpen] = useState(false)
  const [operator, setOperator] = useState<AdminOperator | null>(null)
  const [operatorMessage, setOperatorMessage] = useState('未登录')
  const [copiedField, setCopiedField] = useState('')

  const loadOverview = async (token?: string) => {
    setRefreshing(true)
    try {
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('wenya_token') : null)
      if (!authToken) {
        setOperator(null)
        setOperatorMessage('未检测到登录令牌')
        setAccessDenied(true)
        return
      }

      const response = await fetch('/api/admin/overview', {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const data = (await response.json().catch(() => null)) as AdminOverview | { success?: boolean; error?: string } | null

      if (data && 'recent' in data && data.success) {
        setOverview(data)
        const firstUserId = data.recent.users[0]?.id
        if (firstUserId) {
          setSelectedUserId((current) => current || firstUserId)
        }
        setAccessDenied(false)
      } else {
        if (response.status === 401 || response.status === 403) {
          setAccessDenied(true)
        }
        setOverview((current) => ({
          ...current,
          serviceStatus: {
            ...current.serviceStatus,
            api: {
              ok: response.ok,
              status: response.status,
              message: data && 'error' in data && data.error ? data.error : '总览加载失败',
            },
          },
          errors:
            data && 'error' in data && data.error
              ? [...current.errors, { table: 'admin-overview', message: data.error }]
              : current.errors,
        }))
      }

      const meResponse = await fetch('/api/auth/me', {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const meData = await meResponse.json().catch(() => null)

      if (meResponse.ok && meData?.success && meData?.data?.user) {
        setOperator({
          id: meData.data.user.id,
          email: meData.data.user.email,
          username: meData.data.user.username,
          level: meData.data.user.level,
          isAdmin: Boolean(meData.data.user.isAdmin),
        })
        setOperatorMessage(meData.data.user.isAdmin ? '管理员权限已确认' : '当前账号无后台权限')
        if (!meData.data.user.isAdmin) {
          setAccessDenied(true)
        }
      } else {
        setOperator(null)
        setOperatorMessage(meData?.error?.message || '认证链路未就绪')
        setAccessDenied(true)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const bootstrap = async () => {
      setAuthChecking(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('wenya_token') : null
      if (!token) {
        setOperator(null)
        setOperatorMessage('未检测到登录令牌')
        setAccessDenied(true)
        setAuthChecking(false)
        setLoading(false)
        return
      }

      try {
        const meResponse = await fetch('/api/auth/me', {
          cache: 'no-store',
          headers: { Authorization: `Bearer ${token}` },
        })
        const meData = await meResponse.json().catch(() => null)

        if (!meResponse.ok || !meData?.success || !meData?.data?.user?.isAdmin) {
          setOperator(null)
          setOperatorMessage(meData?.error?.message || '当前账号无后台权限')
          setAccessDenied(true)
          setAuthChecking(false)
          setLoading(false)
          return
        }

        setOperator({
          id: meData.data.user.id,
          email: meData.data.user.email,
          username: meData.data.user.username,
          level: meData.data.user.level,
          isAdmin: true,
        })
        setOperatorMessage('管理员权限已确认')
        setAccessDenied(false)
        await loadOverview(token)
      } finally {
        setAuthChecking(false)
      }
    }

    void bootstrap()
    const timer = window.setInterval(() => {
      void loadOverview()
    }, 60000)

    return () => window.clearInterval(timer)
  }, [])

  const filteredUsers = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    if (!keyword) return overview.recent.users
    return overview.recent.users.filter((user) => {
      return [user.username, user.email, user.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    })
  }, [overview.recent.users, searchQuery])

  const selectedUser = useMemo(
    () => filteredUsers.find((user) => user.id === selectedUserId) || filteredUsers[0] || null,
    [filteredUsers, selectedUserId]
  )

  const selectedTransactions = useMemo(
    () => overview.recent.transactions.filter((item) => item.user_id === selectedUser?.id),
    [overview.recent.transactions, selectedUser?.id]
  )

  const selectedOrders = useMemo(
    () => overview.recent.orders.filter((item) => item.user_id === selectedUser?.id),
    [overview.recent.orders, selectedUser?.id]
  )

  const selectedPurchases = useMemo(
    () => overview.recent.purchases.filter((item) => item.user_id === selectedUser?.id),
    [overview.recent.purchases, selectedUser?.id]
  )

  const selectedSubscriptions = useMemo(
    () => overview.recent.subscriptions.filter((item) => item.user_id === selectedUser?.id),
    [overview.recent.subscriptions, selectedUser?.id]
  )

  const selectedStudyLogs = useMemo(
    () => overview.recent.studyLogs.filter((item) => item.user_id === selectedUser?.id),
    [overview.recent.studyLogs, selectedUser?.id]
  )

  const selectedReviewLogs = useMemo(
    () => overview.recent.reviewLogs.filter((item) => item.user_id === selectedUser?.id),
    [overview.recent.reviewLogs, selectedUser?.id]
  )

  const copyValue = async (value: string, field: string) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      window.setTimeout(() => setCopiedField(''), 1400)
    } catch {
      setCopiedField('复制失败')
    }
  }

  useEffect(() => {
    if (!selectedUser && filteredUsers[0]) {
      setSelectedUserId(filteredUsers[0].id)
    }
  }, [filteredUsers, selectedUser])

  const summaryCards = [
    { label: '用户', value: overview.summary.userProfiles, icon: Users },
    { label: '星币流水', value: overview.summary.starCoinTransactions, icon: Wallet },
    { label: '充值订单', value: overview.summary.purchaseOrders, icon: Zap },
    { label: '课程购买', value: overview.summary.purchasedCourses, icon: BadgeCheck },
    { label: '订阅', value: overview.summary.subscriptions, icon: Star },
    { label: '学习日志', value: overview.summary.studyLogs, icon: Sparkles },
  ]

  const serviceCards = [
    { label: '数据库服务', ok: overview.serviceStatus.databaseConnected, detail: overview.serviceStatus.supabaseServiceRole ? 'Service Role 已连通' : '缺少 Service Role' },
    { label: '业务 Schema', ok: overview.serviceStatus.schemaReady, detail: overview.serviceStatus.schemaReady ? '表结构已就绪' : '当前环境还未初始化表' },
    { label: 'Supabase 配置', ok: overview.serviceStatus.supabaseConfigured, detail: overview.serviceStatus.appUrl || '未配置' },
    { label: 'OpenRouter', ok: overview.serviceStatus.openRouter, detail: overview.serviceStatus.openRouter ? '已可用' : '未配置' },
    { label: 'Stripe 支付', ok: overview.serviceStatus.stripeConfigured, detail: overview.serviceStatus.stripeWebhookConfigured ? 'Webhook 已配置' : '支付尚未完整接入' },
    { label: 'API 健康', ok: overview.serviceStatus.api.ok, detail: `${overview.serviceStatus.api.status || 0} · ${overview.serviceStatus.api.message}` },
    { label: '数据库地址', ok: overview.serviceStatus.databaseUrlConfigured, detail: overview.serviceStatus.databaseUrlConfigured ? '已绑定' : '未设置' },
  ]

  if (authChecking || loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#00F5A0]/30 border-t-transparent" />
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center px-4">
        <Card className="w-full max-w-xl border-white/8 bg-white/5 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10 text-red-200">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-white">后台控制台未授权</h1>
          <p className="mt-3 text-sm leading-6 text-cosmos-300">
            当前账号还没有后台管理权限，或登录令牌已失效。请使用管理员账号重新登录后再进入控制台。
          </p>
          <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-cosmos-200">
            {operatorMessage}
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="cosmos" onClick={() => window.location.assign('/auth/login')}>
              去登录
            </Button>
            <Button variant="cosmos" onClick={() => window.location.assign('/dashboard')}>
              返回主控台
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <PageHeader
        title="后端控制台"
        subtitle="数据库 · 服务 · 用户 · 订单"
        titleColor="white"
        backUrl="/dashboard"
        showHome={false}
      />

      <div className="mx-auto max-w-7xl px-4 pb-10">
        <Card className="mb-6 border-white/8 bg-white/5 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cosmos-400">运营中枢</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">直连数据库与服务的管理工作台</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-cosmos-300">
                这个页面用于内部运维和数据查看，直接从服务端读取 Supabase 数据、检查 API 健康、查看用户与钱包状态，并汇总近期订单、购买和学习日志。
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="cosmos" onClick={() => void loadOverview()} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                刷新数据
              </Button>
              <div className="rounded-2xl border border-[#00F5A0]/18 bg-[#00F5A0]/8 px-4 py-3 text-sm text-[#B9FFE4]">
                <div className="text-xs uppercase tracking-[0.2em] text-cosmos-400">生成时间</div>
                <div className="mt-1 font-medium">{overview.generatedAt ? formatDate(overview.generatedAt) : '刚刚'}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-cosmos-200">
                <div className="text-xs uppercase tracking-[0.2em] text-cosmos-400">当前操作者</div>
                <div className="mt-1 font-medium text-white">{operator?.username || operator?.email || '未登录'}</div>
                <div className="mt-1 text-xs text-cosmos-400">{operatorMessage}</div>
              </div>
            </div>
          </div>
        </Card>

        {!overview.serviceStatus.schemaReady && (
          <Card className="mb-6 border-yellow-400/20 bg-yellow-400/10 p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-300" />
              <div>
                <div className="font-medium text-yellow-100">当前数据库已连通，但业务表尚未初始化</div>
                <div className="mt-1 text-sm leading-6 text-yellow-50/80">
                  控制台已能接到 Supabase 服务，但 `user_profiles` 等业务表还没有在当前环境中创建。等迁移/建表完成后，这里会自动显示真实用户、订单和交易数据。
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.label} className="border-white/8 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-cosmos-400">{card.label}</div>
                    <div className="mt-2 text-3xl font-semibold text-white">{card.value ?? '—'}</div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00F5A0]/10 text-[#00F5A0]">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-white/8 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cosmos-400">服务状态</p>
                <h2 className="mt-2 text-xl font-semibold text-white">外部与内部链路健康</h2>
              </div>
              <Server className="h-5 w-5 text-[#00F5A0]" />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {serviceCards.map((item) => (
                <div key={item.label} className={`rounded-2xl border p-4 ${statusTone(item.ok)}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">{item.label}</div>
                      <div className="mt-1 text-xs text-cosmos-300">{item.detail}</div>
                    </div>
                    <Shield className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>

            {overview.errors.length > 0 && (
              <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
                <div className="text-sm font-medium text-red-200">数据源警告</div>
                <div className="mt-3 space-y-2">
                  {overview.errors.slice(0, 6).map((item) => (
                    <div key={`${item.table}-${item.message}`} className="text-xs text-red-100/90">
                      {item.table}: {item.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="border-white/8 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cosmos-400">接口健康</p>
                <h2 className="mt-2 text-xl font-semibold text-white">API 与环境配置</h2>
              </div>
              <Database className="h-5 w-5 text-star-300" />
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white">/api/test</div>
                    <div className="mt-1 text-xs text-cosmos-400">{overview.serviceStatus.api.message}</div>
                  </div>
                  <div className={`rounded-full border px-3 py-1 text-xs ${overview.serviceStatus.api.ok ? 'border-[#00F5A0]/20 bg-[#00F5A0]/10 text-[#B9FFE4]' : 'border-red-400/20 bg-red-400/10 text-red-200'}`}>
                    {overview.serviceStatus.api.status || 0}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-cosmos-300">
                <div className="flex items-center justify-between">
                  <span>数据库连接</span>
                  <span className={overview.serviceStatus.databaseConnected ? 'text-[#00F5A0]' : 'text-red-300'}>
                    {overview.serviceStatus.databaseConnected ? '已连接' : '不可用'}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-cosmos-400">
                  <div>Supabase: {overview.serviceStatus.supabaseConfigured ? '已配置' : '缺失'}</div>
                  <div>Service Role: {overview.serviceStatus.supabaseServiceRole ? '已配置' : '缺失'}</div>
                  <div>OpenRouter: {overview.serviceStatus.openRouter ? '已配置' : '缺失'}</div>
                  <div>Stripe: {overview.serviceStatus.stripeConfigured ? '已配置' : '缺失'}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-white/8 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cosmos-400">用户列表</p>
                <h2 className="mt-2 text-xl font-semibold text-white">最近活跃账号</h2>
              </div>
              <Users className="h-5 w-5 text-[#00F5A0]" />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="搜索用户名 / 邮箱 / ID"
                className="w-full rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-cosmos-500 outline-none focus:border-[#00F5A0]/30"
              />
              <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-xs text-cosmos-300">
                {filteredUsers.length} 条
              </div>
            </div>

            <div className="mt-4 max-h-[460px] space-y-2 overflow-y-auto pr-1">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const active = user.id === selectedUserId
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUserId(user.id)
                        setDetailOpen(true)
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        active ? 'border-[#00F5A0]/30 bg-[#00F5A0]/8' : 'border-white/8 bg-white/5 hover:border-white/12'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{user.username || '未命名用户'}</span>
                            <span className="rounded-full border border-white/8 bg-black/20 px-2 py-1 text-[11px] text-cosmos-300">
                              {user.level || 'unknown'}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-cosmos-400">{user.email || '无邮箱'}</div>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-cosmos-300">
                            <span className="rounded-full border border-white/8 bg-black/20 px-2 py-1">ID {user.id.slice(0, 8)}</span>
                            <span className="rounded-full border border-white/8 bg-black/20 px-2 py-1">星币 {user.star_coins ?? 0}</span>
                            <span className="rounded-full border border-white/8 bg-black/20 px-2 py-1">进度 {user.learning_progress ?? 0}%</span>
                          </div>
                        </div>
                        <ArrowRight className={`h-4 w-4 ${active ? 'text-[#00F5A0]' : 'text-cosmos-500'}`} />
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="rounded-2xl border border-white/8 bg-white/5 p-6 text-center text-cosmos-400">没有匹配的用户</div>
              )}
            </div>
          </Card>

          <Card className="border-white/8 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cosmos-400">用户详情</p>
                <h2 className="mt-2 text-xl font-semibold text-white">当前选中账号</h2>
              </div>
              <User className="h-5 w-5 text-star-300" />
            </div>

            {selectedUser ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-2xl font-semibold text-white">{selectedUser.username || '未命名用户'}</div>
                      <div className="mt-1 text-sm text-cosmos-400">{selectedUser.email || '无邮箱'}</div>
                    </div>
                    <div className="rounded-full border border-[#00F5A0]/20 bg-[#00F5A0]/10 px-3 py-1 text-xs text-[#B9FFE4]">
                      {selectedUser.level || 'unknown'}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                      <div className="text-xs text-cosmos-400">星币</div>
                      <div className="mt-1 text-lg font-semibold text-[#00F5A0]">{selectedUser.star_coins ?? 0}</div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                      <div className="text-xs text-cosmos-400">学习进度</div>
                      <div className="mt-1 text-lg font-semibold text-star-300">{selectedUser.learning_progress ?? 0}%</div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                      <div className="text-xs text-cosmos-400">创建时间</div>
                      <div className="mt-1 text-sm font-medium text-white">{formatDate(selectedUser.created_at)}</div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                      <div className="text-xs text-cosmos-400">更新时间</div>
                      <div className="mt-1 text-sm font-medium text-white">{formatDate(selectedUser.updated_at)}</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <button onClick={() => setSelectedSection('users')} className={`rounded-2xl border p-4 text-left transition-all ${selectedSection === 'users' ? 'border-[#00F5A0]/30 bg-[#00F5A0]/8' : 'border-white/8 bg-white/5'}`}>
                    <div className="text-sm font-medium text-white">用户档案</div>
                    <div className="mt-1 text-xs text-cosmos-400">查看基本身份和余额</div>
                  </button>
                  <button onClick={() => setSelectedSection('wallet')} className={`rounded-2xl border p-4 text-left transition-all ${selectedSection === 'wallet' ? 'border-[#00F5A0]/30 bg-[#00F5A0]/8' : 'border-white/8 bg-white/5'}`}>
                    <div className="text-sm font-medium text-white">钱包与订单</div>
                    <div className="mt-1 text-xs text-cosmos-400">充值、购买与退款</div>
                  </button>
                  <button onClick={() => setSelectedSection('orders')} className={`rounded-2xl border p-4 text-left transition-all ${selectedSection === 'orders' ? 'border-[#00F5A0]/30 bg-[#00F5A0]/8' : 'border-white/8 bg-white/5'}`}>
                    <div className="text-sm font-medium text-white">课程购买</div>
                    <div className="mt-1 text-xs text-cosmos-400">已购课程和进度</div>
                  </button>
                  <button onClick={() => setSelectedSection('logs')} className={`rounded-2xl border p-4 text-left transition-all ${selectedSection === 'logs' ? 'border-[#00F5A0]/30 bg-[#00F5A0]/8' : 'border-white/8 bg-white/5'}`}>
                    <div className="text-sm font-medium text-white">学习日志</div>
                    <div className="mt-1 text-xs text-cosmos-400">FSRS 与复习回声</div>
                  </button>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-white">操作入口</div>
                    <Button variant="cosmos" className="h-9 px-3 text-xs" onClick={() => setDetailOpen(true)}>
                      打开详情抽屉
                    </Button>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm text-cosmos-300">
                    <button
                      onClick={() => void copyValue(selectedUser.id, 'id')}
                      className="rounded-xl border border-white/8 bg-black/20 p-3 text-left transition hover:border-[#00F5A0]/25"
                    >
                      用户 ID: {selectedUser.id}
                      <div className="mt-1 text-xs text-cosmos-500">{copiedField === 'id' ? '已复制' : '点击复制'}</div>
                    </button>
                    <button
                      onClick={() => void copyValue(selectedUser.email || '', 'email')}
                      className="rounded-xl border border-white/8 bg-black/20 p-3 text-left transition hover:border-[#00F5A0]/25"
                    >
                      邮箱: {selectedUser.email || '无邮箱'}
                      <div className="mt-1 text-xs text-cosmos-500">{copiedField === 'email' ? '已复制' : '点击复制'}</div>
                    </button>
                    <div className="rounded-xl border border-white/8 bg-black/20 p-3">余额: {selectedUser.star_coins ?? 0}</div>
                    <div className="rounded-xl border border-white/8 bg-black/20 p-3">最近更新: {formatDate(selectedUser.updated_at)}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/8 bg-white/5 p-8 text-center text-cosmos-400">
                没有可展示的用户，先检查数据库连接或搜索条件。
              </div>
            )}
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="border-white/8 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cosmos-400">星币流水</p>
                <h3 className="mt-2 text-lg font-semibold text-white">最近交易</h3>
              </div>
              <Wallet className="h-5 w-5 text-[#00F5A0]" />
            </div>
            <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
              {overview.recent.transactions.length > 0 ? (
                overview.recent.transactions.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-white">{item.description}</div>
                        <div className="mt-1 text-xs text-cosmos-400">
                          {item.user_id.slice(0, 8)} · {item.type} · {formatDate(item.created_at)}
                        </div>
                      </div>
                      <div className={`text-right ${item.amount >= 0 ? 'text-[#00F5A0]' : 'text-red-300'}`}>
                        <div className="font-semibold">{item.amount >= 0 ? '+' : ''}{item.amount}</div>
                        <div className="text-xs text-cosmos-500">余额 {item.balance}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/8 bg-black/20 p-6 text-center text-cosmos-400">暂无交易记录</div>
              )}
            </div>
          </Card>

          <Card className="border-white/8 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cosmos-400">订单与购买</p>
                <h3 className="mt-2 text-lg font-semibold text-white">充值订单 / 课程购买 / 订阅</h3>
              </div>
              <Zap className="h-5 w-5 text-star-300" />
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="mb-3 text-sm font-medium text-white">充值订单</div>
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {overview.recent.orders.length > 0 ? (
                    overview.recent.orders.map((item) => (
                      <div key={item.id} className="rounded-xl border border-white/8 bg-white/5 p-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-white">{item.product_name}</div>
                            <div className="mt-1 text-xs text-cosmos-400">
                              {item.user_id.slice(0, 8)} · {item.provider} · {item.status}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[#00F5A0]">¥{item.amount_cny}</div>
                            <div className="text-xs text-cosmos-500">{item.star_coins} 星币</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-cosmos-400">暂无充值订单</div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="mb-3 text-sm font-medium text-white">已购课程</div>
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {overview.recent.purchases.length > 0 ? (
                    overview.recent.purchases.map((item) => (
                      <div key={`${item.user_id}-${item.course_id}`} className="rounded-xl border border-white/8 bg-white/5 p-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-white">{item.course_id}</div>
                            <div className="mt-1 text-xs text-cosmos-400">
                              {item.user_id.slice(0, 8)} · 进度 {item.progress ?? 0}%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-star-300">¥{item.price}</div>
                            <div className="text-xs text-cosmos-500">{formatDate(item.purchase_date)}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-cosmos-400">暂无课程购买</div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="mb-3 text-sm font-medium text-white">订阅状态</div>
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {overview.recent.subscriptions.length > 0 ? (
                    overview.recent.subscriptions.map((item, index) => (
                      <div key={`${item.user_id}-${index}`} className="rounded-xl border border-white/8 bg-white/5 p-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-white">{item.plan_id}</div>
                            <div className="mt-1 text-xs text-cosmos-400">
                              {item.user_id.slice(0, 8)} · {item.provider}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={item.status === 'active' ? 'text-[#00F5A0]' : 'text-star-300'}>{item.status}</div>
                            <div className="text-xs text-cosmos-500">{formatDate(item.updated_at || item.created_at)}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-cosmos-400">暂无订阅记录</div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="border-white/8 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cosmos-400">学习日志</p>
                <h3 className="mt-2 text-lg font-semibold text-white">FSRS 与复习回声</h3>
              </div>
              <Sparkles className="h-5 w-5 text-[#00F5A0]" />
            </div>
            <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
              {overview.recent.studyLogs.length > 0 ? (
                overview.recent.studyLogs.map((item, index) => (
                  <div key={`${item.word_id}-${index}`} className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-white">Word {item.word_id}</div>
                        <div className="mt-1 text-xs text-cosmos-400">
                          {item.user_id.slice(0, 8)} · {item.state} · stability {item.stability ?? 0}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#00F5A0]">{formatDate(item.next_review)}</div>
                        <div className="text-xs text-cosmos-500">下次复习</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/8 bg-black/20 p-6 text-center text-cosmos-400">暂无学习日志</div>
              )}
            </div>
          </Card>

          <Card className="border-white/8 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cosmos-400">复习轨迹</p>
                <h3 className="mt-2 text-lg font-semibold text-white">最近的 review_logs</h3>
              </div>
              <BadgeCheck className="h-5 w-5 text-star-300" />
            </div>
            <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
              {overview.recent.reviewLogs.length > 0 ? (
                overview.recent.reviewLogs.map((item, index) => (
                  <div key={`${item.word_id}-${index}`} className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-white">Word {item.word_id}</div>
                        <div className="mt-1 text-xs text-cosmos-400">
                          {item.user_id.slice(0, 8)} · rating {item.rating ?? 0}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-star-300">{formatDate(item.review_time || item.created_at)}</div>
                        <div className="text-xs text-cosmos-500">复习时间</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/8 bg-black/20 p-6 text-center text-cosmos-400">暂无复习日志</div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {detailOpen && selectedUser && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailOpen(false)}
          >
            <motion.aside
              className="h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[#0F1627] p-6 shadow-2xl"
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cosmos-400">用户详情抽屉</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{selectedUser.username || '未命名用户'}</h3>
                  <p className="mt-1 text-sm text-cosmos-400">{selectedUser.email || '无邮箱'}</p>
                </div>
                <button
                  onClick={() => setDetailOpen(false)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-cosmos-200 transition hover:border-[#00F5A0]/20"
                >
                  关闭
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="text-xs text-cosmos-400">账号等级</div>
                  <div className="mt-1 text-sm font-medium text-white">{selectedUser.level || 'unknown'}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="text-xs text-cosmos-400">星币</div>
                  <div className="mt-1 text-sm font-medium text-[#00F5A0]">{selectedUser.star_coins ?? 0}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="text-xs text-cosmos-400">学习进度</div>
                  <div className="mt-1 text-sm font-medium text-star-300">{selectedUser.learning_progress ?? 0}%</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="text-xs text-cosmos-400">最近更新</div>
                  <div className="mt-1 text-sm font-medium text-white">{formatDate(selectedUser.updated_at)}</div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { key: 'users', label: '用户档案' },
                  { key: 'wallet', label: '钱包与订单' },
                  { key: 'orders', label: '课程购买' },
                  { key: 'logs', label: '学习日志' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedSection(tab.key as typeof selectedSection)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      selectedSection === tab.key
                        ? 'border-[#00F5A0]/30 bg-[#00F5A0]/10 text-[#B9FFE4]'
                        : 'border-white/10 bg-white/5 text-cosmos-300 hover:border-white/20'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                <Button variant="cosmos" className="ml-auto" onClick={() => void loadOverview()}>
                  刷新当前用户
                </Button>
              </div>

              <div className="mt-5 space-y-4">
                {selectedSection === 'users' && (
                  <Card className="border-white/8 bg-white/5 p-4">
                    <div className="text-sm font-medium text-white">账号摘要</div>
                    <div className="mt-3 grid gap-3 text-sm text-cosmos-300 md:grid-cols-2">
                      <div className="rounded-xl border border-white/8 bg-black/20 p-3">用户 ID: {selectedUser.id}</div>
                      <button
                        onClick={() => void copyValue(selectedUser.email || '', 'drawer-email')}
                        className="rounded-xl border border-white/8 bg-black/20 p-3 text-left transition hover:border-[#00F5A0]/25"
                      >
                        邮箱: {selectedUser.email || '无邮箱'}
                        <div className="mt-1 text-xs text-cosmos-500">{copiedField === 'drawer-email' ? '已复制' : '点击复制'}</div>
                      </button>
                      <div className="rounded-xl border border-white/8 bg-black/20 p-3">创建时间: {formatDate(selectedUser.created_at)}</div>
                      <div className="rounded-xl border border-white/8 bg-black/20 p-3">更新时间: {formatDate(selectedUser.updated_at)}</div>
                    </div>
                  </Card>
                )}

                {selectedSection === 'wallet' && (
                  <Card className="border-white/8 bg-white/5 p-4">
                    <div className="text-sm font-medium text-white">钱包与充值</div>
                    <div className="mt-3 space-y-2">
                      {selectedTransactions.length > 0 ? (
                        selectedTransactions.map((item) => (
                          <div key={item.id} className="rounded-xl border border-white/8 bg-black/20 p-3 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-white">{item.description}</div>
                                <div className="mt-1 text-xs text-cosmos-400">{item.type} · {formatDate(item.created_at)}</div>
                              </div>
                              <div className={`text-right ${item.amount >= 0 ? 'text-[#00F5A0]' : 'text-red-300'}`}>
                                <div>{item.amount >= 0 ? '+' : ''}{item.amount}</div>
                                <div className="text-xs text-cosmos-500">余额 {item.balance}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-white/8 bg-black/20 p-4 text-sm text-cosmos-400">该用户暂无星币流水</div>
                      )}
                    </div>
                  </Card>
                )}

                {selectedSection === 'orders' && (
                  <Card className="border-white/8 bg-white/5 p-4">
                    <div className="text-sm font-medium text-white">购买与订阅</div>
                    <div className="mt-3 space-y-3">
                      {selectedOrders.length > 0 || selectedPurchases.length > 0 || selectedSubscriptions.length > 0 ? (
                        <>
                          {selectedOrders.map((item) => (
                            <div key={item.id} className="rounded-xl border border-white/8 bg-black/20 p-3 text-sm">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-white">{item.product_name}</div>
                                  <div className="mt-1 text-xs text-cosmos-400">{item.provider} · {item.status}</div>
                                </div>
                                <div className="text-right text-[#00F5A0]">¥{item.amount_cny}</div>
                              </div>
                            </div>
                          ))}
                          {selectedPurchases.map((item) => (
                            <div key={`${item.user_id}-${item.course_id}`} className="rounded-xl border border-white/8 bg-black/20 p-3 text-sm">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-white">{item.course_id}</div>
                                  <div className="mt-1 text-xs text-cosmos-400">进度 {item.progress ?? 0}%</div>
                                </div>
                                <div className="text-right text-star-300">¥{item.price}</div>
                              </div>
                            </div>
                          ))}
                          {selectedSubscriptions.map((item, index) => (
                            <div key={`${item.user_id}-${index}`} className="rounded-xl border border-white/8 bg-black/20 p-3 text-sm">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-white">{item.plan_id}</div>
                                  <div className="mt-1 text-xs text-cosmos-400">{item.provider}</div>
                                </div>
                                <div className={item.status === 'active' ? 'text-[#00F5A0]' : 'text-star-300'}>{item.status}</div>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="rounded-xl border border-white/8 bg-black/20 p-4 text-sm text-cosmos-400">该用户暂无购买或订阅记录</div>
                      )}
                    </div>
                  </Card>
                )}

                {selectedSection === 'logs' && (
                  <Card className="border-white/8 bg-white/5 p-4">
                    <div className="text-sm font-medium text-white">学习日志</div>
                    <div className="mt-3 space-y-2">
                      {selectedStudyLogs.length > 0 || selectedReviewLogs.length > 0 ? (
                        <>
                          {selectedStudyLogs.map((item, index) => (
                            <div key={`${item.word_id}-${index}`} className="rounded-xl border border-white/8 bg-black/20 p-3 text-sm">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-white">Word {item.word_id}</div>
                                  <div className="mt-1 text-xs text-cosmos-400">{item.state} · stability {item.stability ?? 0}</div>
                                </div>
                                <div className="text-[#00F5A0]">{formatDate(item.next_review)}</div>
                              </div>
                            </div>
                          ))}
                          {selectedReviewLogs.map((item, index) => (
                            <div key={`${item.word_id}-review-${index}`} className="rounded-xl border border-white/8 bg-black/20 p-3 text-sm">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-white">Review {item.word_id}</div>
                                  <div className="mt-1 text-xs text-cosmos-400">rating {item.rating ?? 0}</div>
                                </div>
                                <div className="text-star-300">{formatDate(item.review_time || item.created_at)}</div>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="rounded-xl border border-white/8 bg-black/20 p-4 text-sm text-cosmos-400">该用户暂无学习日志</div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
