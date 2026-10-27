'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Home, 
  BookOpen, 
  Brain, 
  Star, 
  Users, 
  MessageCircle, 
  Trophy, 
  Settings,
  Menu,
  X,
  User,
  LogOut,
  Coins,
  Gift
} from 'lucide-react'

interface MobileNavigationProps {
  userData?: any
  starCoins?: number
  onLogout?: () => void
}

export default function MobileNavigation({ userData, starCoins = 0, onLogout }: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const mainNavItems = [
    { href: '/dashboard', icon: Home, label: '首页', color: 'text-sprout-400' },
    { href: '/study', icon: BookOpen, label: '学习', color: 'text-blue-400' },
    { href: '/study-fsrs', icon: Brain, label: '智能', color: 'text-purple-400' },
    { href: '/growth-starmap', icon: Star, label: '星图', color: 'text-star-400' },
    { href: '/community', icon: Users, label: '社区', color: 'text-pink-400' }
  ]

  const secondaryNavItems = [
    { href: '/chat', icon: MessageCircle, label: 'AI对话' },
    { href: '/quiz', icon: Trophy, label: '练习中心' },
    { href: '/lesson', icon: BookOpen, label: '免费课程' },
    { href: '/store', icon: Coins, label: '课程商店' },
    { href: '/my-courses', icon: User, label: '我的课程' }
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* 移动端顶部导航栏 */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-cosmos-900/95 backdrop-blur-md border-b border-cosmos-700">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sprout-400 to-star-400 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent">
              问芽星图
            </span>
          </Link>

          {/* 用户信息和菜单 */}
          <div className="flex items-center gap-3">
            {userData && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-star-400/20 rounded-lg">
                  <Coins className="w-4 h-4 text-star-400" />
                  <span className="text-sm font-bold text-star-400">{starCoins}</span>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 bg-cosmos-800 rounded-lg text-cosmos-300 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 移动端侧边菜单 */}
      <div className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${
        isMenuOpen ? 'visible' : 'invisible'
      }`}>
        {/* 背景遮罩 */}
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* 菜单内容 */}
        <div className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-cosmos-900 border-l border-cosmos-700 transform transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* 用户信息区域 */}
            {userData && (
              <div className="p-6 border-b border-cosmos-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-sprout-400 to-star-400 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{userData.username}</h3>
                    <p className="text-cosmos-400 text-sm capitalize">{userData.level}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-2 bg-star-400/20 rounded-lg">
                    <Coins className="w-4 h-4 text-star-400" />
                    <span className="text-star-400 font-bold">{starCoins}</span>
                    <span className="text-cosmos-400 text-sm">星币</span>
                  </div>
                  
                  <Link 
                    href="/recharge"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-1 px-3 py-2 bg-sprout-400/20 rounded-lg text-sprout-400 hover:bg-sprout-400/30 transition-colors"
                  >
                    <Gift className="w-4 h-4" />
                    <span className="text-sm">充值</span>
                  </Link>
                </div>
              </div>
            )}

            {/* 主要导航 */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h4 className="text-cosmos-400 text-sm font-medium mb-3 uppercase tracking-wider">主要功能</h4>
                <div className="space-y-1">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive(item.href)
                          ? 'bg-sprout-400/20 text-sprout-400 border border-sprout-400/30'
                          : 'text-cosmos-300 hover:text-white hover:bg-cosmos-800/50'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive(item.href) ? item.color : ''}`} />
                      <span className="font-medium">{item.label}</span>
                      {isActive(item.href) && (
                        <div className="ml-auto w-2 h-2 bg-sprout-400 rounded-full" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-cosmos-700">
                <h4 className="text-cosmos-400 text-sm font-medium mb-3 uppercase tracking-wider">更多功能</h4>
                <div className="space-y-1">
                  {secondaryNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive(item.href)
                          ? 'bg-star-400/20 text-star-400 border border-star-400/30'
                          : 'text-cosmos-300 hover:text-white hover:bg-cosmos-800/50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* 底部操作 */}
            {userData && (
              <div className="p-4 border-t border-cosmos-700">
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    onLogout?.()
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>退出登录</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 移动端底部导航栏 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cosmos-900/95 backdrop-blur-md border-t border-cosmos-700">
        <div className="flex items-center justify-around px-2 py-2">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isActive(item.href)
                  ? 'text-sprout-400'
                  : 'text-cosmos-400 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive(item.href) ? item.color : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive(item.href) && (
                <div className="w-1 h-1 bg-sprout-400 rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* 为固定导航栏添加顶部和底部间距 */}
      <div className="md:hidden h-16" /> {/* 顶部间距 */}
      <div className="md:hidden h-20" /> {/* 底部间距，在页面底部使用 */}
    </>
  )
}