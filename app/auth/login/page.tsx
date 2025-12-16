'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sprout, Star, User, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function LoginPage() {
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
        <div className="text-center mb-8 animate-sprout-grow">
          <div className="flex items-center justify-center mb-4">
            <Sprout className="w-8 h-8 text-sprout-400 mr-2" />
            <Star className="w-6 h-6 text-star-400" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent mb-2">
            欢迎回来
          </h1>
          <p className="text-cosmos-300">继续你的学习之旅，让知识如星辰般闪耀</p>
        </div>

        {/* 快捷演示账号 */}
        <Card variant="cosmos" className="mb-6 animate-sprout-grow [animation-delay:0.1s]">
          <CardHeader>
            <CardTitle className="text-center text-cosmos-200 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-star-400" />
              快速体验
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoAccounts.map((account, index) => (
                <button
                  key={account.email}
                  onClick={() => handleDemoLogin(account)}
                  disabled={isLoading}
                  className="w-full p-4 rounded-lg border-2 border-cosmos-600 bg-cosmos-800/50 hover:border-sprout-400 hover:bg-sprout-400/10 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{account.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-cosmos-200 group-hover:text-sprout-300 transition-colors">
                        {account.name}
                      </div>
                      <div className="text-sm text-cosmos-400">
                        {account.description}
                      </div>
                    </div>
                    <div className="text-cosmos-500 group-hover:text-sprout-400 transition-colors">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {isLoading && (
              <div className="text-center mt-4">
                <div className="inline-flex items-center gap-2 text-sprout-400">
                  <div className="w-4 h-4 border-2 border-sprout-400 border-t-transparent rounded-full animate-spin"></div>
                  正在登录...
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
        <Card variant="cosmos" className="animate-sprout-grow [animation-delay:0.2s]">
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
        <div className="text-center mt-6 animate-sprout-grow [animation-delay:0.4s]">
          <p className="text-cosmos-400">
            还没有账户？{' '}
            <Link href="/auth/register" className="text-sprout-400 hover:text-sprout-300 transition-colors">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}