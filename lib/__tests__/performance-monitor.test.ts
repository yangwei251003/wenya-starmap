// 性能监控系统测试

import { PerformanceMonitor, withPerformanceTracking } from '../performance-monitor'

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor

  beforeEach(() => {
    monitor = PerformanceMonitor.getInstance()
    monitor.clearMetrics()
  })

  it('should be a singleton', () => {
    const monitor1 = PerformanceMonitor.getInstance()
    const monitor2 = PerformanceMonitor.getInstance()
    expect(monitor1).toBe(monitor2)
  })

  it('should start and end timer correctly', () => {
    monitor.startTimer('test-operation')
    
    // Simulate some work
    const start = Date.now()
    while (Date.now() - start < 10) {
      // Wait 10ms
    }
    
    const duration = monitor.endTimer('test-operation')
    expect(duration).toBeGreaterThanOrEqual(10)
  })

  it('should return 0 for non-existent timer', () => {
    const duration = monitor.endTimer('non-existent')
    expect(duration).toBe(0)
  })

  it('should record API metrics', () => {
    monitor.recordAPIMetric(
      '/api/test',
      'GET',
      150,
      true,
      200
    )

    const stats = monitor.getStats()
    expect(stats.apiStats.totalCalls).toBe(1)
    expect(stats.apiStats.successRate).toBe(1)
  })

  it('should calculate success rate correctly', () => {
    monitor.recordAPIMetric('/api/test1', 'GET', 100, true, 200)
    monitor.recordAPIMetric('/api/test2', 'GET', 150, false, 500)
    monitor.recordAPIMetric('/api/test3', 'GET', 120, true, 200)

    const stats = monitor.getStats()
    expect(stats.apiStats.totalCalls).toBe(3)
    expect(stats.apiStats.successRate).toBeCloseTo(2/3, 2)
  })

  it('should track slowest operations', () => {
    monitor.startTimer('fast-op')
    monitor.endTimer('fast-op')

    monitor.startTimer('slow-op')
    const start = Date.now()
    while (Date.now() - start < 50) {
      // Wait 50ms
    }
    monitor.endTimer('slow-op')

    const stats = monitor.getStats()
    expect(stats.slowestOperations.length).toBeGreaterThan(0)
    expect(stats.slowestOperations[0].name).toBe('slow-op')
  })

  it('should limit metrics to prevent memory leaks', () => {
    // Add more than 500 metrics
    for (let i = 0; i < 600; i++) {
      monitor.startTimer(`op-${i}`)
      monitor.endTimer(`op-${i}`)
    }

    const stats = monitor.getStats()
    expect(stats.totalMetrics).toBeLessThanOrEqual(250)
  })

  it('should clear all metrics', () => {
    monitor.startTimer('test')
    monitor.endTimer('test')
    monitor.recordAPIMetric('/api/test', 'GET', 100, true, 200)

    monitor.clearMetrics()

    const stats = monitor.getStats()
    expect(stats.totalMetrics).toBe(0)
    expect(stats.apiStats.totalCalls).toBe(0)
  })

  it('should calculate average duration', () => {
    monitor.startTimer('op1')
    monitor.endTimer('op1', { duration: 100 })
    
    monitor.startTimer('op2')
    monitor.endTimer('op2', { duration: 200 })

    const stats = monitor.getStats()
    expect(stats.averageDuration).toBeGreaterThan(0)
  })
})

describe('withPerformanceTracking', () => {
  let monitor: PerformanceMonitor

  beforeEach(() => {
    monitor = PerformanceMonitor.getInstance()
    monitor.clearMetrics()
  })

  it('should track async function performance', async () => {
    const testFn = async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return 'result'
    }

    const result = await withPerformanceTracking('test-async', testFn)

    expect(result).toBe('result')
    const stats = monitor.getStats()
    expect(stats.totalMetrics).toBe(1)
  })

  it('should track function with metadata', async () => {
    const testFn = async () => 'result'

    await withPerformanceTracking(
      'test-with-metadata',
      testFn,
      { userId: '123', action: 'test' }
    )

    const metrics = monitor.getAllMetrics()
    expect(metrics.general[0].metadata).toMatchObject({
      userId: '123',
      action: 'test',
      success: true
    })
  })

  it('should handle errors in tracked functions', async () => {
    const testFn = async () => {
      throw new Error('Test error')
    }

    await expect(
      withPerformanceTracking('test-error', testFn)
    ).rejects.toThrow('Test error')

    const metrics = monitor.getAllMetrics()
    expect(metrics.general[0].metadata?.success).toBe(false)
  })
})
