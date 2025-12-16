'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Sprout, Star, Zap, User, BookOpen, Target } from 'lucide-react'

export default function DemoPage() {
  const router = useRouter()

  const quickLogin = (level: string, name: string) => {
    const userData = {
      id: `demo_${level}_${Date.now()}`,
      username: name,
      email: `${level}@demo.com`,
      level,
      loginTime: new Date().toISOString()
    }
    
    localStorage.setItem('wenya_user', JSON.stringify(userData))
    router.push('/dashboard?demo=true')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full">
        {/* 头部 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Sprout className="w-12 h-12 text-sprout-400 mr-3" />
            <Star className="w-10 h-10 text-star-400" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent mb-4">
            问芽星图
          </h1>
          <p className="text-xl text-cosmos-300 mb-2">AI驱动的英语学习平台</p>
          <p className="text-cosmos-400">让学习像星辰般璀璨</p>
        </div>

        {/* 快速体验卡片 */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-cosmos-800 to-cosmos-700 border-sprout-400/30">
          <div className="text-center mb-8">
            <Zap className="w-8 h-8 text-star-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">快速体验</h2>
            <p className="text-cosmos-300">选择一个角色，立即开始你的学习之旅</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 初学者 */}
            <Card className="p-6 bg-cosmos-800/50 border-sprout-400/20 hover:border-sprout-400 transition-all duration-300 cursor-pointer group"
                  onClick={() => quickLogin('beginner', '小明同学')}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-sprout-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">小明同学</h3>
                <p className="text-sprout-400 font-medium mb-3">初学者</p>
                <p className="text-sm text-cosmos-300 mb-4">
                  刚开始学习英语，需要从基础开始
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-cosmos-400">
                  <BookOpen className="w-3 h-3" />
                  基础词汇 · 简单语法
                </div>
              </div>
            </Card>

            {/* 中级学习者 */}
            <Card className="p-6 bg-cosmos-800/50 border-star-400/20 hover:border-star-400 transition-all duration-300 cursor-pointer group"
                  onClick={() => quickLogin('intermediate', '李华老师')}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-star-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🌿</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">李华老师</h3>
                <p className="text-star-400 font-medium mb-3">中级学习者</p>
                <p className="text-sm text-cosmos-300 mb-4">
                  有一定基础，希望进一步提升
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-cosmos-400">
                  <Target className="w-3 h-3" />
                  进阶语法 · 实用对话
                </div>
              </div>
            </Card>

            {/* 高级学习者 */}
            <Card className="p-6 bg-cosmos-800/50 border-yellow-400/20 hover:border-yellow-400 transition-all duration-300 cursor-pointer group"
                  onClick={() => quickLogin('advanced', '王教授')}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🌟</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">王教授</h3>
                <p className="text-yellow-400 font-medium mb-3">高级学习者</p>
                <p className="text-sm text-cosmos-300 mb-4">
                  英语水平较高，追求完美表达
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-cosmos-400">
                  <Star className="w-3 h-3" />
                  高级写作 · 商务英语
                </div>
              </div>
            </Card>
          </div>
        </Card>

        {/* 功能特色 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-sprout-400/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-sprout-400" />
            </div>
            <h4 className="font-semibold text-white mb-1">个性化学习</h4>
            <p className="text-xs text-cosmos-400">AI定制学习路径</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-star-400/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-star-400" />
            </div>
            <h4 className="font-semibold text-white mb-1">星图可视化</h4>
            <p className="text-xs text-cosmos-400">成就如星辰闪耀</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="font-semibold text-white mb-1">互动练习</h4>
            <p className="text-xs text-cosmos-400">多样化学习方式</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="font-semibold text-white mb-1">智能反馈</h4>
            <p className="text-xs text-cosmos-400">AI实时指导</p>
          </div>
        </div>

        {/* 底部链接 */}
        <div className="text-center">
          <p className="text-cosmos-400 mb-4">
            想要完整体验？
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/auth/login')}
            >
              登录账号
            </Button>
            <Button 
              variant="sprout"
              onClick={() => router.push('/auth/register')}
            >
              注册新账号
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}