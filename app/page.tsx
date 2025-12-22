'use client'

import Link from 'next/link'
import { Sprout, Star, BookOpen, Users, Rocket, Sparkles, Zap, ShoppingCart, Coins, Gift, MessageCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <nav className="p-6 flex justify-between items-center glass sticky top-0 z-50">
        <div className="flex items-center space-x-2 group cursor-pointer">
          <div className="relative">
            <Sprout className="w-8 h-8 text-sprout-400 transition-transform group-hover:scale-110" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-star-400 rounded-full animate-pulse" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent">
            问芽星图
          </span>
        </div>
        <div className="flex space-x-4">
          <Link href="/auth/login" className="btn-sprout flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            登录
          </Link>
          <Link href="/auth/register" className="btn-star flex items-center gap-2">
            <Star className="w-4 h-4" />
            注册
          </Link>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-5xl mx-auto">
          {/* 主标题区域 */}
          <div className="mb-12">
            {/* 装饰性火箭 */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Rocket className="w-16 h-16 text-star-400 animate-bounce" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-orange-500 to-transparent rounded-full blur-md animate-pulse" />
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-sprout-400 via-star-400 to-sprout-400 bg-clip-text text-transparent">
                问芽星图
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-cosmos-300 mb-2 flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-star-400 animate-pulse" />
              WenYa StarMap
              <Star className="w-5 h-5 text-star-400 animate-pulse" />
            </p>
            <p className="text-lg md:text-xl text-cosmos-400">
              AI驱动的智慧英语学习平台
            </p>
          </div>

          {/* 副标题 */}
          <div className="mb-16">
            <p className="text-2xl md:text-3xl text-cosmos-200 mb-4 font-light">
              从<span className="text-sprout-400 font-semibold">嫩芽破土</span>到<span className="text-star-400 font-semibold">璀璨繁星</span>
            </p>
            <p className="text-base md:text-lg text-cosmos-300 max-w-2xl mx-auto">
              让每一次学习都成为成长的见证，让每一个进步都闪耀如星辰
            </p>
          </div>

          {/* 特色功能卡片 */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-16">
            <div className="sprout-card text-center group hover:scale-105 transition-transform duration-300">
              <div className="relative mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-sprout-400/30 to-sprout-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-sprout-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-star-400 rounded-full flex items-center justify-center animate-bounce">
                  <Zap className="w-3 h-3 text-cosmos-900" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 text-sprout-300">AI个性化学习</h3>
              <p className="text-cosmos-300 leading-relaxed text-sm md:text-base">
                智能分析你的学习水平，定制专属学习路径
              </p>
            </div>

            <div className="star-card text-center group hover:scale-105 transition-transform duration-300">
              <div className="relative mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-star-400/30 to-star-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-star-400" />
                </div>
                <div className="absolute -top-1 -left-1 w-4 h-4 bg-sprout-400 rounded-full animate-pulse" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 text-star-300">课程商店</h3>
              <p className="text-cosmos-300 leading-relaxed text-sm md:text-base">
                海量精品课程，用星币解锁你的学习之旅
              </p>
            </div>

            <div className="cosmos-card text-center group hover:scale-105 transition-transform duration-300">
              <div className="relative mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-yellow-400/30 to-yellow-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Coins className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 text-yellow-300">星币系统</h3>
              <p className="text-cosmos-300 leading-relaxed text-sm md:text-base">
                签到赚星币，学习得奖励，轻松购课程
              </p>
            </div>

            <div className="cosmos-card text-center group hover:scale-105 transition-transform duration-300">
              <div className="relative mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-purple-400/30 to-purple-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 text-purple-300">星光殿堂</h3>
              <p className="text-cosmos-300 leading-relaxed text-sm md:text-base">
                社区交流互动，分享学习心得，结交学习伙伴
              </p>
            </div>
          </div>

          {/* 行动按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-16">
            <Link 
              href="/demo" 
              className="btn-star text-lg md:text-xl px-8 md:px-10 py-4 md:py-5 flex items-center justify-center gap-3 group"
            >
              <Rocket className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-bounce" />
              🚀 立即体验
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
            </Link>
            <Link 
              href="/community" 
              className="btn-sprout text-lg md:text-xl px-8 md:px-10 py-4 md:py-5 flex items-center justify-center gap-3 group"
            >
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
              进入星光殿堂
            </Link>
          </div>

          {/* 新用户福利 */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-star-500/20 to-yellow-500/20 border border-star-400/30">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Gift className="w-8 h-8 text-star-400" />
                <div className="text-center">
                  <p className="text-lg font-semibold text-white">🎁 新用户专享福利</p>
                  <p className="text-cosmos-300">注册即送 <span className="text-star-400 font-bold">200星币</span>，每日签到再得 <span className="text-sprout-400 font-bold">10-20星币</span></p>
                </div>
                <Link href="/auth/register" className="btn-star px-6 py-2">
                  立即领取
                </Link>
              </div>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto">
            <div className="text-center p-4 rounded-xl bg-cosmos-800/30 border border-cosmos-700/50">
              <div className="text-2xl md:text-4xl font-bold text-sprout-400 mb-2">1000+</div>
              <div className="text-cosmos-400 text-sm md:text-base">学习词汇</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-cosmos-800/30 border border-cosmos-700/50">
              <div className="text-2xl md:text-4xl font-bold text-star-400 mb-2">50+</div>
              <div className="text-cosmos-400 text-sm md:text-base">互动课程</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-cosmos-800/30 border border-cosmos-700/50">
              <div className="text-2xl md:text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-cosmos-400 text-sm md:text-base">AI陪伴</div>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="p-6 md:p-8 text-center glass">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sprout className="w-5 h-5 text-sprout-400" />
          <Star className="w-4 h-4 text-star-400 animate-pulse" />
          <span className="text-cosmos-300">问芽星图 WenYa StarMap</span>
          <Star className="w-4 h-4 text-star-400 animate-pulse" />
          <Sprout className="w-5 h-5 text-sprout-400" />
        </div>
        <p className="text-cosmos-400 text-sm md:text-base">&copy; 2024 让学习如星辰般闪耀</p>
      </footer>
    </div>
  )
}
