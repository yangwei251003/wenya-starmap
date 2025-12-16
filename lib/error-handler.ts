// 错误处理和日志记录系统

/**
 * 错误类型枚举
 */
export enum ErrorType {
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 错误严重程度
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * 应用错误类
 */
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly severity: ErrorSeverity
  public readonly timestamp: Date
  public readonly context?: Record<string, any>
  public readonly userMessage: string

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN_ERROR,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    userMessage?: string,
    context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.severity = severity
    this.timestamp = new Date()
    this.context = context
    this.userMessage = userMessage || this.getDefaultUserMessage(type)

    // 维护正确的堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  /**
   * 获取默认用户友好消息
   */
  private getDefaultUserMessage(type: ErrorType): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.API_ERROR]: '服务请求失败，请稍后重试',
      [ErrorType.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
      [ErrorType.VALIDATION_ERROR]: '输入数据有误，请检查后重试',
      [ErrorType.AUTH_ERROR]: '身份验证失败，请重新登录',
      [ErrorType.AI_SERVICE_ERROR]: 'AI服务暂时不可用，请稍后重试',
      [ErrorType.DATABASE_ERROR]: '数据操作失败，请稍后重试',
      [ErrorType.UNKNOWN_ERROR]: '发生未知错误，请稍后重试'
    }
    return messages[type]
  }

  /**
   * 转换为JSON格式
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
      userMessage: this.userMessage,
      context: this.context,
      stack: this.stack
    }
  }
}

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * 日志记录器类
 */
export class Logger {
  private static instance: Logger
  private logs: Array<{
    level: LogLevel
    message: string
    timestamp: Date
    context?: Record<string, any>
  }> = []

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  /**
   * 记录调试信息
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * 记录一般信息
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * 记录警告
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * 记录错误
   */
  error(message: string, error?: Error | AppError, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      error: error instanceof AppError ? error.toJSON() : {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      }
    }
    this.log(LogLevel.ERROR, message, errorContext)
  }

  /**
   * 内部日志记录方法
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const logEntry = {
      level,
      message,
      timestamp: new Date(),
      context
    }

    this.logs.push(logEntry)

    // 控制台输出
    const consoleMessage = `[${logEntry.timestamp.toISOString()}] [${level}] ${message}`
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(consoleMessage, context)
        break
      case LogLevel.INFO:
        console.info(consoleMessage, context)
        break
      case LogLevel.WARN:
        console.warn(consoleMessage, context)
        break
      case LogLevel.ERROR:
        console.error(consoleMessage, context)
        break
    }

    // 限制日志数量，避免内存泄漏
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-500)
    }
  }

  /**
   * 获取所有日志
   */
  getLogs(level?: LogLevel): Array<any> {
    if (level) {
      return this.logs.filter(log => log.level === level)
    }
    return [...this.logs]
  }

  /**
   * 清空日志
   */
  clearLogs(): void {
    this.logs = []
  }
}

/**
 * 全局错误处理器
 */
export class ErrorHandler {
  private static logger = Logger.getInstance()

  /**
   * 处理错误
   */
  static handle(error: Error | AppError, context?: Record<string, any>): AppError {
    // 如果已经是AppError，直接记录
    if (error instanceof AppError) {
      this.logger.error('Application error occurred', error, context)
      return error
    }

    // 转换为AppError
    const appError = this.convertToAppError(error, context)
    this.logger.error('Error occurred', appError, context)
    return appError
  }

  /**
   * 转换为AppError
   */
  private static convertToAppError(error: Error, context?: Record<string, any>): AppError {
    // 根据错误消息判断错误类型
    let type = ErrorType.UNKNOWN_ERROR
    let severity = ErrorSeverity.MEDIUM

    if (error.message.includes('network') || error.message.includes('fetch')) {
      type = ErrorType.NETWORK_ERROR
      severity = ErrorSeverity.HIGH
    } else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      type = ErrorType.AUTH_ERROR
      severity = ErrorSeverity.HIGH
    } else if (error.message.includes('validation')) {
      type = ErrorType.VALIDATION_ERROR
      severity = ErrorSeverity.LOW
    } else if (error.message.includes('API') || error.message.includes('GLM')) {
      type = ErrorType.AI_SERVICE_ERROR
      severity = ErrorSeverity.MEDIUM
    }

    return new AppError(
      error.message,
      type,
      severity,
      undefined,
      context
    )
  }

  /**
   * 处理异步错误
   */
  static async handleAsync<T>(
    promise: Promise<T>,
    context?: Record<string, any>
  ): Promise<[AppError | null, T | null]> {
    try {
      const result = await promise
      return [null, result]
    } catch (error) {
      const appError = this.handle(error as Error, context)
      return [appError, null]
    }
  }
}

/**
 * 导出单例实例
 */
export const logger = Logger.getInstance()
export const errorHandler = ErrorHandler
