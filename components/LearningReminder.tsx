/**
 * 学习提醒组件
 * 在导航栏显示待复习单词数量和学习建议
 */

'use client'

import { useEffect, useState } from 'react'
import { Bell, Star } from 'lucide-react'
import { smartLearningService } from '@/lib/smart-learning-service'
import Link from 'next/link'

export function LearningReminder({ userId }: { userId?: string }) {
  const [needsReview, setNeedsReview] = useState(false)
  const [reviewCount, setReviewCount] = useState(0)

  useEffect(() => {
    if (!userId) return

    const checkReview = () => {
      const data = smartLearningService.getUserLearningData(userId)
      setReviewCount(data.wordStats.needReview)
      setNeedsReview(data.wordStats.needReview > 0)
    }

    checkReview()
    
    // 每分钟检查一次
    const interval = setInterval(checkReview, 60000)
    return () => clearInterval(interval)
  }, [userId])

  if (!needsReview || !userId) return null

  return (
    <Link
      href="/growth-starmap"
      className="relative flex items-center gap-2 px-3 py-2 bg-star-500/20 hover:bg-star-500/30 border border-star-400/30 rounded-lg transition-all group"
    >
      <Bell className="w-4 h-4 text-star-400 animate-bounce" />
      <span className="text-sm text-star-400 font-medium">
        {reviewCount} 个单词待复习
      </span>
      <Star className="w-3 h-3 text-star-400 animate-pulse" />
      
      {/* 脉冲动画 */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-star-400 rounded-full animate-ping" />
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-star-400 rounded-full" />
    </Link>
  )
}
