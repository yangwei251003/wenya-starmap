'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sprout, Star, User, Zap, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 演示账号
  const demoAccounts = [
    {
      name: '小明同学',
      level: 'beginner',
      icon: '🌱',
      description: '初学者账号',
      email: 'xiaoming@demo.com'
    },
    {
      name: '李华老师',
      level: 'intermediate', 
      icon: '🌿',
      description: '中级学习者',
      email: 'lihua@demo.com'
    },
    {
      name: '王教授',
      level: 'advanced',
      icon: '🌟',
      description: '高级学习者',
      email: 'professor@demo.com'
    }
  ]

  const handleDemoLogin = async (account: typeof demoAccounts[0]) => {
    setIsLoading(true)
    setError('')

    try {
      // 模拟登录延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 存储用户信息到localStorage
      const userData = {
        id: `demo_${account.level}_${Date.now()}`,
        username: account.name,
        email: account.email,
        level: account.level,
        loginTime: new Date().toISOString()
      }
      
      localStorage.setItem('wenya_user', JSON.stringify(userData))
      
      // 跳转到仪表板
      router.push('/dashboard?demo=true')
    } catch (error) {
      setError('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegularLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // 这里可以添加真实的登录逻辑
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const userData = {
        id: `user_${Date.now()}`,
        username: formData.email.split('@')[0],
        email: formData.email,
        level: 'intermediate',
        loginTime: new Date().toISOString()
      }
      
      localStorage.setItem('wenya_user', JSON.stringify(userData))
      router.push('/dashboard')
    } catch (error) {
      setError('登录失败，请检查邮箱和密码')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* 头部 */}
        <div className={`text-center mb-8 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Sprout className="w-10 h-10 text-sprout-400 animate-bounce-soft" />
              <Star className="w-6 h-6 text-star-400 absolute -top-1 -right-2 animate-star-shine" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent mb-3">
            欢迎回来
          </h1>
          <p className="text-cosmos-300 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-star-400" />
            继续你的学习之旅，让知识如星辰般闪耀
            <Sparkles className="w-4 h-4 text-star-400" />
          </p>
        </div>

        {/* 快捷演示账号 */}
        <Card variant="cosmos" className={`mb-6 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="text-center text-cosmos-200 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-star-400 animate-pulse" />
              快速体验
              <Star className="w-4 h-4 text-star-400 animate-star-shine" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleDemoLogin(account)}
                  disabled={isLoading}
                  className="w-full p-4 rounded-xl border-2 border-cosmos-600 bg-cosmos-800/50 hover:border-sprout-400 hover:bg-sprout-400/10 transition-all duration-300 text-left group disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-lg hover:shadow-sprout-400/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl group-hover:scale-110 transition-transform">{account.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-cosmos-200 group-hover:text-sprout-300 transition-colors">
                        {account.name}
                      </div>
                      <div className="text-sm text-cosmos-400">
                        {account.description}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-cosmos-500 group-hover:text-sprout-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
            
            {isLoading && (
              <div className="text-center mt-4">
                <div className="inline-flex items-center gap-2 text-sprout-400">
                  <div className="w-5 h-5 border-2 border-sprout-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="animate-pulse">正在登录...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 分割线 */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-cosmos-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-cosmos-900 text-cosmos-400">或使用邮箱登录</span>
          </div>
        </div>

        {/* 常规登录表单 */}
        <Card variant="cosmos" className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="text-center text-cosmos-200 flex items-center justify-center gap-2">
              <User className="w-5 h-5" />
              账号登录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegularLogin} className="space-y-4">
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

        {/* 注册链接 */}
        <div className={`text-center mt-6 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
          <p className="text-cosmos-400 flex items-center justify-center gap-2">
            还没有账户？
            <Link href="/auth/register" className="text-sprout-400 hover:text-sprout-300 transition-colors inline-flex items-center gap-1 group">
              立即注册
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </p>
        </div>

        {/* 返回首页 */}
        <div className={`text-center mt-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
          <Link href="/" className="text-cosmos-500 hover:text-cosmos-300 transition-colors text-sm">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}