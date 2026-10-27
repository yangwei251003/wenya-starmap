'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Sprout, Star, Zap, User, BookOpen, Target, Rocket, Sparkles, ArrowRight } from 'lucide-react'

export default function DemoPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const quickLogin = (level: string, name: string) => {
    setSelectedRole(level)
    
    const userData = {
      id: `demo_${level}_${Date.now()}`,
      username: name,
      email: `${level}@demo.com`,
      level,
      loginTime: new Date().toISOString()
    }
    
    // 添加延迟效果
    setTimeout(() => {
      localStorage.setItem('wenya_user', JSON.stringify(userData))
      router.push('/dashboard?demo=true')
    }, 800)
  }

  const roles = [
    {
      level: 'beginner',
      name: '小明同学',
      emoji: '🌱',
      title: '初学者',
      description: '刚开始学习英语，需要从基础开始',
      features: '基础词汇 · 简单语法',
      gradient: 'from-green-400 to-sprout-500',
      borderColor: 'border-sprout-400',
      textColor: 'text-sprout-400',
      icon: BookOpen,
    },
    {
      level: 'intermediate',
      name: '李华老师',
      emoji: '🌿',
      title: '中级学习者',
      description: '有一定基础，希望进一步提升',
      features: '进阶语法 · 实用对话',
      gradient: 'from-blue-400 to-star-500',
      borderColor: 'border-star-400',
      textColor: 'text-star-400',
      icon: Target,
    },
    {
      level: 'advanced',
      name: '王教授',
      emoji: '🌟',
      title: '高级学习者',
      description: '英语水平较高，追求完美表达',
      features: '高级写作 · 商务英语',
      gradient: 'from-yellow-400 to-orange-500',
      borderColor: 'border-yellow-400',
      textColor: 'text-yellow-400',
      icon: Star,
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-5xl w-full">
        {/* 头部 */}
        <div className={`text-center mb-12 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Sprout className="w-14 h-14 text-sprout-400 animate-bounce-soft" />
              <div className="absolute -top-1 -right-1">
                <Star className="w-8 h-8 text-star-400 animate-star-shine" />
              </div>
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-sprout-400 via-star-400 to-sprout-400 bg-clip-text text-transparent mb-4">
            问芽星图
          </h1>
          <p className="text-2xl text-cosmos-300 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-star-400" />
            AI驱动的英语学习平台
            <Sparkles className="w-5 h-5 text-star-400" />
          </p>
          <p className="text-lg text-cosmos-400">让学习像星辰般璀璨</p>
        </div>

        {/* 快速体验卡片 */}
        <Card className={`p-8 mb-8 bg-gradient-to-br from-cosmos-800/80 to-cosmos-700/60 border-sprout-400/30 backdrop-blur-lg ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-star-400/30 to-star-600/20 rounded-2xl mb-4">
              <Zap className="w-8 h-8 text-star-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">快速体验</h2>
            <p className="text-cosmos-300 text-lg">选择一个角色，立即开始你的学习之旅</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role, index) => {
              const IconComponent = role.icon
              const isSelected = selectedRole === role.level
              
              return (
                <div
                  key={role.level}
                  className={`relative p-6 bg-cosmos-800/50 rounded-xl border-2 transition-all duration-500 cursor-pointer group
                    ${isSelected ? `${role.borderColor} scale-105` : 'border-cosmos-600/30 hover:border-opacity-60'}
                    ${mounted ? 'animate-fade-in-up' : 'opacity-0'}
                  `}
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  onClick={() => quickLogin(role.level, role.name)}
                >
                  {/* 选中时的光效 */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                    </div>
                  )}
                  
                  <div className="text-center relative z-10">
                    {/* 头像 */}
                    <div className={`w-20 h-20 bg-gradient-to-br ${role.gradient} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                      <span className="text-3xl">{role.emoji}</span>
                    </div>
                    
                    {/* 名称和等级 */}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:scale-105 transition-transform">
                      {role.name}
                    </h3>
                    <p className={`${role.textColor} font-medium mb-3 flex items-center justify-center gap-1`}>
                      <Star className="w-4 h-4" />
                      {role.title}
                    </p>
                    
                    {/* 描述 */}
                    <p className="text-sm text-cosmos-300 mb-4 leading-relaxed">
                      {role.description}
                    </p>
                    
                    {/* 特色标签 */}
                    <div className="flex items-center justify-center gap-2 text-xs text-cosmos-400 mb-4">
                      <IconComponent className="w-3 h-3" />
                      {role.features}
                    </div>
                    
                    {/* 进入按钮 */}
                    <div className={`flex items-center justify-center gap-2 ${role.textColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <span className="text-sm font-medium">点击进入</span>
                      <ArrowRight className="w-4 h-4 animate-bounce-soft" />
                    </div>
                  </div>
                  
                  {/* 装饰星星 */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Star className="w-4 h-4 text-star-400 animate-star-shine" />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* 功能特色 */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          {[
            { icon: User, title: '个性化学习', desc: 'AI定制学习路径', color: 'sprout' },
            { icon: Star, title: '星图可视化', desc: '成就如星辰闪耀', color: 'star' },
            { icon: BookOpen, title: '互动练习', desc: '多样化学习方式', color: 'blue' },
            { icon: Target, title: '智能反馈', desc: 'AI实时指导', color: 'purple' },
          ].map((feature) => (
            <div 
              key={feature.title}
              className="text-center p-5 rounded-xl bg-cosmos-800/30 border border-cosmos-700/30 hover:border-cosmos-600/50 transition-all duration-300 hover:transform hover:scale-105 group"
            >
              <div className={`w-14 h-14 bg-${feature.color}-400/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
              </div>
              <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
              <p className="text-xs text-cosmos-400">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* 底部链接 */}
        <div className={`text-center ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.7s' }}>
          <p className="text-cosmos-400 mb-6 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            想要完整体验？
            <Sparkles className="w-4 h-4" />
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/auth/login')}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              登录账号
            </Button>
            <Button 
              variant="sprout"
              onClick={() => router.push('/auth/register')}
              className="flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              注册新账号
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
