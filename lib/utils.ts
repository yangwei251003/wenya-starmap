import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// 合并CSS类名的工具函数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化时间的工具函数
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟${remainingSeconds}秒`
  } else {
    return `${remainingSeconds}秒`
  }
}

// 计算学习进度百分比
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

// 生成随机星星位置
export function generateStarPosition(): { x: number; y: number } {
  return {
    x: Math.random() * 100, // 0-100%
    y: Math.random() * 100, // 0-100%
  }
}

// 根据分数获取等级
export function getScoreLevel(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'fair'
  return 'poor'
}

// 获取等级对应的颜色
export function getLevelColor(level: 'excellent' | 'good' | 'fair' | 'poor'): string {
  switch (level) {
    case 'excellent':
      return 'text-star-400'
    case 'good':
      return 'text-sprout-400'
    case 'fair':
      return 'text-yellow-400'
    case 'poor':
      return 'text-red-400'
    default:
      return 'text-cosmos-400'
  }
}

// 格式化日期
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// 格式化相对时间
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return '刚刚'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}分钟前`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}小时前`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}天前`
  }
}

// 验证邮箱格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证密码强度
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('密码长度至少8位')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('密码需包含至少一个大写字母')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('密码需包含至少一个小写字母')
  }
  
  if (!/\d/.test(password)) {
    errors.push('密码需包含至少一个数字')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 生成随机ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// 延迟函数
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}