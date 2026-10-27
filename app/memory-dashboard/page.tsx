'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Battery, Layers, Waves, TrendingUp, Clock, ArrowLeft, RefreshCw } from 'lucide-react'
import { memoryCalculationService } from '@/lib/memory-calculation-service'
import type { LayerData, TideData, SavingsData, HourData } from '@/lib/memory-calculation-service'

export default function MemoryDashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Dashboard data
  const [battery, setBattery] = useState(0)
  const [layerData, setLayerData] = useState<LayerData[]>([])
  const [tideData, setTideData] = useState<TideData[]>([])
  const [savingsData, setSavingsData] = useState<SavingsData[]>([])
  const [focusData, setFocusData] = useState<HourData[]>([])
  
  // Load dashboard data
  const loadDashboardData = (uid: string) => {
    setLoading(true)
    try {
      const batteryLevel = memoryCalculationService.calculateBattery(uid)
      const layers = memoryCalculationService.getLayerData(uid, 30)
      const tides = memoryCalculationService.forecastReviews(uid, 7)
      const savings = memoryCalculationService.calculateSavings(uid, 30)
      const focus = memoryCalculationService.analyzeFocusPattern(uid)
      
      setBattery(batteryLevel)
      setLayerData(layers)
      setTideData(tides)
      setSavingsData(savings)
      setFocusData(focus)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Initialize
  useEffect(() => {
    setMounted(true)
    const user = localStorage.getItem('wenya_user')
    if (user) {
      const userData = JSON.parse(user)
      setUserId(userData.id)
      loadDashboardData(userData.id)
    } else {
      setLoading(false)
    }
  }, [])
  
  // Get battery color
  const getBatteryColor = (level: number) => {
    if (level >= 80) return 'text-green-400'
    if (level >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }
  
  // Get battery background
  const getBatteryBg = (level: number) => {
    if (level >= 80) return 'from-green-500/20 to-green-600/20'
    if (level >= 60) return 'from-yellow-500/20 to-yellow-600/20'
    return 'from-red-500/20 to-red-600/20'
  }
  
  // Calculate best focus hour
  const getBestFocusHour = () => {
    if (focusData.length === 0) return null
    const best = focusData.reduce((max, hour) => 
      hour.focusScore > max.focusScore ? hour : max
    , focusData[0])
    return best.sessionCount > 0 ? best : null
  }
  
  // Calculate total savings
  const getTotalSavings = () => {
    if (savingsData.length === 0) return 0
    const latest = savingsData[savingsData.length - 1]
    return Math.max(0, latest.withReview - latest.withoutReview)
  }
  
  if (!mounted) {
    return (
      <div className="min-h-screen bg-cosmos-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">请先登录</h1>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-3 bg-sprout-500 hover:bg-sprout-600 text-white rounded-lg transition-colors"
          >
            前往登录
          </button>
        </div>
      </div>
    )
  }
  
  const bestHour = getBestFocusHour()
  const totalSavings = getTotalSavings()
  const latestLayer = layerData.length > 0 ? layerData[layerData.length - 1] : null
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900">
      {/* Header */}
      <div className="border-b border-cosmos-700/50 bg-cosmos-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-cosmos-700 rounded-lg text-cosmos-400 hover:text-white transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">记忆驾驶舱</h1>
                <p className="text-cosmos-400 text-sm">Memory Dashboard</p>
              </div>
            </div>
            
            <button
              onClick={() => userId && loadDashboardData(userId)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-cosmos-700 hover:bg-cosmos-600 text-white rounded-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Memory Battery */}
            <div className="bg-cosmos-800/50 backdrop-blur-sm rounded-2xl border border-cosmos-700/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${getBatteryBg(battery)}`}>
                  <Battery className={`w-6 h-6 ${getBatteryColor(battery)}`} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">记忆电量</h3>
                  <p className="text-cosmos-400 text-sm">Memory Battery</p>
                </div>
              </div>
              
              <div className="text-center py-6">
                <div className={`text-6xl font-bold ${getBatteryColor(battery)} mb-2`}>
                  {battery}%
                </div>
                <p className="text-cosmos-400 text-sm">
                  {battery >= 80 ? '状态极佳！' : battery >= 60 ? '保持学习' : '需要复习'}
                </p>
              </div>
              
              {/* Battery bar */}
              <div className="w-full h-3 bg-cosmos-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${
                    battery >= 80 ? 'from-green-500 to-green-400' :
                    battery >= 60 ? 'from-yellow-500 to-yellow-400' :
                    'from-red-500 to-red-400'
                  } transition-all duration-500`}
                  style={{ width: `${battery}%` }}
                />
              </div>
            </div>
            
            {/* Memory Layers */}
            <div className="bg-cosmos-800/50 backdrop-blur-sm rounded-2xl border border-cosmos-700/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20">
                  <Layers className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">记忆沉淀层</h3>
                  <p className="text-cosmos-400 text-sm">Memory Layers</p>
                </div>
              </div>
              
              {latestLayer ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 text-sm">永久记忆 {'>'}30天</span>
                    <span className="text-white font-semibold">{latestLayer.permanent}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 text-sm">熟悉区 (1-30天)</span>
                    <span className="text-white font-semibold">{latestLayer.familiar}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 text-sm">新词区 {'<'}1天</span>
                    <span className="text-white font-semibold">{latestLayer.new}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-cosmos-700">
                    <div className="flex items-center justify-between">
                      <span className="text-cosmos-400 text-sm">总计</span>
                      <span className="text-white font-bold text-lg">
                        {latestLayer.permanent + latestLayer.familiar + latestLayer.new}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-cosmos-400">
                  暂无数据
                </div>
              )}
            </div>
            
            {/* Review Forecast */}
            <div className="bg-cosmos-800/50 backdrop-blur-sm rounded-2xl border border-cosmos-700/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                  <Waves className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">未来复习潮汐</h3>
                  <p className="text-cosmos-400 text-sm">Review Forecast</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {tideData.slice(0, 7).map((tide, index) => {
                  const date = new Date(tide.date)
                  const dayName = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
                  const color = tide.count > 100 ? 'bg-red-500' : 
                               tide.count > 50 ? 'bg-yellow-500' : 'bg-green-500'
                  
                  return (
                    <div key={tide.date} className="flex items-center gap-3">
                      <span className="text-cosmos-400 text-sm w-12">
                        {tide.isToday ? '今天' : dayName}
                      </span>
                      <div className="flex-1 h-8 bg-cosmos-700 rounded-lg overflow-hidden">
                        <div 
                          className={`h-full ${color} transition-all duration-500 flex items-center justify-end px-2`}
                          style={{ width: `${Math.min(100, (tide.count / 150) * 100)}%` }}
                        >
                          {tide.count > 0 && (
                            <span className="text-white text-xs font-semibold">{tide.count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Forgetting Savings */}
            <div className="bg-cosmos-800/50 backdrop-blur-sm rounded-2xl border border-cosmos-700/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">遗忘对抗赛</h3>
                  <p className="text-cosmos-400 text-sm">Forgetting Savings</p>
                </div>
              </div>
              
              <div className="text-center py-6">
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  {totalSavings}
                </div>
                <p className="text-cosmos-400 text-sm mb-4">
                  挽回的记忆财富
                </p>
                <p className="text-cosmos-500 text-xs">
                  通过复习，你比不复习多记住了 {totalSavings} 个单词
                </p>
              </div>
            </div>
            
            {/* Focus Pattern */}
            <div className="bg-cosmos-800/50 backdrop-blur-sm rounded-2xl border border-cosmos-700/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">专注时刻</h3>
                  <p className="text-cosmos-400 text-sm">Focus Pattern</p>
                </div>
              </div>
              
              {bestHour ? (
                <div className="text-center py-6">
                  <div className="text-5xl font-bold text-orange-400 mb-2">
                    {bestHour.hour}:00
                  </div>
                  <p className="text-cosmos-400 text-sm mb-4">
                    你的最佳学习时段
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div>
                      <div className="text-white font-semibold">
                        {(bestHour.accuracy * 100).toFixed(0)}%
                      </div>
                      <div className="text-cosmos-500">准确率</div>
                    </div>
                    <div className="w-px h-8 bg-cosmos-700" />
                    <div>
                      <div className="text-white font-semibold">
                        {bestHour.sessionCount}
                      </div>
                      <div className="text-cosmos-500">学习次数</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-cosmos-400">
                  继续学习以分析你的专注时刻
                </div>
              )}
            </div>
            
            {/* Quick Stats */}
            <div className="bg-cosmos-800/50 backdrop-blur-sm rounded-2xl border border-cosmos-700/50 p-6">
              <h3 className="text-white font-semibold mb-4">快速统计</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-cosmos-700/30 rounded-lg">
                  <span className="text-cosmos-400 text-sm">今日待复习</span>
                  <span className="text-white font-semibold">
                    {tideData[0]?.count || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-cosmos-700/30 rounded-lg">
                  <span className="text-cosmos-400 text-sm">本周复习量</span>
                  <span className="text-white font-semibold">
                    {tideData.reduce((sum, tide) => sum + tide.count, 0)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-cosmos-700/30 rounded-lg">
                  <span className="text-cosmos-400 text-sm">学习会话</span>
                  <span className="text-white font-semibold">
                    {focusData.reduce((sum, hour) => sum + hour.sessionCount, 0)}
                  </span>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  )
}
