'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Star, TrendingUp, Clock, Target, Zap, BookOpen, Award, 
  Calendar, RefreshCw, ArrowLeft, Flame, CheckCircle, Brain, Battery, BarChart3
} from 'lucide-react'
import Link from 'next/link'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import './chart-styles.css'

function parseStoredJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

// 学习数据类型
interface LearningData {
  // 单词统计
  totalWords: number
  masteredWords: number
  learningWords: number
  needReviewWords: number
  // 学习时间
  todayStudyTime: number
  weekStudyTime: number
  totalStudyTime: number
  // 学习记录
  todayCompleted: number
  todayCorrect: number
  todayWrong: number
  accuracy: number
  streak: number
  // 成就
  achievements: Array<{
    id: string
    title: string
    progress: number
    unlocked: boolean
  }>
  // 图表数据
  memoryData: Array<{
    word: string
    retention: number
    difficulty: number
    nextReview: string
  }>
  vocabularyData: Array<{
    date: string
    mastered: number
    learning: number
    total: number
  }>
  heatmapData: Array<{
    date: string
    count: number
    level: number
  }>
}

export default function GrowthStarMapPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<LearningData | null>(null)
  const [userName, setUserName] = useState('')
  const [chartsReady, setChartsReady] = useState(false)
  const memoryChartRef = useRef<HTMLDivElement>(null)
  const vocabularyChartRef = useRef<HTMLDivElement>(null)
  const [memoryChartWidth, setMemoryChartWidth] = useState(0)
  const [vocabularyChartWidth, setVocabularyChartWidth] = useState(0)

  // 直接从localStorage获取数据
  useEffect(() => {
    setMounted(true)
    
    // 获取用户信息
    const userStr = localStorage.getItem('wenya_user')
    let userId = 'demo-user'
    
    if (userStr) {
      const user = parseStoredJson<{ id?: string; username?: string } | null>(userStr, null)
      if (user?.id) {
        userId = user.id
        setUserName(user.username || '学习者')
      } else {
        localStorage.removeItem('wenya_user')
      }
    }

    // 直接从localStorage获取数据
    const loadData = () => {
      // 获取用户单词记录
      const userWordsStr = localStorage.getItem(`wenya_user_words_${userId}`)
      const enhancedWordsStr = localStorage.getItem(`wenya_enhanced_words_${userId}`)
      const userWords = parseStoredJson<any[]>(userWordsStr, [])
      const enhancedWords = parseStoredJson<any[]>(enhancedWordsStr, [])
      const allWords = [...userWords, ...enhancedWords]

      // 计算单词统计
      const now = new Date()
      const totalWords = allWords.length
      const masteredWords = allWords.filter((w: any) => w.interval >= 7).length
      const learningWords = allWords.filter((w: any) => w.interval > 0 && w.interval < 7).length
      const needReviewWords = allWords.filter((w: any) => new Date(w.nextReviewTime) <= now).length

      // 获取今日学习统计
      const today = new Date().toISOString().split('T')[0]
      const sessionStr = localStorage.getItem(`wenya_study_session_${userId}_${today}`)
      const enhancedStatsStr = localStorage.getItem(`wenya_enhanced_stats_${userId}_${today}`)
      
      let todayCompleted = 0
      let todayCorrect = 0
      let todayWrong = 0
      let todayStudyTime = 0

      if (sessionStr) {
        const session = parseStoredJson<any>(sessionStr, {})
        todayCompleted += session.totalWords || 0
        todayCorrect += session.correctCount || 0
        todayWrong += session.wrongCount || 0
        todayStudyTime += session.studyTime || 0
      }

      if (enhancedStatsStr) {
        const stats = parseStoredJson<any>(enhancedStatsStr, {})
        todayCompleted += stats.todayWords || 0
        todayCorrect += stats.todayCorrect || 0
        todayWrong += stats.todayWrong || 0
      }

      // 计算正确率
      const accuracy = todayCompleted > 0 
        ? Math.round((todayCorrect / todayCompleted) * 100) 
        : 0

      // 计算连续学习天数
      let streak = 0
      for (let i = 0; i < 365; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const daySession = localStorage.getItem(`wenya_study_session_${userId}_${dateStr}`)
        const dayStats = localStorage.getItem(`wenya_enhanced_stats_${userId}_${dateStr}`)
        
        let dayTotal = 0
        if (daySession) {
          const s = parseStoredJson<any>(daySession, {})
          dayTotal += s.totalWords || 0
        }
        if (dayStats) {
          const s = parseStoredJson<any>(dayStats, {})
          dayTotal += s.todayWords || 0
        }
        
        if (dayTotal > 0) {
          streak++
        } else if (i > 0) {
          break
        }
      }

      // 计算本周学习时间
      let weekStudyTime = 0
      for (let i = 0; i < 7; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const daySession = localStorage.getItem(`wenya_study_session_${userId}_${dateStr}`)
        if (daySession) {
          const s = parseStoredJson<any>(daySession, {})
          weekStudyTime += s.studyTime || 0
        }
      }

      // 获取总学习时间
      const smartDataStr = localStorage.getItem(`wenya_smart_learning_${userId}`)
      let totalStudyTime = weekStudyTime
      if (smartDataStr) {
        const smartData = parseStoredJson<any>(smartDataStr, {})
        totalStudyTime = smartData.totalStudyTime || weekStudyTime
      }

      // 生成记忆遗忘曲线数据
      const memoryData = allWords.slice(0, 10).map((word: any, index: number) => ({
        word: `Word ${index + 1}`,
        retention: Math.max(20, 100 - (word.interval || 1) * 5 + Math.random() * 20),
        difficulty: word.quality === 0 ? 80 : word.quality === 1 ? 50 : 20,
        nextReview: new Date(word.nextReviewTime || Date.now()).toLocaleDateString()
      }))

      // 生成词汇累积数据（过去30天）
      const vocabularyData = []
      let cumulativeMastered = 0
      let cumulativeLearning = 0
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        // 模拟每日新增数据
        const dailyMastered = Math.floor(Math.random() * 3) + (i < 7 ? 2 : 1)
        const dailyLearning = Math.floor(Math.random() * 5) + 2
        
        cumulativeMastered += dailyMastered
        cumulativeLearning += dailyLearning
        
        vocabularyData.push({
          date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          mastered: Math.min(cumulativeMastered, masteredWords),
          learning: Math.min(cumulativeLearning, learningWords),
          total: Math.min(cumulativeMastered + cumulativeLearning, totalWords)
        })
      }

      // 生成学习热力图数据（过去365天）
      const heatmapData = []
      for (let i = 364; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const daySession = localStorage.getItem(`wenya_study_session_${userId}_${dateStr}`)
        let count = 0
        if (daySession) {
          const s = parseStoredJson<any>(daySession, {})
          count = s.totalWords || 0
        }
        
        // 如果没有真实数据，生成一些模拟数据
        if (count === 0 && Math.random() > 0.7) {
          count = Math.floor(Math.random() * 20) + 1
        }
        
        let level = 0
        if (count > 0) level = 1
        if (count > 5) level = 2
        if (count > 10) level = 3
        if (count > 20) level = 4
        
        heatmapData.push({
          date: dateStr,
          count,
          level
        })
      }

      // 生成成就数据
      const achievements = [
        {
          id: 'first-10',
          title: '初识单词',
          progress: Math.min(100, (totalWords / 10) * 100),
          unlocked: totalWords >= 10
        },
        {
          id: 'master-50',
          title: '单词达人',
          progress: Math.min(100, (masteredWords / 50) * 100),
          unlocked: masteredWords >= 50
        },
        {
          id: 'streak-7',
          title: '坚持一周',
          progress: Math.min(100, (streak / 7) * 100),
          unlocked: streak >= 7
        },
        {
          id: 'streak-30',
          title: '坚持一月',
          progress: Math.min(100, (streak / 30) * 100),
          unlocked: streak >= 30
        },
        {
          id: 'accuracy-90',
          title: '精准学习',
          progress: accuracy,
          unlocked: accuracy >= 90 && todayCompleted >= 10
        }
      ]

      setData({
        totalWords,
        masteredWords,
        learningWords,
        needReviewWords,
        todayStudyTime,
        weekStudyTime,
        totalStudyTime,
        todayCompleted,
        todayCorrect,
        todayWrong,
        accuracy,
        streak,
        achievements,
        memoryData,
        vocabularyData,
        heatmapData
      })
    }

    loadData()
  }, [])

  useEffect(() => {
    if (!data) return

    const updateSizes = () => {
      setMemoryChartWidth(Math.floor(memoryChartRef.current?.clientWidth || 0))
      setVocabularyChartWidth(Math.floor(vocabularyChartRef.current?.clientWidth || 0))
      setChartsReady(true)
    }

    updateSizes()
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateSizes) : null
    if (observer) {
      if (memoryChartRef.current) observer.observe(memoryChartRef.current)
      if (vocabularyChartRef.current) observer.observe(vocabularyChartRef.current)
    }
    window.addEventListener('resize', updateSizes)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updateSizes)
    }
  }, [data])

  if (!mounted || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900 flex items-center justify-center">
        <div className="text-center">
          <Star className="w-16 h-16 text-star-400 animate-pulse mx-auto mb-4" />
          <p className="text-cosmos-300">加载中...</p>
        </div>
      </div>
    )
  }

  // 记忆遗忘曲线图表组件
  const MemoryRetentionChart = () => (
    <div className="cosmos-card p-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Battery className="w-5 h-5 text-sprout-400" />
        记忆遗忘曲线
      </h2>
      <div ref={memoryChartRef} className="h-80 min-w-0 overflow-hidden">
        {chartsReady && memoryChartWidth > 0 && data.memoryData.length > 0 ? (
            <LineChart width={memoryChartWidth} height={320} data={data.memoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="word"
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Line
                type="monotone"
                dataKey="retention"
                stroke="#22C55E"
                strokeWidth={3}
                dot={{ fill: '#22C55E', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: '#16A34A' }}
              />
            </LineChart>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-cosmos-700/60 bg-cosmos-800/30 text-sm text-cosmos-400">
            完成一次背单词后，这里会生成记忆曲线。
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-sprout-400 font-bold text-lg">
            {data.memoryData.length > 0 ? Math.round(data.memoryData.reduce((acc, item) => acc + item.retention, 0) / data.memoryData.length) : 0}%
          </div>
          <div className="text-cosmos-400">平均记忆率</div>
        </div>
        <div className="text-center">
          <div className="text-orange-400 font-bold text-lg">
            {data.memoryData.filter(item => item.retention < 60).length}
          </div>
          <div className="text-cosmos-400">需要复习</div>
        </div>
        <div className="text-center">
          <div className="text-cyan-400 font-bold text-lg">
            {data.memoryData.filter(item => item.retention >= 80).length}
          </div>
          <div className="text-cosmos-400">记忆牢固</div>
        </div>
      </div>
    </div>
  )

  // 词汇累积堆叠图组件
  const VocabularyAccumulationChart = () => (
    <div className="cosmos-card p-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-star-400" />
        词汇累积趋势
      </h2>
      <div ref={vocabularyChartRef} className="h-80 min-w-0 overflow-hidden">
        {chartsReady && vocabularyChartWidth > 0 && data.vocabularyData.length > 0 ? (
            <AreaChart width={vocabularyChartWidth} height={320} data={data.vocabularyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="mastered"
                stackId="1"
                stroke="#22C55E"
                fill="#22C55E"
                fillOpacity={0.8}
                name="已掌握"
              />
              <Area
                type="monotone"
                dataKey="learning"
                stackId="1"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.6}
                name="学习中"
              />
            </AreaChart>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-cosmos-700/60 bg-cosmos-800/30 text-sm text-cosmos-400">
            词汇积累会随学习记录更新。
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-sprout-400 rounded-full"></div>
          <span className="text-cosmos-300">已掌握单词</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <span className="text-cosmos-300">学习中单词</span>
        </div>
      </div>
    </div>
  )

  // 学习热力图组件
  const StudyHeatmap = () => {
    const getHeatmapColor = (level: number) => {
      const colors = [
        '#1F2937', // 0: 无活动
        '#064E3B', // 1: 低活动
        '#065F46', // 2: 中等活动
        '#047857', // 3: 高活动
        '#059669'  // 4: 非常高活动
      ]
      return colors[level] || colors[0]
    }

    // 按周分组数据
    const weeks = []
    for (let i = 0; i < data.heatmapData.length; i += 7) {
      weeks.push(data.heatmapData.slice(i, i + 7))
    }

    return (
      <div className="cosmos-card p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          学习热力图
        </h2>
        <div className="overflow-x-auto">
          <div className="flex gap-1 mb-4" style={{ minWidth: '800px' }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-sprout-400 transition-all heatmap-cell"
                    style={{ backgroundColor: getHeatmapColor(day.level) }}
                    title={`${day.date}: ${day.count} 个单词`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-cosmos-400">过去一年的学习活动</span>
          <div className="flex items-center gap-2">
            <span className="text-cosmos-500 text-xs">少</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: getHeatmapColor(level) }}
                />
              ))}
            </div>
            <span className="text-cosmos-500 text-xs">多</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-purple-400 font-bold text-lg">
              {data.heatmapData.filter(d => d.count > 0).length}
            </div>
            <div className="text-cosmos-400">活跃天数</div>
          </div>
          <div className="text-center">
            <div className="text-star-400 font-bold text-lg">
              {Math.round(data.heatmapData.reduce((acc, d) => acc + d.count, 0) / 365 * 7)}
            </div>
            <div className="text-cosmos-400">周平均</div>
          </div>
          <div className="text-center">
            <div className="text-sprout-400 font-bold text-lg">
              {Math.max(...data.heatmapData.map(d => d.count))}
            </div>
            <div className="text-cosmos-400">单日最高</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 glass">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-cosmos-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-star-400 to-sprout-400 bg-clip-text text-transparent">
            成长星图
          </h1>
          <button
            onClick={() => window.location.reload()}
            className="p-2 text-cosmos-400 hover:text-white transition-colors"
            aria-label="刷新成长星图数据"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 欢迎横幅 */}
        <div className="star-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-star-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {userName ? `${userName}的成长星图` : '我的成长星图'}
              </h2>
              <p className="text-cosmos-300">
                {data.streak > 0 
                  ? `🔥 已连续学习 ${data.streak} 天，继续保持！` 
                  : '开始你的学习之旅吧！'}
              </p>
            </div>
          </div>
        </div>

        {/* 核心数据 - 4个卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 已掌握单词 */}
          <div className="sprout-card p-5">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-8 h-8 text-sprout-400" />
              <span className="text-3xl font-bold text-white">{data.masteredWords}</span>
            </div>
            <h3 className="text-cosmos-300 text-sm">已掌握单词</h3>
            <div className="mt-2 w-full bg-cosmos-700 rounded-full h-2">
              <div 
                className="bg-sprout-400 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (data.masteredWords / Math.max(data.totalWords, 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* 学习准确率 */}
          <div className="star-card p-5">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 text-star-400" />
              <span className="text-3xl font-bold text-white">{data.accuracy}%</span>
            </div>
            <h3 className="text-cosmos-300 text-sm">今日准确率</h3>
            <div className="mt-2 w-full bg-cosmos-700 rounded-full h-2">
              <div 
                className="bg-star-400 h-2 rounded-full transition-all"
                style={{ width: `${data.accuracy}%` }}
              />
            </div>
          </div>

          {/* 连续学习 */}
          <div className="cosmos-card p-5 border-2 border-orange-500/30">
            <div className="flex items-center justify-between mb-3">
              <Flame className="w-8 h-8 text-orange-400" />
              <span className="text-3xl font-bold text-white">{data.streak}</span>
            </div>
            <h3 className="text-cosmos-300 text-sm">连续学习天数</h3>
            <div className="mt-2 flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded ${
                    i < Math.min(data.streak, 7) ? 'bg-orange-400' : 'bg-cosmos-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 今日学习 */}
          <div className="cosmos-card p-5">
            <div className="flex items-center justify-between mb-3">
              <Target className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{data.todayCompleted}</span>
            </div>
            <h3 className="text-cosmos-300 text-sm">今日已学单词</h3>
            <div className="mt-2 text-xs text-cosmos-400">
              ✓ {data.todayCorrect} 认识 · ✗ {data.todayWrong} 不认识
            </div>
          </div>
        </div>

        {/* 可视化图表区域 */}
        <div className="space-y-6">
          {/* 记忆遗忘曲线 */}
          <MemoryRetentionChart />
          
          {/* 词汇累积趋势和学习热力图 */}
          <div className="grid lg:grid-cols-2 gap-6">
            <VocabularyAccumulationChart />
            <StudyHeatmap />
          </div>
        </div>

        {/* 学习状态详情 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 单词学习状态 */}
          <div className="cosmos-card p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sprout-400" />
              单词学习状态
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-cosmos-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-400 rounded-full" />
                  <span className="text-cosmos-300">待复习</span>
                </div>
                <span className="text-2xl font-bold text-orange-400">{data.needReviewWords}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-cosmos-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <span className="text-cosmos-300">学习中</span>
                </div>
                <span className="text-2xl font-bold text-yellow-400">{data.learningWords}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-cosmos-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-sprout-400 rounded-full" />
                  <span className="text-cosmos-300">已掌握</span>
                </div>
                <span className="text-2xl font-bold text-sprout-400">{data.masteredWords}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-cosmos-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cosmos-400 rounded-full" />
                  <span className="text-cosmos-300">总单词数</span>
                </div>
                <span className="text-2xl font-bold text-white">{data.totalWords}</span>
              </div>
            </div>
            <Link href="/study" className="btn-sprout w-full mt-4 flex items-center justify-center gap-2">
              <Brain className="w-5 h-5" />
              开始学习
            </Link>
          </div>

          {/* 学习时间统计 */}
          <div className="cosmos-card p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              学习时间统计
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-cosmos-800/50 rounded-xl">
                <span className="text-cosmos-300">今日学习</span>
                <span className="text-2xl font-bold text-blue-400">
                  {Math.floor(data.todayStudyTime / 60)} 分钟
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-cosmos-800/50 rounded-xl">
                <span className="text-cosmos-300">本周学习</span>
                <span className="text-2xl font-bold text-purple-400">
                  {Math.floor(data.weekStudyTime / 60)} 分钟
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-cosmos-800/50 rounded-xl">
                <span className="text-cosmos-300">累计学习</span>
                <span className="text-2xl font-bold text-star-400">
                  {Math.floor(data.totalStudyTime / 3600)} 小时
                </span>
              </div>
            </div>

            {/* 学习建议 */}
            <div className="mt-4 p-4 bg-gradient-to-r from-star-500/10 to-sprout-500/10 rounded-xl border border-star-400/20">
              <h3 className="text-white font-medium mb-2">💡 学习建议</h3>
              {data.needReviewWords > 0 ? (
                <p className="text-cosmos-300 text-sm">
                  你有 <span className="text-orange-400 font-bold">{data.needReviewWords}</span> 个单词需要复习，建议先完成复习再学习新词。
                </p>
              ) : data.accuracy < 70 && data.todayCompleted > 0 ? (
                <p className="text-cosmos-300 text-sm">
                  今日正确率较低，建议放慢节奏，多复习已学内容。
                </p>
              ) : (
                <p className="text-cosmos-300 text-sm">
                  继续保持学习节奏，每天坚持学习效果更好！
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 成就系统 */}
        <div className="cosmos-card p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-star-400" />
            成就徽章
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {data.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl text-center transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-star-500/30 to-yellow-500/20 border-2 border-star-400'
                    : 'bg-cosmos-800/30 border border-cosmos-700'
                }`}
              >
                <div className="text-4xl mb-2">
                  {achievement.unlocked ? '🏆' : '🔒'}
                </div>
                <div className={`text-sm font-medium mb-2 ${achievement.unlocked ? 'text-white' : 'text-cosmos-400'}`}>
                  {achievement.title}
                </div>
                <div className="w-full bg-cosmos-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      achievement.unlocked ? 'bg-star-400' : 'bg-cosmos-500'
                    }`}
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
                <div className="text-xs text-cosmos-400 mt-1">
                  {Math.round(achievement.progress)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/study" className="btn-sprout py-4 flex items-center justify-center gap-2">
            <Brain className="w-5 h-5" />
            背单词
          </Link>
          <Link href="/lesson" className="btn-star py-4 flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5" />
            学课程
          </Link>
          <Link href="/quiz" className="btn-cosmos py-4 flex items-center justify-center gap-2">
            <Target className="w-5 h-5" />
            做练习
          </Link>
          <Link href="/dashboard" className="btn-cosmos py-4 flex items-center justify-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
