// 数据安全和隐私保护

import { logger } from './error-handler'

/**
 * 敏感数据类型
 */
export enum SensitiveDataType {
  EMAIL = 'EMAIL',
  PASSWORD = 'PASSWORD',
  API_KEY = 'API_KEY',
  TOKEN = 'TOKEN',
  PHONE = 'PHONE',
  ID_CARD = 'ID_CARD'
}

/**
 * 数据脱敏工具
 */
export class DataMasking {
  /**
   * 脱敏邮箱地址
   */
  static maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '***'
    
    const [username, domain] = email.split('@')
    const maskedUsername = username.length > 2
      ? username[0] + '***' + username[username.length - 1]
      : '***'
    
    return `${maskedUsername}@${domain}`
  }

  /**
   * 脱敏密码（完全隐藏）
   */
  static maskPassword(): string {
    return '********'
  }

  /**
   * 脱敏API密钥
   */
  static maskAPIKey(key: string): string {
    if (!key || key.length < 8) return '***'
    return key.substring(0, 4) + '***' + key.substring(key.length - 4)
  }

  /**
   * 脱敏令牌
   */
  static maskToken(token: string): string {
    if (!token || token.length < 16) return '***'
    return token.substring(0, 8) + '...' + token.substring(token.length - 8)
  }

  /**
   * 脱敏手机号
   */
  static maskPhone(phone: string): string {
    if (!phone || phone.length < 7) return '***'
    const tailLength = phone.length >= 11 ? 4 : 3
    return phone.substring(0, 3) + '****' + phone.substring(phone.length - tailLength)
  }

  /**
   * 通用脱敏方法
   */
  static mask(data: string, type: SensitiveDataType): string {
    switch (type) {
      case SensitiveDataType.EMAIL:
        return this.maskEmail(data)
      case SensitiveDataType.PASSWORD:
        return this.maskPassword()
      case SensitiveDataType.API_KEY:
        return this.maskAPIKey(data)
      case SensitiveDataType.TOKEN:
        return this.maskToken(data)
      case SensitiveDataType.PHONE:
        return this.maskPhone(data)
      default:
        return '***'
    }
  }

  /**
   * 脱敏对象中的敏感字段
   */
  static maskObject<T extends Record<string, any>>(
    obj: T,
    sensitiveFields: Array<{ field: string; type: SensitiveDataType }>
  ): T {
    const masked = { ...obj } as any

    sensitiveFields.forEach(({ field, type }) => {
      if (field in masked && typeof masked[field] === 'string') {
        masked[field] = this.mask(masked[field], type)
      }
    })

    return masked as T
  }
}

/**
 * 输入验证工具
 */
export class InputValidator {
  /**
   * 验证邮箱格式
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * 验证密码强度
   * 要求：至少8个字符，包含大小写字母和数字
   */
  static isValidPassword(password: string): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('密码长度至少为8个字符')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('密码必须包含小写字母')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('密码必须包含大写字母')
    }

    if (!/[0-9]/.test(password)) {
      errors.push('密码必须包含数字')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 验证用户名
   * 要求：3-20个字符，只能包含字母、数字、下划线
   */
  static isValidUsername(username: string): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (username.length < 3 || username.length > 20) {
      errors.push('用户名长度必须在3-20个字符之间')
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('用户名只能包含字母、数字和下划线')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 清理HTML标签（防止XSS攻击）
   */
  static sanitizeHTML(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  /**
   * 验证并清理用户输入
   */
  static sanitizeInput(input: string, maxLength: number = 1000): string {
    if (!input) return ''
    
    // 限制长度
    let sanitized = input.substring(0, maxLength)
    
    // 移除控制字符
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')
    
    // 清理HTML
    sanitized = this.sanitizeHTML(sanitized)
    
    return sanitized.trim()
  }
}

/**
 * 安全存储工具（用于本地存储）
 */
export class SecureStorage {
  private static readonly ENCRYPTION_KEY = 'wenya-starmap-key'

  /**
   * 简单的加密（实际应用中应使用更强的加密算法）
   */
  private static encrypt(data: string): string {
    // 这里使用简单的Base64编码作为示例
    // 实际应用中应使用AES等加密算法
    try {
      return btoa(encodeURIComponent(data))
    } catch (error) {
      logger.error('Encryption failed', error as Error)
      return data
    }
  }

  /**
   * 简单的解密
   */
  private static decrypt(data: string): string {
    try {
      return decodeURIComponent(atob(data))
    } catch (error) {
      logger.error('Decryption failed', error as Error)
      return data
    }
  }

  /**
   * 安全存储数据
   */
  static setItem(key: string, value: any): void {
    if (typeof localStorage === 'undefined') return

    try {
      const serialized = JSON.stringify(value)
      const encrypted = this.encrypt(serialized)
      localStorage.setItem(key, encrypted)
    } catch (error) {
      logger.error('Failed to store data securely', error as Error, { key })
    }
  }

  /**
   * 安全读取数据
   */
  static getItem<T = any>(key: string): T | null {
    if (typeof localStorage === 'undefined') return null

    try {
      const encrypted = localStorage.getItem(key)
      if (!encrypted) return null

      const decrypted = this.decrypt(encrypted)
      return JSON.parse(decrypted) as T
    } catch (error) {
      logger.error('Failed to retrieve data securely', error as Error, { key })
      return null
    }
  }

  /**
   * 删除数据
   */
  static removeItem(key: string): void {
    if (typeof localStorage === 'undefined') return

    try {
      localStorage.removeItem(key)
    } catch (error) {
      logger.error('Failed to remove data', error as Error, { key })
    }
  }

  /**
   * 清空所有数据
   */
  static clear(): void {
    if (typeof localStorage === 'undefined') return

    try {
      localStorage.clear()
    } catch (error) {
      logger.error('Failed to clear storage', error as Error)
    }
  }
}

/**
 * 速率限制器（防止API滥用）
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private readonly maxRequests: number
  private readonly timeWindow: number // 毫秒

  constructor(maxRequests: number = 10, timeWindowSeconds: number = 60) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindowSeconds * 1000
  }

  /**
   * 检查是否允许请求
   */
  allowRequest(identifier: string): boolean {
    const now = Date.now()
    const userRequests = this.requests.get(identifier) || []

    // 清理过期的请求记录
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.timeWindow
    )

    if (validRequests.length >= this.maxRequests) {
      logger.warn('Rate limit exceeded', { identifier, count: validRequests.length })
      return false
    }

    // 记录新请求
    validRequests.push(now)
    this.requests.set(identifier, validRequests)

    return true
  }

  /**
   * 重置用户的请求记录
   */
  reset(identifier: string): void {
    this.requests.delete(identifier)
  }

  /**
   * 清空所有记录
   */
  clearAll(): void {
    this.requests.clear()
  }
}

/**
 * 导出工具实例
 */
export const dataMasking = DataMasking
export const inputValidator = InputValidator
export const secureStorage = SecureStorage

// 创建默认的速率限制器实例
export const apiRateLimiter = new RateLimiter(30, 60) // 每分钟最多30次请求
export const aiRateLimiter = new RateLimiter(10, 60) // AI服务每分钟最多10次请求
