// 错误处理系统测试

import {
  AppError,
  ErrorType,
  ErrorSeverity,
  Logger,
  ErrorHandler
} from '../error-handler'

describe('AppError', () => {
  it('should create an AppError with correct properties', () => {
    const error = new AppError(
      'Test error',
      ErrorType.API_ERROR,
      ErrorSeverity.HIGH,
      'User friendly message'
    )

    expect(error.message).toBe('Test error')
    expect(error.type).toBe(ErrorType.API_ERROR)
    expect(error.severity).toBe(ErrorSeverity.HIGH)
    expect(error.userMessage).toBe('User friendly message')
    expect(error.timestamp).toBeInstanceOf(Date)
  })

  it('should use default user message when not provided', () => {
    const error = new AppError(
      'Test error',
      ErrorType.NETWORK_ERROR
    )

    expect(error.userMessage).toBe('网络连接失败，请检查网络设置')
  })

  it('should convert to JSON correctly', () => {
    const error = new AppError(
      'Test error',
      ErrorType.VALIDATION_ERROR,
      ErrorSeverity.LOW,
      'Invalid input',
      { field: 'email' }
    )

    const json = error.toJSON()

    expect(json.name).toBe('AppError')
    expect(json.message).toBe('Test error')
    expect(json.type).toBe(ErrorType.VALIDATION_ERROR)
    expect(json.severity).toBe(ErrorSeverity.LOW)
    expect(json.userMessage).toBe('Invalid input')
    expect(json.context).toEqual({ field: 'email' })
    expect(json.timestamp).toBeDefined()
  })
})

describe('Logger', () => {
  let logger: Logger

  beforeEach(() => {
    logger = Logger.getInstance()
    logger.clearLogs()
  })

  it('should be a singleton', () => {
    const logger1 = Logger.getInstance()
    const logger2 = Logger.getInstance()
    expect(logger1).toBe(logger2)
  })

  it('should log debug messages', () => {
    logger.debug('Debug message', { key: 'value' })
    const logs = logger.getLogs()
    
    expect(logs.length).toBe(1)
    expect(logs[0].message).toBe('Debug message')
    expect(logs[0].context).toEqual({ key: 'value' })
  })

  it('should log info messages', () => {
    logger.info('Info message')
    const logs = logger.getLogs()
    
    expect(logs.length).toBe(1)
    expect(logs[0].message).toBe('Info message')
  })

  it('should log warnings', () => {
    logger.warn('Warning message')
    const logs = logger.getLogs()
    
    expect(logs.length).toBe(1)
    expect(logs[0].message).toBe('Warning message')
  })

  it('should log errors with error objects', () => {
    const error = new Error('Test error')
    logger.error('Error occurred', error, { additional: 'context' })
    
    const logs = logger.getLogs()
    expect(logs.length).toBe(1)
    expect(logs[0].message).toBe('Error occurred')
    expect(logs[0].context?.error).toBeDefined()
  })

  it('should clear logs', () => {
    logger.info('Message 1')
    logger.info('Message 2')
    expect(logger.getLogs().length).toBe(2)
    
    logger.clearLogs()
    expect(logger.getLogs().length).toBe(0)
  })

  it('should limit log size to prevent memory leaks', () => {
    // Log more than the limit (1000)
    for (let i = 0; i < 1100; i++) {
      logger.info(`Message ${i}`)
    }
    
    const logs = logger.getLogs()
    expect(logs.length).toBeLessThanOrEqual(500)
  })
})

describe('ErrorHandler', () => {
  beforeEach(() => {
    const logger = Logger.getInstance()
    logger.clearLogs()
  })

  it('should handle AppError correctly', () => {
    const appError = new AppError(
      'Test error',
      ErrorType.API_ERROR,
      ErrorSeverity.HIGH
    )

    const handled = ErrorHandler.handle(appError)
    expect(handled).toBe(appError)
  })

  it('should convert regular Error to AppError', () => {
    const error = new Error('Regular error')
    const handled = ErrorHandler.handle(error)

    expect(handled).toBeInstanceOf(AppError)
    expect(handled.message).toBe('Regular error')
    expect(handled.type).toBe(ErrorType.UNKNOWN_ERROR)
  })

  it('should detect network errors', () => {
    const error = new Error('network timeout')
    const handled = ErrorHandler.handle(error)

    expect(handled.type).toBe(ErrorType.NETWORK_ERROR)
    expect(handled.severity).toBe(ErrorSeverity.HIGH)
  })

  it('should detect auth errors', () => {
    const error = new Error('unauthorized access')
    const handled = ErrorHandler.handle(error)

    expect(handled.type).toBe(ErrorType.AUTH_ERROR)
    expect(handled.severity).toBe(ErrorSeverity.HIGH)
  })

  it('should detect validation errors', () => {
    const error = new Error('validation failed')
    const handled = ErrorHandler.handle(error)

    expect(handled.type).toBe(ErrorType.VALIDATION_ERROR)
    expect(handled.severity).toBe(ErrorSeverity.LOW)
  })

  it('should handle async operations', async () => {
    const successPromise = Promise.resolve('success')
    const [error, result] = await ErrorHandler.handleAsync(successPromise)

    expect(error).toBeNull()
    expect(result).toBe('success')
  })

  it('should handle async errors', async () => {
    const failPromise = Promise.reject(new Error('async error'))
    const [error, result] = await ErrorHandler.handleAsync(failPromise)

    expect(error).toBeInstanceOf(AppError)
    expect(error?.message).toBe('async error')
    expect(result).toBeNull()
  })
})
