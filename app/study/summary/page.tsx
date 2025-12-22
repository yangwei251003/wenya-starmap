'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  ArrowLeft, Home, Play, Sparkles, Trophy, Target, 
  Flame, Clock, TrendingUp, Star, Zap
} from 'lucide-react'
import { Card } from '@/components/ui/Card'

// 学习结果数据接口
interface StudyResult {
  totalWords: number
  correctCount: number
  wrongCount: number
  newWords: number
  reviewedWords: number
  studyTime: number // 秒
  streak: number
}

export default function StudySummaryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [result, setResult] = useState<StudyResult | null>(null)
  const [showPlant, setShowPlant] = useState(false)
  const [animatedStats, setAnimatedStats] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 计算准确率
  const accuracy = result ? Math.round((result.correctCount / Math.max(result.totalWords, 1)) * 100) : 0

  useEffect(() => {
    setMounted(true)
    
    // 从 URL 参数或 localStorage 获取学习结果
    const correct = parseInt(searchParams.get('correct') || '0')
    const wrong = parseInt(searchParams.get('wrong') || '0')
    const newW = parseInt(searchParams.get('new') || '0')
    const review = parseInt(searchParams.get('review') || '0')
    const time = parseInt(searchParams.get('time') || '0')
    const streak = parseInt(searchParams.get('streak') || '0')

    // 如果 URL 没有参数，从 localStorage 获取
    if (correct === 0 && wrong === 0) {
      const user = localStorage.getItem('wenya_user')
      if (user) {
        const userData = JSON.parse(user)
        const today = new Date().toISOString().split('T')[0]
        const sessionKey = `wenya_study_session_${userData.id}_${today}`
        const session = localStorage.getItem(sessionKey)
        if (session) {
          const sessionData = JSON.parse(session)
          setResult({
            totalWords: sessionData.totalWords || 0,
            correctCount: sessionData.correctCount || 0,
            wrongCount: sessionData.wrongCount || 0,
            newWords: sessionData.newWords || 0,
            reviewedWords: sessionData.reviewedWords || 0,
            studyTime: sessionData.studyTime || 0,
            streak: streak || 1
          })
        }
      }
    } else {
      setResult({
        totalWords: correct + wrong,
        correctCount: correct,
        wrongCount: wrong,
        newWords: newW,
        reviewedWords: review,
        studyTime: time,
        streak: streak
      })
    }

    // 延迟显示动画
    setTimeout(() => setShowPlant(true), 500)
    setTimeout(() => setAnimatedStats(true), 1000)
  }, [searchParams])

  // 绘制植物生长动画
  useEffect(() => {
    if (!showPlant || !canvasRef.current || !result) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 根据准确率决定植物类型
    const isTree = accuracy >= 80
    
    let progress = 0
    const animate = () => {
      progress += 0.02
      if (progress > 1) progress = 1

      ctx.clearRect(0, 0, width, height)

      if (isTree) {
        drawGlowingTree(ctx, width / 2, height - 20, progress, accuracy)
      } else {
        drawSprout(ctx, width / 2, height - 20, progress)
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [showPlant, result, accuracy])

  // 绘制发光的树
  const drawGlowingTree = (ctx: CanvasRenderingContext2D, x: number, y: number, progress: number, acc: number) => {
    const maxHeight = 180 * progress
    const branches = Math.floor(acc / 20) // 准确率越高，分支越多

    // 发光效果
    ctx.shadowColor = '#22c55e'
    ctx.shadowBlur = 20

    // 树干
    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x, y - maxHeight * 0.4)
    ctx.stroke()

    // 递归绘制分支
    const drawBranch = (startX: number, startY: number, length: number, angle: number, depth: number) => {
      if (depth === 0 || length < 10) return

      const endX = startX + Math.cos(angle) * length
      const endY = startY + Math.sin(angle) * length

      // 分支颜色渐变
      const gradient = ctx.createLinearGradient(startX, startY, endX, endY)
      gradient.addColorStop(0, depth > 2 ? '#8B4513' : '#22c55e')
      gradient.addColorStop(1, '#22c55e')

      ctx.strokeStyle = gradient
      ctx.lineWidth = depth * 1.5
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.stroke()

      // 叶子
      if (depth <= 2) {
        ctx.fillStyle = `rgba(34, 197, 94, ${0.6 + Math.random() * 0.4})`
        ctx.beginPath()
        ctx.arc(endX, endY, 8 + Math.random() * 6, 0, Math.PI * 2)
        ctx.fill()
      }

      // 递归绘制子分支
      const branchAngle = 0.4 + Math.random() * 0.3
      drawBranch(endX, endY, length * 0.7, angle - branchAngle, depth - 1)
      drawBranch(endX, endY, length * 0.7, angle + branchAngle, depth - 1)
    }

    // 从树干顶部开始绘制分支
    const trunkTop = y - maxHeight * 0.4
    for (let i = 0; i < branches; i++) {
      const branchY = trunkTop + (maxHeight * 0.3 * i / branches)
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5
      drawBranch(x, branchY, 40 + Math.random() * 20, angle - 0.5, 3)
      drawBranch(x, branchY, 40 + Math.random() * 20, angle + 0.5, 3)
    }

    // 顶部主分支
    drawBranch(x, trunkTop, 60, -Math.PI / 2, 4)

    // 星星装饰（高准确率）
    if (acc >= 90) {
      ctx.shadowColor = '#facc15'
      ctx.shadowBlur = 15
      ctx.fillStyle = '#facc15'
      for (let i = 0; i < 5; i++) {
        const starX = x + (Math.random() - 0.5) * 100
        const starY = y - maxHeight * 0.3 - Math.random() * maxHeight * 0.5
        drawStar(ctx, starX, starY, 5, 3)
      }
    }

    ctx.shadowBlur = 0
  }

  // 绘制萌芽
  const drawSprout = (ctx: CanvasRenderingContext2D, x: number, y: number, progress: number) => {
    const height = 80 * progress

    // 发光效果
    ctx.shadowColor = '#86efac'
    ctx.shadowBlur = 10

    // 茎
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + 10, y - height / 2, x, y - height)
    ctx.stroke()

    // 叶子
    if (progress > 0.3) {
      ctx.fillStyle = '#86efac'
      // 左叶
      ctx.beginPath()
      ctx.ellipse(x - 15, y - height * 0.6, 20 * progress, 10 * progress, -0.3, 0, Math.PI * 2)
      ctx.fill()
      // 右叶
      ctx.beginPath()
      ctx.ellipse(x + 15, y - height * 0.7, 20 * progress, 10 * progress, 0.3, 0, Math.PI * 2)
      ctx.fill()
    }

    // 顶部嫩芽
    if (progress > 0.6) {
      ctx.fillStyle = '#4ade80'
      ctx.beginPath()
      ctx.ellipse(x, y - height - 5, 8 * progress, 15 * progress, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.shadowBlur = 0
  }

  // 绘制星星
  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number) => {
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const outerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2
      const innerAngle = outerAngle + Math.PI / 5
      if (i === 0) {
        ctx.moveTo(cx + Math.cos(outerAngle) * outerR, cy + Math.sin(outerAngle) * outerR)
      } else {
        ctx.lineTo(cx + Math.cos(outerAngle) * outerR, cy + Math.sin(outerAngle) * outerR)
      }
      ctx.lineTo(cx + Math.cos(innerAngle) * innerR, cy + Math.sin(innerAngle) * innerR)
    }
    ctx.closePath()
    ctx.fill()
  }

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}分${secs}秒`
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-cosmos-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900 flex flex-col">
      {/* 顶部工具栏 */}
      <div className="fixed top-4 left-0 right-0 px-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 bg-cosmos-800/80 hover:bg-cosmos-700 rounded-lg text-cosmos-400 hover:text-white transition-all backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-star-400" />
            学习总结
          </h1>
          <div className="w-9" />
        </div>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-20">
        {/* 植物动画区域 */}
        <div className="relative mb-8">
          <canvas
            ref={canvasRef}
            width={300}
            height={250}
            className="mx-auto"
          />
          {/* 准确率显示 */}
          {showPlant && (
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-cosmos-800/90 backdrop-blur-sm rounded-full border border-cosmos-600">
              <span className={`text-2xl font-bold ${accuracy >= 80 ? 'text-sprout-400' : accuracy >= 60 ? 'text-star-400' : 'text-orange-400'}`}>
                {accuracy}%
              </span>
              <span className="text-cosmos-400 ml-2">准确率</span>
            </div>
          )}
        </div>

        {/* 成就提示 */}
        {accuracy >= 80 && (
          <div className="mb-6 px-6 py-3 bg-gradient-to-r from-sprout-500/20 to-star-500/20 rounded-full border border-sprout-400/30 animate-fade-in-up">
            <p className="text-sprout-400 font-medium flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              {accuracy >= 90 ? '🌟 完美表现！你的知识之树茁壮成长！' : '🌱 表现优秀！继续保持！'}
            </p>
          </div>
        )}

        {/* 数据面板 */}
        {result && animatedStats && (
          <div className="w-full max-w-2xl space-y-4 animate-fade-in-up">
            {/* 主要统计 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center bg-cosmos-800/50">
                <div className="w-12 h-12 bg-cyan-400/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Target className="w-6 h-6 text-cyan-400" />
                </div>
                <p className="text-3xl font-bold text-white animate-count-up">{result.totalWords}</p>
                <p className="text-cosmos-400 text-sm">总单词数</p>
              </Card>

              <Card className="p-4 text-center bg-cosmos-800/50">
                <div className="w-12 h-12 bg-sprout-400/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-sprout-400" />
                </div>
                <p className="text-3xl font-bold text-sprout-400 animate-count-up">+{result.newWords}</p>
                <p className="text-cosmos-400 text-sm">新增词汇</p>
              </Card>

              <Card className="p-4 text-center bg-cosmos-800/50">
                <div className="w-12 h-12 bg-orange-400/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Flame className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-orange-400 animate-count-up">{result.streak}</p>
                <p className="text-cosmos-400 text-sm">连续天数</p>
              </Card>

              <Card className="p-4 text-center bg-cosmos-800/50">
                <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-purple-400">{formatTime(result.studyTime)}</p>
                <p className="text-cosmos-400 text-sm">专注时长</p>
              </Card>
            </div>

            {/* 记忆曲线图 */}
            <Card className="p-6 bg-cosmos-800/50">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-star-400" />
                今日学习曲线
              </h3>
              <div className="h-32 flex items-end justify-between gap-2">
                {[...Array(10)].map((_, i) => {
                  const height = 20 + Math.random() * 60 + (i * 5)
                  const isCorrect = Math.random() > 0.3
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-lg transition-all duration-500 ${
                        isCorrect ? 'bg-gradient-to-t from-sprout-500 to-sprout-400' : 'bg-gradient-to-t from-red-500 to-red-400'
                      }`}
                      style={{ 
                        height: `${height}%`,
                        animationDelay: `${i * 100}ms`
                      }}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between mt-2 text-cosmos-500 text-xs">
                <span>开始</span>
                <span>结束</span>
              </div>
            </Card>

            {/* 详细统计 */}
            <Card className="p-6 bg-cosmos-800/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-cosmos-700/30 rounded-lg">
                  <span className="text-cosmos-400">正确</span>
                  <span className="text-sprout-400 font-bold">{result.correctCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-cosmos-700/30 rounded-lg">
                  <span className="text-cosmos-400">需复习</span>
                  <span className="text-red-400 font-bold">{result.wrongCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-cosmos-700/30 rounded-lg">
                  <span className="text-cosmos-400">新词</span>
                  <span className="text-cyan-400 font-bold">{result.newWords}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-cosmos-700/30 rounded-lg">
                  <span className="text-cosmos-400">复习</span>
                  <span className="text-purple-400 font-bold">{result.reviewedWords}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-4 mt-8 w-full max-w-md">
          <button
            onClick={() => router.push('/study')}
            className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            继续探索
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 py-4 bg-cosmos-700 hover:bg-cosmos-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            返回驾驶舱
          </button>
        </div>
      </div>

      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-star-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.5 + 0.2
            }}
          />
        ))}
      </div>
    </div>
  )
}
