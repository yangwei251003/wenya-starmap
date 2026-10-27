'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface MobileOptimizedProps {
  children: React.ReactNode
  className?: string
}

// 移动端优化容器
export function MobileContainer({ children, className = '' }: MobileOptimizedProps) {
  return (
    <div className={`
      px-4 py-6 
      md:px-6 md:py-8 
      lg:px-8 lg:py-10
      max-w-7xl mx-auto
      ${className}
    `}>
      {children}
    </div>
  )
}

// 移动端优化卡片
export function MobileCard({ children, className = '' }: MobileOptimizedProps) {
  return (
    <Card className={`
      p-4 
      md:p-6 
      lg:p-8
      ${className}
    `}>
      {children}
    </Card>
  )
}

// 移动端网格布局
interface MobileGridProps {
  children: React.ReactNode
  cols?: {
    mobile: number
    tablet: number
    desktop: number
  }
  gap?: number
  className?: string
}

export function MobileGrid({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  className = ''
}: MobileGridProps) {
  const gridClasses = `
    grid 
    grid-cols-${cols.mobile} 
    md:grid-cols-${cols.tablet} 
    lg:grid-cols-${cols.desktop}
    gap-${gap}
    ${className}
  `
  
  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

// 移动端按钮组
interface MobileButtonGroupProps {
  buttons: Array<{
    label: string
    onClick: () => void
    variant?: 'sprout' | 'star' | 'cosmos'
    icon?: React.ReactNode
    disabled?: boolean
  }>
  direction?: 'horizontal' | 'vertical'
  className?: string
}

export function MobileButtonGroup({ 
  buttons, 
  direction = 'vertical',
  className = ''
}: MobileButtonGroupProps) {
  const containerClasses = direction === 'horizontal' 
    ? 'flex flex-wrap gap-2 md:gap-3'
    : 'flex flex-col gap-3'

  return (
    <div className={`${containerClasses} ${className}`}>
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant={button.variant || 'sprout'}
          onClick={button.onClick}
          disabled={button.disabled}
          className="flex items-center justify-center gap-2 min-h-[48px] text-base font-medium"
        >
          {button.icon}
          {button.label}
        </Button>
      ))}
    </div>
  )
}

// 移动端统计卡片
interface MobileStatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  color?: 'sprout' | 'star' | 'purple' | 'blue' | 'orange'
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function MobileStatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'sprout',
  trend 
}: MobileStatCardProps) {
  const colorClasses = {
    sprout: 'from-sprout-500/20 to-sprout-600/10 border-sprout-400/30 text-sprout-400',
    star: 'from-star-500/20 to-star-600/10 border-star-400/30 text-star-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-400/30 text-purple-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-400/30 text-blue-400',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-400/30 text-orange-400'
  }

  return (
    <Card className={`p-4 bg-gradient-to-br ${colorClasses[color]} border`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-cosmos-400 text-sm font-medium">{title}</h4>
        {icon && (
          <div className={`w-8 h-8 rounded-lg bg-${color}-400/20 flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl md:text-3xl font-bold text-white mb-1">
            {value}
          </div>
          {subtitle && (
            <p className="text-cosmos-400 text-xs">{subtitle}</p>
          )}
        </div>
        
        {trend && (
          <div className={`text-xs font-medium ${
            trend.isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
    </Card>
  )
}

// 移动端学习卡片
interface MobileLearningCardProps {
  title: string
  description: string
  progress?: number
  buttonText: string
  onButtonClick: () => void
  icon?: React.ReactNode
  color?: 'sprout' | 'star' | 'purple' | 'blue'
  isActive?: boolean
}

export function MobileLearningCard({
  title,
  description,
  progress,
  buttonText,
  onButtonClick,
  icon,
  color = 'sprout',
  isActive = false
}: MobileLearningCardProps) {
  const colorClasses = {
    sprout: 'from-sprout-500/20 to-sprout-600/10 border-sprout-400/30',
    star: 'from-star-500/20 to-star-600/10 border-star-400/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-400/30',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-400/30'
  }

  const buttonColors = {
    sprout: 'sprout',
    star: 'star',
    purple: 'cosmos',
    blue: 'cosmos'
  }

  return (
    <Card className={`
      p-5 bg-gradient-to-br ${colorClasses[color]} border
      ${isActive ? 'ring-2 ring-sprout-400/50' : ''}
      hover:scale-[1.02] transition-all duration-300
    `}>
      <div className="flex items-start gap-4 mb-4">
        {icon && (
          <div className={`w-12 h-12 rounded-xl bg-${color}-400/20 flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-cosmos-300 text-sm leading-relaxed">{description}</p>
        </div>
      </div>

      {progress !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-cosmos-400 text-sm">进度</span>
            <span className="text-white text-sm font-medium">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-cosmos-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-${color}-400 to-${color}-500 rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <Button
        variant={buttonColors[color] as any}
        onClick={onButtonClick}
        className="w-full min-h-[48px] text-base font-medium"
      >
        {buttonText}
      </Button>
    </Card>
  )
}

// 移动端快捷操作网格
interface MobileQuickActionProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  onClick: () => void
  color?: 'sprout' | 'star' | 'purple' | 'blue' | 'orange' | 'pink'
  badge?: string | number
}

export function MobileQuickAction({
  title,
  subtitle,
  icon,
  onClick,
  color = 'sprout',
  badge
}: MobileQuickActionProps) {
  const colorClasses = {
    sprout: 'from-sprout-500/20 to-sprout-600/10 border-sprout-400/30 hover:border-sprout-400/50',
    star: 'from-star-500/20 to-star-600/10 border-star-400/30 hover:border-star-400/50',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-400/30 hover:border-purple-400/50',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-400/30 hover:border-blue-400/50',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-400/30 hover:border-orange-400/50',
    pink: 'from-pink-500/20 to-pink-600/10 border-pink-400/30 hover:border-pink-400/50'
  }

  return (
    <button
      onClick={onClick}
      className={`
        relative p-4 bg-gradient-to-br ${colorClasses[color]} border rounded-xl
        hover:scale-105 active:scale-95 transition-all duration-200
        text-left w-full min-h-[100px]
      `}
    >
      {badge && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {badge}
        </div>
      )}
      
      <div className={`w-10 h-10 rounded-lg bg-${color}-400/30 flex items-center justify-center mb-3`}>
        {icon}
      </div>
      
      <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
      <p className="text-cosmos-400 text-xs">{subtitle}</p>
    </button>
  )
}

// 移动端间距组件
export function MobileSpacing({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-12'
  }
  
  return <div className={sizeClasses[size]} />
}