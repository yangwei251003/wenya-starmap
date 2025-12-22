'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Coins, Crown, Sparkles, Gift, Zap, CheckCircle, 
  CreditCard, Smartphone, QrCode, Shield, Clock,
  ArrowRight, Star, History
} from 'lucide-react'
import { starCoinService, RECHARGE_PACKAGES, STAR_COIN_RULES } from '@/lib/star-coin-service'
import { RechargePackage, StarCoinTransaction } from '@/types'

export default function RechargePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [starCoins, setStarCoins] = useState(0)
  const [selectedPackage, setSelectedPackage] = useState<RechargePackage | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>('wechat')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [transactions, setTransactions] = useState<StarCoinTransaction[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    setMounted(true)
    const user = localStorage.getItem('wenya_user')
    if (user) {
      const userData = JSON.parse(user)
      setUserId(userData.id)
      setStarCoins(starCoinService.getBalance(userData.id))
      setTransactions(starCoinService.getTransactions(userData.id, 20))
    }
  }, [])

  // 选择套餐
  const handleSelectPackage = (pkg: RechargePackage) => {
    setSelectedPackage(pkg)
    setShowPaymentModal(true)
    setPaymentSuccess(false)
  }

  // 模拟支付
  const handlePayment = async () => {
    if (!selectedPackage || !userId) return

    setIsProcessing(true)

    // 模拟支付延迟
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 执行充值
    const result = starCoinService.recharge(userId, selectedPackage.id)

    if (result.success) {
      setStarCoins(starCoinService.getBalance(userId))
      setTransactions(starCoinService.getTransactions(userId, 20))
      setPaymentSuccess(true)
    }

    setIsProcessing(false)
  }

  // 关闭支付弹窗
  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedPackage(null)
    setPaymentSuccess(false)
  }

  // 渲染套餐卡片
  const renderPackageCard = (pkg: RechargePackage) => {
    const totalCoins = pkg.starCoins + pkg.bonusCoins

    return (
      <Card 
        key={pkg.id}
        className={`p-5 cursor-pointer transition-all hover:scale-105 ${
          pkg.isPopular ? 'border-star-400 bg-star-400/10' : 
          pkg.isLimited ? 'border-purple-400 bg-purple-400/10' : ''
        }`}
        onClick={() => handleSelectPackage(pkg)}
      >
        {/* 标签 */}
        {(pkg.isPopular || pkg.isLimited) && (
          <div className="flex justify-center mb-3">
            {pkg.isPopular && (
              <span className="px-3 py-1 bg-star-400 text-white text-xs rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" /> 最受欢迎
              </span>
            )}
            {pkg.isLimited && (
              <span className="px-3 py-1 bg-purple-400 text-white text-xs rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" /> 限时特惠
              </span>
            )}
          </div>
        )}

        {/* 套餐名称 */}
        <h3 className="text-xl font-bold text-white text-center mb-2">{pkg.name}</h3>

        {/* 星币数量 */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2">
            <Coins className="w-8 h-8 text-star-400" />
            <span className="text-4xl font-bold text-star-400">{pkg.starCoins}</span>
          </div>
          {pkg.bonusCoins > 0 && (
            <p className="text-sm text-sprout-400 mt-1 flex items-center justify-center gap-1">
              <Gift className="w-4 h-4" />
              额外赠送 +{pkg.bonusCoins} 星币
            </p>
          )}
        </div>

        {/* 价格 */}
        <div className="text-center mb-4">
          <span className="text-3xl font-bold text-white">¥{pkg.price}</span>
          {pkg.discount && pkg.discount > 0 && (
            <span className="ml-2 text-sm text-cosmos-500 line-through">
              ¥{Math.round(pkg.price / (1 - pkg.discount / 100))}
            </span>
          )}
        </div>

        {/* 折扣标签 */}
        {pkg.discount && pkg.discount > 0 && (
          <div className="text-center">
            <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full">
              省{pkg.discount}%
            </span>
          </div>
        )}

        {/* 单价 */}
        <p className="text-xs text-cosmos-500 text-center mt-3">
          约 ¥{(pkg.price / totalCoins).toFixed(3)}/星币
        </p>
      </Card>
    )
  }

  // 渲染交易记录
  const renderTransaction = (txn: StarCoinTransaction) => {
    const isIncome = txn.amount > 0
    const date = new Date(txn.createdAt)
    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`

    return (
      <div key={txn.id} className="flex items-center justify-between py-3 border-b border-cosmos-700 last:border-0">
        <div className="flex-1">
          <p className="text-white text-sm">{txn.description}</p>
          <p className="text-xs text-cosmos-500">{dateStr}</p>
        </div>
        <div className={`text-right ${isIncome ? 'text-sprout-400' : 'text-red-400'}`}>
          <p className="font-semibold">{isIncome ? '+' : ''}{txn.amount}</p>
          <p className="text-xs text-cosmos-500">余额: {txn.balance}</p>
        </div>
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-star-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="充值中心"
        subtitle="Recharge Center"
        titleColor="star"
        backUrl="/dashboard"
      />

      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* 当前余额 */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-star-500/20 to-yellow-500/20 border-star-400/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-star-400/20 rounded-2xl flex items-center justify-center">
                <Coins className="w-8 h-8 text-star-400" />
              </div>
              <div>
                <p className="text-sm text-cosmos-400">当前星币余额</p>
                <p className="text-4xl font-bold text-star-400">{starCoins.toLocaleString()}</p>
              </div>
            </div>
            <Button 
              variant="cosmos" 
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              {showHistory ? '隐藏记录' : '交易记录'}
            </Button>
          </div>
        </Card>

        {/* 交易记录 */}
        {showHistory && (
          <Card className="p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-star-400" />
              最近交易记录
            </h3>
            {transactions.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">
                {transactions.map(renderTransaction)}
              </div>
            ) : (
              <p className="text-cosmos-400 text-center py-4">暂无交易记录</p>
            )}
          </Card>
        )}

        {/* 星币规则说明 */}
        <Card className="p-4 mb-6 bg-cosmos-800/50">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-star-400" />
            星币获取方式
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-cosmos-700/50 rounded-lg text-center">
              <Gift className="w-6 h-6 text-sprout-400 mx-auto mb-2" />
              <p className="text-sm text-white">新用户注册</p>
              <p className="text-lg font-bold text-sprout-400">+{STAR_COIN_RULES.REGISTER_BONUS}</p>
            </div>
            <div className="p-3 bg-cosmos-700/50 rounded-lg text-center">
              <CheckCircle className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-white">每日签到</p>
              <p className="text-lg font-bold text-blue-400">+{STAR_COIN_RULES.DAILY_CHECKIN}</p>
            </div>
            <div className="p-3 bg-cosmos-700/50 rounded-lg text-center">
              <Star className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-white">节日签到</p>
              <p className="text-lg font-bold text-purple-400">+{STAR_COIN_RULES.HOLIDAY_CHECKIN}</p>
            </div>
            <div className="p-3 bg-cosmos-700/50 rounded-lg text-center">
              <Zap className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <p className="text-sm text-white">完成课程</p>
              <p className="text-lg font-bold text-orange-400">+{STAR_COIN_RULES.LESSON_COMPLETE}</p>
            </div>
          </div>
        </Card>

        {/* 充值套餐 */}
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Crown className="w-6 h-6 text-star-400" />
          选择充值套餐
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {RECHARGE_PACKAGES.map(renderPackageCard)}
        </div>

        {/* 安全提示 */}
        <Card className="p-4 bg-cosmos-800/30">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-sprout-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-semibold mb-1">安全支付保障</h4>
              <p className="text-sm text-cosmos-400">
                所有支付均通过安全加密通道处理，您的支付信息将得到严格保护。
                充值后星币即时到账，如有问题请联系客服。
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 支付弹窗 */}
      {showPaymentModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 animate-fade-in-up">
            {paymentSuccess ? (
              // 支付成功
              <div className="text-center">
                <div className="w-20 h-20 bg-sprout-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-sprout-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">充值成功！</h3>
                <p className="text-cosmos-300 mb-2">
                  已获得 <span className="text-star-400 font-bold">{selectedPackage.starCoins + selectedPackage.bonusCoins}</span> 星币
                </p>
                <p className="text-cosmos-400 mb-6">
                  当前余额：<span className="text-white font-bold">{starCoins}</span> 星币
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="cosmos" 
                    className="flex-1"
                    onClick={closePaymentModal}
                  >
                    继续充值
                  </Button>
                  <Button 
                    variant="star" 
                    className="flex-1"
                    onClick={() => {
                      closePaymentModal()
                      router.push('/store')
                    }}
                  >
                    去购课
                  </Button>
                </div>
              </div>
            ) : (
              // 支付确认
              <>
                <h3 className="text-xl font-bold text-white mb-4 text-center">确认支付</h3>

                {/* 订单信息 */}
                <div className="bg-cosmos-800/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-cosmos-400">套餐名称</span>
                    <span className="text-white font-semibold">{selectedPackage.name}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-cosmos-400">星币数量</span>
                    <span className="text-star-400 font-semibold flex items-center gap-1">
                      <Coins className="w-4 h-4" />
                      {selectedPackage.starCoins}
                      {selectedPackage.bonusCoins > 0 && (
                        <span className="text-sprout-400">+{selectedPackage.bonusCoins}</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-cosmos-700">
                    <span className="text-cosmos-400">支付金额</span>
                    <span className="text-2xl font-bold text-white">¥{selectedPackage.price}</span>
                  </div>
                </div>

                {/* 支付方式 */}
                <div className="mb-4">
                  <p className="text-sm text-cosmos-400 mb-3">选择支付方式</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPaymentMethod('wechat')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === 'wechat' 
                          ? 'border-green-400 bg-green-400/10' 
                          : 'border-cosmos-700 hover:border-cosmos-600'
                      }`}
                    >
                      <Smartphone className="w-6 h-6 text-green-400 mx-auto mb-1" />
                      <p className="text-xs text-white">微信支付</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('alipay')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === 'alipay' 
                          ? 'border-blue-400 bg-blue-400/10' 
                          : 'border-cosmos-700 hover:border-cosmos-600'
                      }`}
                    >
                      <QrCode className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                      <p className="text-xs text-white">支付宝</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === 'card' 
                          ? 'border-purple-400 bg-purple-400/10' 
                          : 'border-cosmos-700 hover:border-cosmos-600'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                      <p className="text-xs text-white">银行卡</p>
                    </button>
                  </div>
                </div>

                {/* 提示 */}
                <p className="text-xs text-cosmos-500 text-center mb-4">
                  <Clock className="w-3 h-3 inline mr-1" />
                  演示模式：点击支付将模拟充值成功
                </p>

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <Button 
                    variant="cosmos" 
                    className="flex-1"
                    onClick={closePaymentModal}
                    disabled={isProcessing}
                  >
                    取消
                  </Button>
                  <Button 
                    variant="star" 
                    className="flex-1"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        处理中...
                      </>
                    ) : (
                      <>
                        立即支付 ¥{selectedPackage.price}
                        <ArrowRight className="w-4 h-4 ml-2" />
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
