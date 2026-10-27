'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StarSproutMemory from '@/components/study/StarSproutMemory'

export default function StudyFSRSPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // 获取用户ID
    const user = localStorage.getItem('wenya_user')
    if (user) {
      const userData = JSON.parse(user)
      setUserId(userData.id)
    } else {
      // 如果没有用户信息，重定向到登录页
      router.push('/auth/login')
    }
  }, [router])

  const handleComplete = () => {
    // 跳转到学习总结页面
    router.push('/study/summary')
  }

  const handleBack = () => {
    // 返回到仪表板
    router.push('/dashboard')
  }

  if (!mounted || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cosmos-900 via-cosmos-800 to-cosmos-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <StarSproutMemory
      userId={userId}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  )
}