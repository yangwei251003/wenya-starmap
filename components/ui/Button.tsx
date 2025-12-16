import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'sprout' | 'star' | 'cosmos' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'sprout',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
  
  const variantClasses = {
    sprout: 'bg-gradient-to-r from-sprout-500 to-sprout-600 hover:from-sprout-600 hover:to-sprout-700 text-white',
    star: 'bg-gradient-to-r from-star-500 to-star-600 hover:from-star-600 hover:to-star-700 text-cosmos-900',
    cosmos: 'bg-gradient-to-r from-cosmos-600 to-cosmos-700 hover:from-cosmos-700 hover:to-cosmos-800 text-white',
    outline: 'border-2 border-sprout-400 text-sprout-400 hover:bg-sprout-400 hover:text-white'
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>加载中...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}