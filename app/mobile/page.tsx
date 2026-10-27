'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Sprout, 
  Star, 
  Brain, 
  BookOpen, 
  Users, 
  MessageCircle,
  Trophy,
  Sparkles,
  ArrowRight,
  Play,
  BarChart3,
  Zap,
  Heart,
  Target,
  Gift,
  Crown
} from 'lucide-react'

export default function MobilePage() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-purple-400" />,
      title: 'FSRS智能算法',
      description: '最新的间隔重复算法，科学提高记忆效率',
      color: 'from-purple-500/20 to-purple-600/10 border-purple-400/30'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-star-400" />,
      title: '成长星图',
      description: '可视化学习数据，追踪你的进步轨迹',
      color: 'from-star-500/20 to-star-600/10 border-star-400/30'
    },
    {
      icon: <Trophy className="w-8 h-8 text-sprout-400" />,
      title: '游戏化学习',
      description: '每日挑战、成就系统，让学习更有趣',
      color: 'from-sprout-500/20 to-sprout-600/10 border-sprout-400/30'
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-blue-400" />,
      title: 'AI智能助手',
      description: '个性化学习建议，智能对话练习',
      color: 'from-blue-500/20 to-blue-600/10 border-blue-400/30'
    }
  ]

  const quickActions = [
    {
      title: '立即开始学习',
      subtitle: '智能FSRS算法',
      icon: <Play className="w-6 h-6" />,
      href: '/auth/register',
      color: 'bg-gradient-to-r from-sprout-500 to-sprout-600 hover:from-sprout-400 hover:to-sprout-500'
    },
    {
      title: '查看演示',
      subtitle: '体验完整功能',
      icon: <Zap className="w-6 h-6" />,
      href: '/dashboard?demo=true',
      color: 'bg-gradient-to-r from-star-500 to-star-600 hover:from-star-400 hover:to-star-500'
    }
  ]

  return (
    <div className="min-h-screen bg-cosmos-900 overflow-x-hidden">
      {/* 移动端顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-cosmos-900/95 backdrop-blur-md border-b border-cosmos-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Sprout className="w-8 h-8 text-sprout-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent">
              问芽星图
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="cosmos" className="text-sm px-3 py-2">
                登录
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="sprout" className="text-sm px-3 py-2">
                注册
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="pt-16 pb-8">
        {/* 英雄区域 */}
        <div className={`px-4 py-12 text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="w-24 h-24 bg-gradient-to-br from-sprout-400 to-star-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <Heart className="w-12 h-12 text-white animate-pulse" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            AI智能英语
            <br />
            <span className="bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent">
              学习平台
            </span>
          </h1>
          
          <p className="text-lg text-cosmos-300 mb-8 leading-relaxed px-4">
            基于FSRS算法的智能学习系统
            <br />
            让每一次学习都更高效
          </p>

          {/* 快捷操作 */}
          <div className="space-y-4 px-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href} className="block">
                <button className={`
                  w-full ${action.color} text-white rounded-xl p-4 
                  flex items-center justify-between transition-all duration-300
                  hover:scale-[1.02] active:scale-[0.98]
                `}>
                  <div className="flex items-center gap-3">
                    {action.icon}
                    <div className="text-left">
                      <div className="font-bold">{action.title}</div>
                      <div className="text-sm opacity-90">{action.subtitle}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* 核心特性 */}
        <div className="px-4 py-8">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            为什么选择问芽星图？
          </h2>
          
          <div className="space-y-4">
            {features.map((feature, index) => (
              <Card key={index} className={`
                p-6 bg-gradient-to-br ${feature.color} border
                transform transition-all duration-500 hover:scale-[1.02]
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
              `} style={{ transitionDelay: `${index * 200}ms` }}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-cosmos-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 学习数据展示 */}
        <div className="px-4 py-8">
          <Card className="p-6 bg-gradient-to-br from-cosmos-800/50 to-cosmos-700/30 border-cosmos-600/50 text-center">
            <h3 className="text-xl font-bold text-white mb-6">学习成果一目了然</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-cosmos-800/50 rounded-xl">
                <div className="text-2xl font-bold text-sprout-400 mb-1">10,000+</div>
                <div className="text-cosmos-400 text-sm">学习单词</div>
              </div>
              <div className="p-4 bg-cosmos-800/50 rounded-xl">
                <div className="text-2xl font-bold text-star-400 mb-1">95%</div>
                <div className="text-cosmos-400 text-sm">记忆准确率</div>
              </div>
              <div className="p-4 bg-cosmos-800/50 rounded-xl">
                <div className="text-2xl font-bold text-purple-400 mb-1">30天</div>
                <div className="text-cosmos-400 text-sm">连续学习</div>
              </div>
              <div className="p-4 bg-cosmos-800/50 rounded-xl">
                <div className="text-2xl font-bold text-blue-400 mb-1">5000+</div>
                <div className="text-cosmos-400 text-sm">用户选择</div>
              </div>
            </div>
            
            <Link href="/dashboard?demo=true">
              <Button variant="star" className="w-full">
                <BarChart3 className="w-5 h-5 mr-2" />
                查看演示数据
              </Button>
            </Link>
          </Card>
        </div>

        {/* 学习模式介绍 */}
        <div className="px-4 py-8">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            多种学习模式
          </h2>
          
          <div className="space-y-4">
            <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-400/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">智能学习模式</h3>
                  <p className="text-purple-400 text-sm">FSRS算法驱动</p>
                </div>
              </div>
              <p className="text-cosmos-300 text-sm leading-relaxed">
                使用最新的FSRS算法，根据你的记忆曲线智能安排复习时间，比传统方法效率提升30%以上。
              </p>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-400/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">传统学习模式</h3>
                  <p className="text-blue-400 text-sm">经典间隔重复</p>
                </div>
              </div>
              <p className="text-cosmos-300 text-sm leading-relaxed">
                基于艾宾浩斯遗忘曲线的经典学习方法，稳定可靠，适合喜欢传统学习方式的用户。
              </p>
            </Card>
          </div>
        </div>

        {/* 社区功能 */}
        <div className="px-4 py-8">
          <Card className="p-6 bg-gradient-to-br from-pink-500/20 to-pink-600/10 border-pink-400/30 text-center">
            <Users className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">加入学习社区</h3>
            <p className="text-cosmos-300 mb-6 leading-relaxed">
              与全球学习者一起进步，分享学习心得，参与挑战赛，让学习不再孤单。
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-lg font-bold text-pink-400">1000+</div>
                <div className="text-cosmos-400 text-sm">活跃用户</div>
              </div>
              <div>
                <div className="text-lg font-bold text-pink-400">50+</div>
                <div className="text-cosmos-400 text-sm">每日挑战</div>
              </div>
            </div>
            <Link href="/community">
              <Button variant="cosmos" className="w-full">
                <Users className="w-5 h-5 mr-2" />
                探索社区
              </Button>
            </Link>
          </Card>
        </div>

        {/* 立即开始 */}
        <div className="px-4 py-8">
          <Card className="p-8 bg-gradient-to-r from-sprout-500/20 to-star-500/20 border-sprout-400/30 text-center">
            <Sparkles className="w-16 h-16 text-star-400 mx-auto mb-6 animate-pulse" />
            <h2 className="text-2xl font-bold text-white mb-4">
              开始你的学习之旅
            </h2>
            <p className="text-cosmos-300 mb-8 leading-relaxed">
              加入问芽星图，体验AI驱动的智能学习，让每一次努力都有最大的收获。
            </p>
            
            <div className="space-y-4">
              <Link href="/auth/register" className="block">
                <Button variant="sprout" className="w-full text-lg py-4">
                  <Crown className="w-6 h-6 mr-2" />
                  免费注册开始学习
                </Button>
              </Link>
              
              <Link href="/dashboard?demo=true" className="block">
                <Button variant="star" className="w-full text-lg py-4">
                  <Gift className="w-6 h-6 mr-2" />
                  先体验演示版本
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* 底部信息 */}
        <div className="px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sprout className="w-6 h-6 text-sprout-400" />
            <span className="text-lg font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent">
              问芽星图
            </span>
          </div>
          <p className="text-cosmos-500 text-sm">
            AI智能英语学习平台 · 让学习更高效
          </p>
        </div>
      </div>
    </div>
  )
}