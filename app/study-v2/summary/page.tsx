'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Award, Star, TrendingUp, Target, Clock, Flame, ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { smartLearningService } from '@/lib/smart-learning-service'

export default function StudySummaryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState('')

  // 从URL获取统计数据
  const groupsCompleted = parseInt(searchParams.get('groups') || '1')
  const wordsLearned = parseInt(searchParams.get('words') || '0')
  const correctCount = parseInt(searchParams.get('correct') || '0')
  const wrongCount = parseInt(searchParams.get('wrong') || '0')
  const studyTime = parseInt(searchParams.get('time') || '0')
  const streak = parseInt(searchParams.get('streak') || '0')

  const accuracy = wordsLearned > 0 ? Math.round((correctCount / wordsLearned) * 100) : 0

  useEffect(() => {
    setMounted(true)
    const user = localStorage.getItem('wenya_user')
    if (user) {
      const userData = JSON.parse(user)
      setUserId(userData.id)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-cosmos-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* 成就图标 */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-sprout-400 to-star-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Award className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">🎉 学习完成！</h1>
          <p className="text-xl text-cosmos-300">太棒了！又完成了一组学习</p>
        </div>

        {/* 统计卡片 */}
        <div className="cosmos-card p-8 mb-6">
          {/* 主要统计 */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-sprout-500/20 to-sprout-600/10 rounded-2xl border border-sprout-400/30">
              <div className="text-5xl font-bold text-sprout-400 mb-2">{wordsLearned}</div>
              <div className="text-cosmos-300">学习单词</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-star-500/20 to-yellow-500/10 rounded-2xl border border-star-400/30">
              <div className="text-5xl font-bold text-star-400 mb-2">{accuracy}%</div>
              <div className="text-cosmos-300">正确率</div>
            </div>
          </div>

          {/* 详细统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-cosmos-800/50 rounded-xl">
              <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-2xl font-bold">{correctCount}</span>
              </div>
              <div className="text-xs text-cosmos-400">认识</div>
            </div>
            <div className="text-center p-4 bg-cosmos-800/50 rounded-xl">
              <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
                <Target className="w-5 h-5" />
                <span className="text-2xl font-bold">{wrongCount}</span>
              </div>
              <div className="text-xs text-cosmos-400">不认识</div>
            </div>
            <div className="text-center p-4 bg-cosmos-800/50 rounded-xl">
              <div className="flex items-center justify-center gap-2 text-blue-400 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-bold">{Math.floor(studyTime / 60)}</span>
              </div>
              <div className="text-xs text-cosmos-400">分钟</div>
            </div>
            <div className="text-center p-4 bg-cosmos-800/50 rounded-xl">
              <div className="flex items-center justify-center gap-2 text-orange-400 mb-2">
                <Flame className="w-5 h-5" />
                <span className="text-2xl font-bold">{streak}</span>
              </div>
              <div className="text-xs text-cosmos-400">连续天</div>
            </div>
          </div>

          {/* 鼓励语 */}
          <div className="p-4 bg-gradient-to-r from-sprout-500/10 to-star-500/10 rounded-xl border border-sprout-400/20 text-center">
            {accuracy >= 90 && (
              <p className="text-white">
                <span className="text-2xl mr-2">🌟</span>
                太厉害了！正确率超过90%，继续保持！
              </p>
            )}
            {accuracy >= 70 && accuracy < 90 && (
              <p className="text-white">
                <span className="text-2xl mr-2">👍</span>
                做得很好！继续努力，你会更棒的！
              </p>
            )}
            {accuracy < 70 && (
              <p className="text-white">
                <span className="text-2xl mr-2">💪</span>
                不错的开始！多复习几次会更好！
              </p>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/study-v2')}
            className="w-full btn-star text-lg py-4 flex items-center justify-center gap-3 group"
          >
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            继续学习下一组
          </button>

          <Link
            href="/growth-starmap"
            className="w-full btn-sprout text-lg py-4 flex items-center justify-center gap-3 group"
          >
            <Star className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            查看成长星图
          </Link>

          <Link
            href="/dashboard"
            className="w-full btn-cosmos text-lg py-4 flex items-center justify-center gap-3"
          >
            <Home className="w-5 h-5" />
            返回学习仪表板
          </Link>
        </div>

        {/* 提示 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-cosmos-400">
            💡 学习数据已自动同步到成长星图
          </p>
        </div>
      </div>
    </div>
  )
}
