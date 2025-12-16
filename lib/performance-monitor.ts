// 性能监控系统

import { logger } from './error-handler'

/**
 * 性能指标接口
 */
export interface PerformanceMetric {
  name: string
  duration: number
  timestamp: Date
  metadata?: Record<string, any>
}

/**
 * API性能指标
 */
export interface APIPerformanceMetric extends PerformanceMetric {
  endpoint: string
  method: string
  statusCode?: number
  success: boolean
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private apiMetrics: APIPerformanceMetric[] = []
  private timers: Map<string, number> = new Map()

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * 开始计时
   */
  startTimer(name: string): void {
    this.timers.set(name, performance.now())
  }

  /**
   * 结束计时并记录
   */
  endTimer(name: string, metadata?: Record<string, any>): number {
    const startTime = this.timers.get(name)
    
    if (!startTime) {
      logger.warn(`Timer "${name}" was not started`)
      return 0
    }

    const duration = performance.now() - startTime
    this.timers.delete(name)

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: new Date(),
      metadata
    }

    this.metrics.push(metric)

    // 如果性能较差，记录警告
    if (duration > 3000) {
      logger.warn(`Slow operation detected: ${name}`, { duration, metadata })
    }

    // 限制指标数量
    if (this.metrics.length > 500) {
      this.metrics = this.metrics.slice(-250)
    }

    return duration
  }

  /**
   * 记录API性能
   */
  recordAPIMetric(
    endpoint: string,
    method: string,
    duration: number,
    success: boolean,
    statusCode?: number,
    metadata?: Record<string, any>
  ): void {
    const metric: APIPerformanceMetric = {
      name: `API: ${method} ${endpoint}`,
      endpoint,
      method,
      duration,
      success,
      statusCode,
      timestamp: new Date(),
      metadata
    }

    this.apiMetrics.push(metric)

    // 记录慢API调用
    if (duration > 2000) {
      logger.warn(`Slow API call: ${method} ${endpoint}`, {
        duration,
        statusCode,
        success
      })
    }

    // 记录失败的API调用
    if (!success) {
      logger.error(`Failed API call: ${method} ${endpoint}`, undefined, {
        duration,
        statusCode,
        metadata
      })
    }

    // 限制指标数量
    if (this.apiMetrics.length > 500) {
      this.apiMetrics = this.apiMetrics.slice(-250)
    }
  }

  /**
   * 获取性能统计
   */
  getStats(): {
    totalMetrics: number
    averageDuration: number
    slowestOperations: PerformanceMetric[]
    apiStats: {
      totalCalls: number
      successRate: number
      averageDuration: number
      slowestAPIs: APIPerformanceMetric[]
    }
  } {
    const totalMetrics = this.metrics.length
    const averageDuration = totalMetrics > 0
      ? this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalMetrics
      : 0

    const slowestOperations = [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)

    const totalAPICalls = this.apiMetrics.length
    const successfulCalls = this.apiMetrics.filter(m => m.success).length
    const successRate = totalAPICalls > 0 ? successfulCalls / totalAPICalls : 0
    const apiAverageDuration = totalAPICalls > 0
      ? this.apiMetrics.reduce((sum, m) => sum + m.duration, 0) / totalAPICalls
      : 0

    const slowestAPIs = [...this.apiMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)

    return {
      totalMetrics,
      averageDuration,
      slowestOperations,
      apiStats: {
        totalCalls: totalAPICalls,
        successRate,
        averageDuration: apiAverageDuration,
        slowestAPIs
      }
    }
  }

  /**
   * 清空指标
   */
  clearMetrics(): void {
    this.metrics = []
    this.apiMetrics = []
    this.timers.clear()
  }

  /**
   * 获取所有指标
   */
  getAllMetrics(): {
    general: PerformanceMetric[]
    api: APIPerformanceMetric[]
  } {
    return {
      general: [...this.metrics],
      api: [...this.apiMetrics]
    }
  }
}

/**
 * 性能装饰器 - 用于自动测量函数执行时间
 */
export function measurePerformance(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const metricName = name || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      const monitor = PerformanceMonitor.getInstance()
      monitor.startTimer(metricName)

      try {
        const result = await originalMethod.apply(this, args)
        monitor.endTimer(metricName, { success: true })
        return result
      } catch (error) {
        monitor.endTimer(metricName, { success: false, error: (error as Error).message })
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 性能监控工具函数
 */
export async function withPerformanceTracking<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const monitor = PerformanceMonitor.getInstance()
  monitor.startTimer(name)

  try {
    const result = await fn()
    monitor.endTimer(name, { ...metadata, success: true })
    return result
  } catch (error) {
    monitor.endTimer(name, { ...metadata, success: false, error: (error as Error).message })
    throw error
  }
}

/**
 * 导出单例实例
 */
export const performanceMonitor = PerformanceMonitor.getInstance()
