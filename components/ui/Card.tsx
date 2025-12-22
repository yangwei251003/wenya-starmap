import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  variant?: 'sprout' | 'star' | 'cosmos'
  className?: string
  children: React.ReactNode
  onClick?: () => void
  style?: React.CSSProperties
}

export function Card({ variant = 'cosmos', className, children, onClick, style }: CardProps) {
  const variantClasses = {
    sprout: 'sprout-card',
    star: 'star-card',
    cosmos: 'cosmos-card'
  }

  return (
    <div 
      className={cn(variantClasses[variant], className, onClick && 'cursor-pointer')}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  className?: string
  children: React.ReactNode
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  className?: string
  children: React.ReactNode
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3 className={cn('text-xl font-semibold', className)}>
      {children}
    </h3>
  )
}

interface CardContentProps {
  className?: string
  children: React.ReactNode
}

export function CardContent({ className, children }: CardContentProps) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  )
}