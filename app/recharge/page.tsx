'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Coins,
  Crown,
  CreditCard,
  Gift,
  History,
  QrCode,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RECHARGE_PACKAGES, STAR_COIN_RULES } from '@/lib/star-coin-service'
import { RechargePackage, StarCoinTransaction } from '@/types'

function RechargeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState('')
  const [starCoins, setStarCoins] = useState(0)
  const [selectedPackage, setSelectedPackage] = useState<RechargePackage | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [transactions, setTransactions] = useState<StarCoinTransaction[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const loadWallet = async (uid: string) => {
    const [profileRes, txnRes] = await Promise.all([
      fetch(`/api/profile?userId=${encodeURIComponent(uid)}`),
      fetch(`/api/wallet/transactions?userId=${encodeURIComponent(uid)}`),
    ])

    if (profileRes.ok) {
      const profileJson = await profileRes.json()
      setStarCoins(profileJson.data?.star_coins ?? 0)
    } else {
      setStarCoins(0)
    }

    if (txnRes.ok) {
      const txnJson = await txnRes.json()
      setTransactions(txnJson.data || [])
    } else {
      setTransactions([])
    }
  }

  useEffect(() => {
    setMounted(true)
    const user = localStorage.getItem('wenya_user')
    if (user) {
      const userData = JSON.parse(user)
      setUserId(userData.id)
      void loadWallet(userData.id)
    }
  }, [])

  useEffect(() => {
    if (searchParams.get('success') === '1' && userId) {
      setPaymentSuccess(true)
      setShowPaymentModal(true)
      void loadWallet(userId)
    }
  }, [searchParams, userId])

  const totalPackages = useMemo(() => RECHARGE_PACKAGES.length, [])
  const totalCoinsOffered = useMemo(
    () => RECHARGE_PACKAGES.reduce((sum, pkg) => sum + pkg.starCoins + pkg.bonusCoins, 0),
    []
  )

  const handleSelectPackage = (pkg: RechargePackage) => {
    setSelectedPackage(pkg)
    setShowPaymentModal(true)
    setPaymentSuccess(false)
  }

  const handlePayment = async () => {
    if (!selectedPackage || !userId) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          packageId: selectedPackage.id,
          paymentMethod,
        }),
      })

      const data = await response.json()

      if (data?.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl
        return
      }

      if (data?.success) {
        await loadWallet(userId)
        setPaymentSuccess(true)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedPackage(null)
    setPaymentSuccess(false)
  }

  const renderTransaction = (txn: StarCoinTransaction) => {
    const isIncome = txn.amount > 0
    const date = new Date(txn.createdAt)
    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`

    return (
      <div key={txn.id} className="flex items-center justify-between border-b border-white/6 py-3 last:border-0">
        <div className="flex-1">
          <p className="text-sm text-white">{txn.description}</p>
          <p className="text-xs text-cosmos-400">{dateStr}</p>
        </div>
        <div className={`text-right ${isIncome ? 'text-sprout-300' : 'text-red-300'}`}>
          <p className="font-semibold">{isIncome ? '+' : ''}{txn.amount}</p>
          <p className="text-xs text-cosmos-500">余额 {txn.balance}</p>
        </div>
      </div>
    )
  }

  const renderPackageCard = (pkg: RechargePackage) => {
    const totalCoins = pkg.starCoins + pkg.bonusCoins
    const perCoinPrice = (pkg.price / totalCoins).toFixed(3)

    return (
      <button
        key={pkg.id}
        onClick={() => handleSelectPackage(pkg)}
        className={`group relative overflow-hidden rounded-3xl border p-5 text-left transition-all hover:-translate-y-1 ${
          pkg.isPopular
            ? 'border-[#00F5A0]/35 bg-[#00F5A0]/8 shadow-[0_0_28px_rgba(0,245,160,0.08)]'
            : pkg.isLimited
              ? 'border-star-300/30 bg-star-300/8'
              : 'border-white/8 bg-white/5'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-white">{pkg.name}</span>
              {pkg.isPopular && (
                <span className="rounded-full border border-[#00F5A0]/20 bg-[#00F5A0]/10 px-2 py-1 text-[11px] text-[#B9FFE4]">
                  最受欢迎
                </span>
              )}
              {pkg.isLimited && (
                <span className="rounded-full border border-star-300/20 bg-star-300/10 px-2 py-1 text-[11px] text-star-200">
                  限时星门
                </span>
              )}
            </div>
            <p className="mt-2 text-sm leading-6 text-cosmos-300">
              为 NovaSprout 和语言星图补充一段稳定燃料，让指引和学习保持长明。
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-[#00F5A0]">
            <Coins className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold text-white">{pkg.starCoins}</span>
              <span className="text-sm text-cosmos-400">星币</span>
            </div>
            {pkg.bonusCoins > 0 && (
              <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-sprout-400/20 bg-sprout-400/10 px-3 py-1 text-xs text-sprout-300">
                <Gift className="h-3.5 w-3.5" />
                额外赠送 +{pkg.bonusCoins}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-white">¥{pkg.price}</div>
            <div className="mt-1 text-xs text-cosmos-500">约 ¥{perCoinPrice}/星币</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/6 pt-4 text-xs text-cosmos-400">
          <span>总计 {totalCoins} 星币燃料</span>
          <span className="inline-flex items-center gap-1 text-[#B9FFE4]">
            选择此档
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </button>
    )
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#00F5A0]/30 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <PageHeader
        title="星图燃料补给"
        subtitle="Recharge your learning path"
        titleColor="star"
        backUrl="/dashboard"
      />

      <div className="mx-auto max-w-7xl px-4 pb-8">
        <Card className="mb-6 border-[#00F5A0]/18 bg-white/5 p-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cosmos-400">燃料中枢</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">给星图和 NovaSprout 注入长明能量</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-cosmos-300">
                这里保留真实的充值和交易链路，但语境更像一次仪式化的补给。补充星币后，学习路径、课程购买和语音陪伴都会继续向前。
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                  <div className="text-xs text-cosmos-400">当前星币</div>
                  <div className="mt-1 text-2xl font-semibold text-[#00F5A0]">{starCoins.toLocaleString()}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                  <div className="text-xs text-cosmos-400">燃料套餐</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{totalPackages}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                  <div className="text-xs text-cosmos-400">可得星币总量</div>
                  <div className="mt-1 text-2xl font-semibold text-star-300">{totalCoinsOffered.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-cosmos-400">链路状态</div>
                    <div className="mt-2 text-sm text-white">充值 / 交易 / 购买三条链路已接入</div>
                  </div>
                  <Shield className="h-6 w-6 text-[#00F5A0]" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-cosmos-300">
                  <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">API: /api/recharge</div>
                  <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">钱包: /api/wallet/transactions</div>
                  <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">档案: /api/profile</div>
                  <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">商城: /api/store/purchase</div>
                </div>
              </div>

              <Button variant="star" onClick={() => router.push('/store')} className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                去课程商店
              </Button>
            </div>
          </div>
        </Card>

        <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card className="border-white/8 bg-white/5 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cosmos-400">星币来源</p>
                <h3 className="mt-2 text-xl font-semibold text-white">不用充值也能获得的补给</h3>
              </div>
              <Sparkles className="h-5 w-5 text-star-300" />
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-center">
                <Gift className="mx-auto mb-2 h-6 w-6 text-sprout-300" />
                <p className="text-sm text-white">注册礼包</p>
                <p className="mt-1 text-lg font-semibold text-sprout-300">+{STAR_COIN_RULES.REGISTER_BONUS}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-center">
                <CheckCircle className="mx-auto mb-2 h-6 w-6 text-[#00F5A0]" />
                <p className="text-sm text-white">每日签到</p>
                <p className="mt-1 text-lg font-semibold text-[#00F5A0]">+{STAR_COIN_RULES.DAILY_CHECKIN}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-center">
                <Star className="mx-auto mb-2 h-6 w-6 text-star-300" />
                <p className="text-sm text-white">节日星光</p>
                <p className="mt-1 text-lg font-semibold text-star-300">+{STAR_COIN_RULES.HOLIDAY_CHECKIN}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-center">
                <Zap className="mx-auto mb-2 h-6 w-6 text-orange-300" />
                <p className="text-sm text-white">课程奖励</p>
                <p className="mt-1 text-lg font-semibold text-orange-300">+{STAR_COIN_RULES.LESSON_COMPLETE}</p>
              </div>
            </div>
          </Card>

          <Card className="border-white/8 bg-white/5 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cosmos-400">交易回声</p>
                <h3 className="mt-2 text-xl font-semibold text-white">最近的燃料流向</h3>
              </div>
              <Button variant="cosmos" onClick={() => setShowHistory((prev) => !prev)} className="gap-2">
                <History className="h-4 w-4" />
                {showHistory ? '收起' : '展开'}
              </Button>
            </div>

            {showHistory ? (
              transactions.length > 0 ? (
                <div className="max-h-64 space-y-1 overflow-y-auto pr-1">{transactions.slice(0, 8).map(renderTransaction)}</div>
              ) : (
                <p className="py-8 text-center text-cosmos-400">暂无交易记录</p>
              )
            ) : (
              <p className="py-8 text-center text-cosmos-400">点击展开查看最近充值、签到和购买记录。</p>
            )}
          </Card>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cosmos-400">燃料套餐</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">选择合适的补给档位</h2>
          </div>
          <Button variant="cosmos" onClick={() => router.push('/store')} className="gap-2">
            查看课程商城
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {RECHARGE_PACKAGES.map(renderPackageCard)}
        </div>

        <Card className="mt-6 border-white/8 bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-sprout-300" />
            <div>
              <h4 className="font-semibold text-white">安全支付保障</h4>
              <p className="mt-1 text-sm leading-6 text-cosmos-400">
                接入 Stripe 后会进入真实收银流程；未配置时会自动降级到演示模式，保持页面可用。
              </p>
            </div>
          </div>
        </Card>
      </div>

      {showPaymentModal && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Card className="w-full max-w-md border-white/8 bg-[#0F1624]/95 p-6">
            {paymentSuccess ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#00F5A0]/10">
                  <CheckCircle className="h-10 w-10 text-[#00F5A0]" />
                </div>
                <h3 className="mb-2 text-2xl font-semibold text-white">补给完成</h3>
                <p className="mb-2 text-cosmos-300">
                  已获得 <span className="font-semibold text-star-300">{selectedPackage.starCoins + selectedPackage.bonusCoins}</span> 星币
                </p>
                <p className="mb-6 text-cosmos-400">
                  当前余额：<span className="font-semibold text-white">{starCoins}</span>
                </p>
                <div className="flex gap-3">
                  <Button variant="cosmos" className="flex-1" onClick={closePaymentModal}>
                    继续补给
                  </Button>
                  <Button variant="star" className="flex-1" onClick={() => {
                    closePaymentModal()
                    router.push('/store')
                  }}>
                    去购课
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.28em] text-cosmos-400">确认燃料注入</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{selectedPackage.name}</h3>
                </div>

                <div className="mt-5 space-y-3 rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cosmos-400">星币</span>
                    <span className="text-white">{selectedPackage.starCoins}{selectedPackage.bonusCoins > 0 ? ` + ${selectedPackage.bonusCoins}` : ''}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cosmos-400">支付金额</span>
                    <span className="text-xl font-semibold text-white">¥{selectedPackage.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cosmos-400">购买后余额</span>
                    <span className="text-sprout-300">{starCoins + selectedPackage.starCoins + selectedPackage.bonusCoins}</span>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-3 text-sm text-cosmos-400">选择支付方式</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPaymentMethod('wechat')}
                      className={`rounded-2xl border p-3 transition-all ${
                        paymentMethod === 'wechat' ? 'border-[#00F5A0]/30 bg-[#00F5A0]/10' : 'border-white/8 bg-white/5'
                      }`}
                    >
                      <Smartphone className="mx-auto mb-1 h-5 w-5 text-[#00F5A0]" />
                      <p className="text-xs text-white">微信</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('alipay')}
                      className={`rounded-2xl border p-3 transition-all ${
                        paymentMethod === 'alipay' ? 'border-star-300/30 bg-star-300/10' : 'border-white/8 bg-white/5'
                      }`}
                    >
                      <QrCode className="mx-auto mb-1 h-5 w-5 text-star-300" />
                      <p className="text-xs text-white">支付宝</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`rounded-2xl border p-3 transition-all ${
                        paymentMethod === 'card' ? 'border-purple-300/30 bg-purple-300/10' : 'border-white/8 bg-white/5'
                      }`}
                    >
                      <CreditCard className="mx-auto mb-1 h-5 w-5 text-purple-300" />
                      <p className="text-xs text-white">银行卡</p>
                    </button>
                  </div>
                </div>

                <p className="mt-4 flex items-center justify-center gap-1 text-xs text-cosmos-500">
                  <Clock className="h-3.5 w-3.5" />
                  若已配置 Stripe，将跳转真实收银台
                </p>

                <div className="mt-5 flex gap-3">
                  <Button variant="cosmos" className="flex-1" onClick={closePaymentModal} disabled={isProcessing}>
                    取消
                  </Button>
                  <Button variant="star" className="flex-1 gap-2" onClick={handlePayment} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        处理中
                      </>
                    ) : (
                      <>
                        立即补给 ¥{selectedPackage.price}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

export default function RechargePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0B0F19]">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#00F5A0]/30 border-t-transparent" />
        </div>
      }
    >
      <RechargeContent />
    </Suspense>
  )
}
