'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles, Star, User, Zap, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { authAPI } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      })

      if (!response.success || !response.data) {
        setError(response.error?.message || '登录失败，请检查邮箱和密码')
        return
      }

      localStorage.setItem('wenya_user', JSON.stringify(response.data.user))
      if (response.data.token) {
        localStorage.setItem('wenya_token', response.data.token)
      }
      if (response.data.refreshToken) {
        localStorage.setItem('wenya_refresh_token', response.data.refreshToken)
      }

      router.push('/dashboard')
    } catch (err) {
      setError('登录失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className={`text-center mb-8 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Sprout className="w-10 h-10 text-sprout-400 animate-bounce-soft" />
              <Star className="w-6 h-6 text-star-400 absolute -top-1 -right-2 animate-star-shine" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent mb-3">
            欢迎回到星图
          </h1>
          <p className="text-cosmos-300 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-star-400" />
            继续你的萌芽之旅，让每一次发问都长出新的光
            <Sparkles className="w-4 h-4 text-star-400" />
          </p>
        </div>

        <Card variant="cosmos" className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <CardHeader>
            <CardTitle className="text-center text-cosmos-200 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-star-400" />
              星语入口
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="邮箱地址"
                type="email"
                placeholder="请输入邮箱地址"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />

              <Input
                label="密码"
                type="password"
                placeholder="请输入密码"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="sprout"
                className="w-full"
                isLoading={isLoading}
              >
                登录
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className={`text-center mt-6 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          <p className="text-cosmos-400 flex items-center justify-center gap-2">
            还没有账户？
            <Link href="/auth/register" className="text-sprout-400 hover:text-sprout-300 transition-colors inline-flex items-center gap-1 group">
              立即注册
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </p>
        </div>

        <div className={`text-center mt-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          <Link href="/" className="text-cosmos-500 hover:text-cosmos-300 transition-colors text-sm">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
