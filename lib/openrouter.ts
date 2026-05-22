import { env } from './env'
import { APIResponse } from '@/types'
import { AppError, ErrorSeverity, ErrorType, errorHandler, logger } from './error-handler'
import { performanceMonitor } from './performance-monitor'

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenRouterOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 60000
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timer)
    return response
  } catch (error) {
    clearTimeout(timer)
    if ((error as Error).name === 'AbortError') {
      throw new AppError(
        '请求超时',
        ErrorType.NETWORK_ERROR,
        ErrorSeverity.HIGH,
        'AI请求超时，请稍后再试'
      )
    }
    throw error
  }
}

export async function callOpenRouterAPI(
  messages: OpenRouterMessage[],
  options: OpenRouterOptions = {}
): Promise<APIResponse<string>> {
  if (!env.openRouterApiKey) {
    const error = new AppError(
      'OpenRouter API密钥未配置',
      ErrorType.AI_SERVICE_ERROR,
      ErrorSeverity.CRITICAL,
      'AI服务配置错误，请联系管理员'
    )
    errorHandler.handle(error)

    return {
      success: false,
      error: {
        code: 'MISSING_API_KEY',
        message: error.userMessage,
      },
      timestamp: new Date().toISOString(),
    }
  }

  const startTime = performance.now()
  const model = options.model || env.openRouterModel

  logger.info('OpenRouter API Request', {
    model,
    messageCount: messages.length,
  })

  try {
    const response = await fetchWithTimeout(
      OPENROUTER_API_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.openRouterApiKey}`,
          'HTTP-Referer': env.appUrl,
          'X-Title': '问芽星图',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 1200,
        }),
      },
      60000
    )

    const duration = performance.now() - startTime
    const data = await response.json()

    performanceMonitor.recordAPIMetric(
      '/openrouter/chat',
      'POST',
      duration,
      response.ok,
      response.status,
      { model, messageCount: messages.length }
    )

    if (!response.ok) {
      const error = new AppError(
        data?.error?.message || 'OpenRouter API调用失败',
        ErrorType.AI_SERVICE_ERROR,
        ErrorSeverity.HIGH,
        'AI服务暂时不可用，请稍后重试',
        { statusCode: response.status, model }
      )
      errorHandler.handle(error)

      return {
        success: false,
        error: {
          code: 'OPENROUTER_API_ERROR',
          message: error.userMessage,
        },
        timestamp: new Date().toISOString(),
      }
    }

    const content = data?.choices?.[0]?.message?.content || ''

    logger.info('OpenRouter API Success', {
      duration: `${duration.toFixed(2)}ms`,
      responseLength: content.length,
    })

    return {
      success: true,
      data: content,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    const duration = performance.now() - startTime

    performanceMonitor.recordAPIMetric(
      '/openrouter/chat',
      'POST',
      duration,
      false,
      undefined,
      { model, messageCount: messages.length }
    )

    const appError = errorHandler.handle(error as Error, {
      model,
      messageCount: messages.length,
    })

    return {
      success: false,
      error: {
        code: appError.type,
        message: appError.userMessage,
      },
      timestamp: new Date().toISOString(),
    }
  }
}
