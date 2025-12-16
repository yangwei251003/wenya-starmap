// React错误边界组件

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AppError, ErrorType, ErrorSeverity, logger, errorHandler } from '@/lib/error-handler'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: AppError | null
}

/**
 * 全局错误边界组件
 * 捕获React组件树中的错误并显示友好的错误界面
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // 转换为AppError
    const appError = error instanceof AppError
      ? error
      : new AppError(
          error.message,
          ErrorType.UNKNOWN_ERROR,
          ErrorSeverity.HIGH,
          '应用程序遇到错误，请刷新页面重试'
        )

    return {
      hasError: true,
      error: appError
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 记录错误
    logger.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack
    })

    // 调用自定义错误处理器
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 处理错误
    errorHandler.handle(error, {
      componentStack: errorInfo.componentStack
    })
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null
    })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误界面
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
          <Card className="max-w-md w-full p-6 space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">😔</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                哎呀，出错了
              </h1>
              <p className="text-gray-600 mb-4">
                {this.state.error.userMessage}
              </p>
            </div>

            {/* 错误详情（仅在开发环境显示） */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                <p className="font-semibold text-red-800 mb-2">错误详情：</p>
                <p className="text-red-700 font-mono text-xs break-all">
                  {this.state.error.message}
                </p>
                <p className="text-red-600 text-xs mt-2">
                  类型: {this.state.error.type}
                </p>
                <p className="text-red-600 text-xs">
                  严重程度: {this.state.error.severity}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={this.handleReset}
                className="flex-1"
                variant="outline"
              >
                重试
              </Button>
              <Button
                onClick={this.handleReload}
                className="flex-1"
              >
                刷新页面
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              如果问题持续存在，请联系技术支持
            </p>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * 错误提示组件
 */
interface ErrorAlertProps {
  error: AppError | Error | string
  onDismiss?: () => void
}

export function ErrorAlert({ error, onDismiss }: ErrorAlertProps): JSX.Element {
  const errorMessage = typeof error === 'string'
    ? error
    : error instanceof AppError
    ? error.userMessage
    : error.message

  const severity = error instanceof AppError
    ? error.severity
    : ErrorSeverity.MEDIUM

  const bgColor = {
    [ErrorSeverity.LOW]: 'bg-yellow-50 border-yellow-200',
    [ErrorSeverity.MEDIUM]: 'bg-orange-50 border-orange-200',
    [ErrorSeverity.HIGH]: 'bg-red-50 border-red-200',
    [ErrorSeverity.CRITICAL]: 'bg-red-100 border-red-300'
  }[severity]

  const textColor = {
    [ErrorSeverity.LOW]: 'text-yellow-800',
    [ErrorSeverity.MEDIUM]: 'text-orange-800',
    [ErrorSeverity.HIGH]: 'text-red-800',
    [ErrorSeverity.CRITICAL]: 'text-red-900'
  }[severity]

  return (
    <div className={`${bgColor} border rounded-lg p-4 flex items-start gap-3`}>
      <div className="flex-shrink-0 text-2xl">⚠️</div>
      <div className="flex-1">
        <p className={`${textColor} font-medium`}>{errorMessage}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`${textColor} hover:opacity-70 transition-opacity`}
          aria-label="关闭"
        >
          ✕
        </button>
      )}
    </div>
  )
}

/**
 * 加载错误组件
 */
interface LoadingErrorProps {
  message?: string
  onRetry?: () => void
}

export function LoadingError({ message, onRetry }: LoadingErrorProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-4">📡</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        加载失败
      </h3>
      <p className="text-gray-600 mb-4">
        {message || '无法加载内容，请稍后重试'}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          重新加载
        </Button>
      )}
    </div>
  )
}
