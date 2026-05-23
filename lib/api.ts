// API客户端配置和基础函数

import { APIResponse, APIError } from '@/types'
import { AppError, ErrorType, ErrorSeverity, logger, errorHandler } from './error-handler'
import { performanceMonitor } from './performance-monitor'
import { callOpenRouterAPI, type OpenRouterMessage } from './openrouter'

// API基础URL配置
// 浏览器端默认走同域 /api，避免线上构建把 localhost 烘进前端包导致注册/登录失败。
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
const API_BASE_URL =
  configuredApiUrl && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/api\/?$/i.test(configuredApiUrl)
    ? configuredApiUrl.replace(/\/$/, '')
    : '/api'

// API超时配置（毫秒）
const API_TIMEOUT = 30000 // 30秒

/**
 * 带超时的fetch请求
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if ((error as Error).name === 'AbortError') {
      throw new AppError(
        '请求超时',
        ErrorType.NETWORK_ERROR,
        ErrorSeverity.HIGH,
        '请求超时，请检查网络连接后重试'
      )
    }
    throw error
  }
}

// 通用API请求函数
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  const method = options.method || 'GET'
  const startTime = performance.now()

  const authToken =
    typeof window !== 'undefined' ? localStorage.getItem('wenya_token') : null
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  }

  logger.info(`API Request: ${method} ${endpoint}`)

  try {
    const response = await fetchWithTimeout(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })

    const duration = performance.now() - startTime
    const data = await response.json()

    // 记录性能指标
    performanceMonitor.recordAPIMetric(
      endpoint,
      method,
      duration,
      response.ok,
      response.status
    )

    if (!response.ok) {
      const error = new AppError(
        data.error?.message || '请求失败',
        ErrorType.API_ERROR,
        response.status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
        data.error?.message || '请求失败，请稍后重试',
        { endpoint, method, statusCode: response.status }
      )
      
      errorHandler.handle(error)

      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error.userMessage,
        },
        timestamp: new Date().toISOString(),
      }
    }

    logger.info(`API Success: ${method} ${endpoint}`, { duration: `${duration.toFixed(2)}ms` })

    if (data && typeof data === 'object' && 'success' in data) {
      return {
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
      } as APIResponse<T>
    }

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    const duration = performance.now() - startTime
    
    // 记录失败的API调用
    performanceMonitor.recordAPIMetric(
      endpoint,
      method,
      duration,
      false
    )

    const appError = errorHandler.handle(error as Error, { endpoint, method })

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

// GET请求
export async function apiGet<T = any>(endpoint: string): Promise<APIResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'GET' })
}

// POST请求
export async function apiPost<T = any>(
  endpoint: string,
  data?: any
): Promise<APIResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

// PUT请求
export async function apiPut<T = any>(
  endpoint: string,
  data?: any
): Promise<APIResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

// DELETE请求
export async function apiDelete<T = any>(endpoint: string): Promise<APIResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'DELETE' })
}

// OpenRouter AI API调用函数（兼容旧函数名）
export async function callGLMAPI(
  messages: Array<{ role: string; content: string }>,
  model: string = 'glm-4'
): Promise<APIResponse<string>> {
  const normalizedMessages: OpenRouterMessage[] = messages.map((message) => ({
    role:
      message.role === 'assistant' || message.role === 'system'
        ? message.role
        : 'user',
    content: message.content,
  }))

  const response = await callOpenRouterAPI(normalizedMessages, {
    model: model.startsWith('glm') ? undefined : model,
  })

  return response
}

// 用户认证相关API
export const authAPI = {
  // 用户注册
  register: async (userData: {
    username: string
    email: string
    password: string
    level: string
  }) => {
    try {
      return await apiPost('/auth/register', userData)
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: '网络连接失败，请检查网络设置'
        },
        timestamp: new Date().toISOString()
      }
    }
  },

  // 用户登录
  login: async (credentials: { email: string; password: string }) => {
    try {
      return await apiPost('/auth/login', credentials)
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: '网络连接失败，请检查网络设置'
        },
        timestamp: new Date().toISOString()
      }
    }
  },

  // 用户登出
  logout: () => apiPost('/auth/logout'),

  // 获取当前用户信息
  getCurrentUser: () => apiGet('/auth/me'),
}

// 学习相关API
export const learningAPI = {
  // 获取学习路径
  getLearningPath: (userId: string) => apiGet(`/learning/path/${userId}`),

  // 更新学习进度
  updateProgress: (progressData: any) => apiPost('/learning/progress', progressData),

  // 获取推荐内容
  getRecommendations: (userId: string) => apiGet(`/learning/recommendations/${userId}`),
}

// 课程相关API
export const lessonAPI = {
  // 获取课程列表
  getLessons: (level?: string) => apiGet(`/lessons${level ? `?level=${level}` : ''}`),

  // 获取课程详情
  getLesson: (lessonId: string) => apiGet(`/lessons/${lessonId}`),

  // 完成课程
  completeLesson: (lessonId: string, data: any) =>
    apiPost(`/lessons/${lessonId}/complete`, data),
}

// 练习相关API
export const exerciseAPI = {
  // 获取练习题
  getExercises: (type?: string) => apiGet(`/exercises${type ? `?type=${type}` : ''}`),

  // 提交练习答案
  submitAnswer: (exerciseId: string, answer: any) =>
    apiPost(`/exercises/${exerciseId}/submit`, answer),

  // 获取练习结果
  getResults: (sessionId: string) => apiGet(`/exercises/results/${sessionId}`),
}

// AI相关API
export const aiAPI = {
  // 生成学习内容
  generateContent: (prompt: string, userLevel: string) =>
    apiPost('/ai/generate-content', { prompt, userLevel }),

  // 评估答案
  evaluateAnswer: (question: string, answer: string) =>
    apiPost('/ai/evaluate-answer', { question, answer }),

  // AI对话
  chat: (messages: Array<{ role: string; content: string }>) =>
    apiPost('/ai/chat', { messages }),
}
