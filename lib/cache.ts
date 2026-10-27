// 缓存和性能优化工具

import { logger } from './error-handler'

/**
 * 缓存项接口
 */
interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

/**
 * 缓存配置
 */
interface CacheConfig {
  ttl?: number // 生存时间（毫秒）
  maxSize?: number // 最大缓存项数
}

/**
 * 内存缓存类
 */
export class MemoryCache<T = any> {
  private cache: Map<string, CacheItem<T>> = new Map()
  private readonly ttl: number
  private readonly maxSize: number

  constructor(config: CacheConfig = {}) {
    this.ttl = config.ttl || 5 * 60 * 1000 // 默认5分钟
    this.maxSize = config.maxSize || 100 // 默认最多100项
  }

  /**
   * 设置缓存
   */
  set(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL || this.ttl
    const now = Date.now()

    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.getOldestKey()
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    })

    logger.debug('Cache set', { key, ttl })
  }

  /**
   * 获取缓存
   */
  get(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      logger.debug('Cache miss', { key })
      return null
    }

    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      logger.debug('Cache expired', { key })
      return null
    }

    logger.debug('Cache hit', { key })
    return item.data
  }

  /**
   * 检查缓存是否存在且有效
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
    logger.info('Cache cleared')
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取最旧的缓存键
   */
  private getOldestKey(): string | null {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    this.cache.forEach((item, key) => {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    })

    return oldestKey
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()
    let cleanedCount = 0
    const keysToDelete: string[] = []

    this.cache.forEach((item, key) => {
      if (now > item.expiresAt) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => {
      this.cache.delete(key)
      cleanedCount++
    })

    if (cleanedCount > 0) {
      logger.info('Cache cleanup completed', { cleanedCount })
    }
  }
}

/**
 * API响应缓存
 */
export class APICache extends MemoryCache<any> {
  constructor() {
    super({
      ttl: 5 * 60 * 1000, // 5分钟
      maxSize: 50
    })
  }

  /**
   * 生成缓存键
   */
  static generateKey(endpoint: string, params?: Record<string, any>): string {
    const paramStr = params ? JSON.stringify(params) : ''
    return `${endpoint}:${paramStr}`
  }
}

/**
 * 函数结果缓存装饰器
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    ttl?: number
    keyGenerator?: (...args: Parameters<T>) => string
  } = {}
): T {
  const cache = new MemoryCache<ReturnType<T>>({
    ttl: options.ttl || 5 * 60 * 1000
  })

  const keyGenerator = options.keyGenerator || ((...args: any[]) => JSON.stringify(args))

  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args)
    const cached = cache.get(key)

    if (cached !== null) {
      return cached
    }

    const result = fn(...args)

    // 如果是Promise，等待结果后缓存
    if (result instanceof Promise) {
      return result.then(value => {
        cache.set(key, value)
        return value
      })
    }

    cache.set(key, result)
    return result
  }) as T
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true

      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 批量请求处理器
 */
export class BatchProcessor<T, R> {
  private queue: Array<{
    item: T
    resolve: (value: R) => void
    reject: (error: any) => void
  }> = []
  private timer: NodeJS.Timeout | null = null
  private readonly batchSize: number
  private readonly delay: number
  private readonly processor: (items: T[]) => Promise<R[]>

  constructor(
    processor: (items: T[]) => Promise<R[]>,
    options: {
      batchSize?: number
      delay?: number
    } = {}
  ) {
    this.processor = processor
    this.batchSize = options.batchSize || 10
    this.delay = options.delay || 100
  }

  /**
   * 添加项到批处理队列
   */
  add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject })

      // 如果达到批量大小，立即处理
      if (this.queue.length >= this.batchSize) {
        this.flush()
      } else {
        // 否则等待延迟后处理
        this.scheduleFlush()
      }
    })
  }

  /**
   * 安排刷新
   */
  private scheduleFlush(): void {
    if (this.timer) return

    this.timer = setTimeout(() => {
      this.flush()
    }, this.delay)
  }

  /**
   * 刷新队列
   */
  private async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (this.queue.length === 0) return

    const batch = this.queue.splice(0, this.batchSize)
    const items = batch.map(b => b.item)

    try {
      const results = await this.processor(items)

      batch.forEach((b, index) => {
        b.resolve(results[index])
      })
    } catch (error) {
      batch.forEach(b => {
        b.reject(error)
      })
    }
  }
}

/**
 * 导出缓存实例
 */
export const apiCache = new APICache()

// 定期清理过期缓存
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup()
  }, 60 * 1000) // 每分钟清理一次
}
