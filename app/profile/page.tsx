'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Crown, Sparkles, User } from 'lucide-react'

import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

type UserData = {
  id: string
  username?: string
  level?: string
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    const raw = window.localStorage.getItem('wenya_user')
    if (!raw) return

    try {
      const parsed = JSON.parse(raw)
      if (parsed?.id) setUserData(parsed)
    } catch {
      window.localStorage.removeItem('wenya_user')
    }
  }, [])

  return (
    <div className="min-h-screen text-white">
      <PageHeader title="个人档案" subtitle="账号、身份和学习入口" titleColor="sprout" backUrl="/dashboard" />

      <main className="mx-auto max-w-5xl px-4 pb-10">
        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Card variant="sprout" className="p-6">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#00F5A0]/12 text-[#00F5A0]">
                <User className="h-8 w-8" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-cosmos-400">Profile</p>
                <h1 className="mt-2 text-2xl font-semibold text-white">{userData?.username || '访客学习者'}</h1>
                <p className="mt-1 text-sm text-cosmos-300">{userData?.level || '尚未设置等级'}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/8 bg-white/5 p-4">
                <p className="text-xs text-cosmos-400">账号状态</p>
                <p className="mt-2 text-lg font-semibold text-[#00F5A0]">{userData ? '已登录' : '访客'}</p>
              </div>
              <div className="rounded-lg border border-white/8 bg-white/5 p-4">
                <p className="text-xs text-cosmos-400">学习身份</p>
                <p className="mt-2 text-lg font-semibold text-star-300">{userData?.level || '待选择'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.26em] text-cosmos-500">Next</p>
            <h2 className="mt-2 text-xl font-semibold text-white">常用入口</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Link href="/vocab">
                <Button variant="star" className="w-full gap-2">
                  <BookOpen className="h-4 w-4" />
                  背单词
                </Button>
              </Link>
              <Link href="/growth-starmap">
                <Button variant="cosmos" className="w-full gap-2">
                  <Sparkles className="h-4 w-4" />
                  星图
                </Button>
              </Link>
              <Link href={userData ? '/store' : '/auth/login'}>
                <Button variant="outline" className="w-full gap-2">
                  <Crown className="h-4 w-4" />
                  {userData ? '权益' : '登录'}
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-sm leading-6 text-cosmos-300">
              个人档案保留成轻量页面，后续账号设置、等级偏好和学习目标都放在这里，不再挤进控制台。
            </p>
          </Card>
        </section>
      </main>
    </div>
  )
}
