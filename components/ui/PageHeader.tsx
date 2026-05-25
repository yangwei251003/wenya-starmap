'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Grid3X3, Home, Sprout, Star } from 'lucide-react'
import Link from 'next/link'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  showHome?: boolean
  backUrl?: string
  titleColor?: 'sprout' | 'star' | 'purple' | 'white'
}

export function PageHeader({ 
  title, 
  subtitle, 
  showBack = true, 
  showHome = true,
  backUrl,
  titleColor = 'star'
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl)
    } else {
      router.back()
    }
  }

  const colorClasses = {
    sprout: 'text-sprout-400',
    star: 'text-star-400',
    purple: 'text-purple-400',
    white: 'text-white'
  }

  return (
    <div className="glass sticky top-0 z-40 mb-6">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 左侧导航 */}
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cosmos-800/50 hover:bg-cosmos-700/50 text-cosmos-300 hover:text-white transition-all duration-300 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm hidden sm:inline">返回</span>
              </button>
            )}
            {showHome && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cosmos-800/50 hover:bg-cosmos-700/50 text-cosmos-300 hover:text-white transition-all duration-300 group"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm hidden sm:inline">主页</span>
              </Link>
            )}
          </div>

          {/* 中间标题 */}
          <div className="text-center flex-1">
            <h1 className={`text-xl sm:text-2xl font-bold ${colorClasses[titleColor]} flex items-center justify-center gap-2`}>
              {titleColor === 'sprout' && <Sprout className="w-5 h-5 sm:w-6 sm:h-6" />}
              {titleColor === 'star' && <Star className="w-5 h-5 sm:w-6 sm:h-6 animate-star-shine" />}
              {title}
            </h1>
            {subtitle && (
              <p className="text-cosmos-400 text-sm mt-1">{subtitle}</p>
            )}
          </div>

          {/* 右侧Logo */}
          <div className="flex items-center gap-2">
            <Link
              href="/services"
              className="flex items-center gap-2 rounded-lg bg-cosmos-800/50 px-3 py-2 text-cosmos-300 transition-all duration-300 hover:bg-cosmos-700/50 hover:text-white"
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">服务</span>
            </Link>
            <Link href="/" className="hidden items-center gap-2 group sm:flex">
              <Sprout className="w-6 h-6 text-sprout-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-cosmos-300 hidden lg:inline">问芽星图</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
