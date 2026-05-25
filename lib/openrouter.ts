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

function buildModelFallbacks(primaryModel: string): string[] {
  const fallbackModels = env.openRouterFallbackModels
    .split(',')
    .map(model => model.trim())
    .filter(Boolean)

  return Array.from(new Set([primaryModel, ...fallbackModels]))
}

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
  const models = buildModelFallbacks(model)

  logger.info('OpenRouter API Request', {
    model,
    fallbackCount: models.length - 1,
    messageCount: messages.length,
  })

  try {
    let lastStatus: number | undefined
    let lastErrorMessage = 'OpenRouter API调用失败'

    for (const attemptModel of models) {
      const attemptStartTime = performance.now()
      const response = await fetchWithTimeout(
        OPENROUTER_API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.openRouterApiKey}`,
            'HTTP-Referer': env.appUrl,
            'X-Title': 'Wenya Starmap',
          },
          body: JSON.stringify({
            model: attemptModel,
            messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 1200,
          }),
        },
        60000
      )

      const duration = performance.now() - attemptStartTime
      const data = await response.json()

      performanceMonitor.recordAPIMetric(
        '/openrouter/chat',
        'POST',
        duration,
        response.ok,
        response.status,
        { model: attemptModel, primaryModel: model, messageCount: messages.length }
      )

      if (!response.ok) {
        lastStatus = response.status
        lastErrorMessage = data?.error?.message || lastErrorMessage
        logger.warn('OpenRouter model attempt failed', {
          model: attemptModel,
          statusCode: response.status,
          message: lastErrorMessage,
        })
        continue
      }

      const content = data?.choices?.[0]?.message?.content || ''

      if (!content) {
        lastStatus = response.status
        lastErrorMessage = 'OpenRouter 返回了空内容'
        logger.warn('OpenRouter model returned empty content', {
          model: attemptModel,
          finishReason: data?.choices?.[0]?.finish_reason,
        })
        continue
      }

      logger.info('OpenRouter API Success', {
        model: attemptModel,
        duration: `${(performance.now() - startTime).toFixed(2)}ms`,
        responseLength: content.length,
      })

      return {
        success: true,
        data: content,
        timestamp: new Date().toISOString(),
      }
    }

    const error = new AppError(
      lastErrorMessage,
      ErrorType.AI_SERVICE_ERROR,
      ErrorSeverity.HIGH,
      'AI服务暂时不可用，请稍后重试',
      { statusCode: lastStatus, model, fallbackModels: models.slice(1) }
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
