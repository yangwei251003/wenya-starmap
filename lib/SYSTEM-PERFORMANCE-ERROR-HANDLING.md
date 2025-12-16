# 系统性能和错误处理文档

## 概述

本文档描述了问芽星图（WenYa StarMap）系统的性能优化和错误处理机制。这些功能确保应用程序的稳定性、可靠性和良好的用户体验。

## 核心功能

### 1. 错误处理系统 (`lib/error-handler.ts`)

#### AppError 类
自定义错误类，提供结构化的错误信息：

```typescript
import { AppError, ErrorType, ErrorSeverity } from '@/lib/error-handler'

// 创建自定义错误
const error = new AppError(
  '数据库连接失败',
  ErrorType.DATABASE_ERROR,
  ErrorSeverity.HIGH,
  '无法连接到数据库，请稍后重试'
)
```

**错误类型 (ErrorType):**
- `API_ERROR` - API请求错误
- `NETWORK_ERROR` - 网络连接错误
- `VALIDATION_ERROR` - 数据验证错误
- `AUTH_ERROR` - 身份验证错误
- `AI_SERVICE_ERROR` - AI服务错误
- `DATABASE_ERROR` - 数据库错误
- `UNKNOWN_ERROR` - 未知错误

**错误严重程度 (ErrorSeverity):**
- `LOW` - 低严重程度
- `MEDIUM` - 中等严重程度
- `HIGH` - 高严重程度
- `CRITICAL` - 严重错误

#### Logger 类
统一的日志记录系统：

```typescript
import { logger } from '@/lib/error-handler'

// 记录不同级别的日志
logger.debug('调试信息', { userId: '123' })
logger.info('用户登录成功', { username: 'test' })
logger.warn('API响应缓慢', { duration: 3000 })
logger.error('操作失败', error, { context: 'additional info' })

// 获取日志
const allLogs = logger.getLogs()
const errorLogs = logger.getLogs(LogLevel.ERROR)

// 清空日志
logger.clearLogs()
```

#### ErrorHandler 类
全局错误处理器：

```typescript
import { errorHandler } from '@/lib/error-handler'

// 同步错误处理
try {
  // 可能抛出错误的代码
} catch (error) {
  const appError = errorHandler.handle(error as Error)
  // 处理转换后的AppError
}

// 异步错误处理
const [error, result] = await errorHandler.handleAsync(
  someAsyncOperation(),
  { context: 'user action' }
)

if (error) {
  // 处理错误
} else {
  // 使用结果
}
```

### 2. 性能监控系统 (`lib/performance-monitor.ts`)

#### PerformanceMonitor 类
监控和记录应用程序性能：

```typescript
import { performanceMonitor } from '@/lib/performance-monitor'

// 手动计时
performanceMonitor.startTimer('data-processing')
// ... 执行操作
const duration = performanceMonitor.endTimer('data-processing', {
  recordCount: 100
})

// 记录API性能
performanceMonitor.recordAPIMetric(
  '/api/users',
  'GET',
  150, // 持续时间（毫秒）
  true, // 是否成功
  200, // HTTP状态码
  { userId: '123' } // 额外元数据
)

// 获取性能统计
const stats = performanceMonitor.getStats()
console.log('平均响应时间:', stats.averageDuration)
console.log('API成功率:', stats.apiStats.successRate)
console.log('最慢的操作:', stats.slowestOperations)
```

#### 性能追踪工具函数

```typescript
import { withPerformanceTracking } from '@/lib/performance-monitor'

// 自动追踪异步函数性能
const result = await withPerformanceTracking(
  'fetch-user-data',
  async () => {
    return await fetchUserData(userId)
  },
  { userId }
)
```

#### 性能装饰器

```typescript
import { measurePerformance } from '@/lib/performance-monitor'

class UserService {
  @measurePerformance('UserService.getUser')
  async getUser(id: string) {
    // 方法实现
  }
}
```

### 3. 数据安全和隐私保护 (`lib/security.ts`)

#### DataMasking - 数据脱敏

```typescript
import { DataMasking, SensitiveDataType } from '@/lib/security'

// 脱敏邮箱
const maskedEmail = DataMasking.maskEmail('user@example.com')
// 输出: u***r@example.com

// 脱敏密码
const maskedPassword = DataMasking.maskPassword()
// 输出: ********

// 脱敏API密钥
const maskedKey = DataMasking.maskAPIKey('sk-1234567890abcdef')
// 输出: sk-1***cdef

// 脱敏对象
const user = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'secret123'
}

const masked = DataMasking.maskObject(user, [
  { field: 'email', type: SensitiveDataType.EMAIL },
  { field: 'password', type: SensitiveDataType.PASSWORD }
])
```

#### InputValidator - 输入验证

```typescript
import { InputValidator } from '@/lib/security'

// 验证邮箱
const isValid = InputValidator.isValidEmail('test@example.com')

// 验证密码强度
const passwordResult = InputValidator.isValidPassword('Test1234')
if (!passwordResult.valid) {
  console.log('密码错误:', passwordResult.errors)
}

// 验证用户名
const usernameResult = InputValidator.isValidUsername('test_user')

// 清理HTML（防止XSS攻击）
const safe = InputValidator.sanitizeHTML('<script>alert("xss")</script>')

// 清理用户输入
const cleaned = InputValidator.sanitizeInput(userInput, 1000)
```

#### SecureStorage - 安全存储

```typescript
import { secureStorage } from '@/lib/security'

// 安全存储数据（加密）
secureStorage.setItem('user-token', { token: 'abc123', expires: Date.now() })

// 安全读取数据（解密）
const tokenData = secureStorage.getItem('user-token')

// 删除数据
secureStorage.removeItem('user-token')

// 清空所有数据
secureStorage.clear()
```

#### RateLimiter - 速率限制

```typescript
import { apiRateLimiter, aiRateLimiter } from '@/lib/security'

// 检查是否允许请求
if (apiRateLimiter.allowRequest(userId)) {
  // 执行API请求
} else {
  // 请求被限制
  throw new Error('请求过于频繁')
}

// 重置用户限制
apiRateLimiter.reset(userId)

// 清空所有限制
apiRateLimiter.clearAll()
```

### 4. 缓存系统 (`lib/cache.ts`)

#### MemoryCache - 内存缓存

```typescript
import { MemoryCache } from '@/lib/cache'

const cache = new MemoryCache({
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 100 // 最多100项
})

// 设置缓存
cache.set('user:123', userData, 10 * 60 * 1000) // 自定义10分钟TTL

// 获取缓存
const data = cache.get('user:123')

// 检查缓存是否存在
if (cache.has('user:123')) {
  // 缓存存在且有效
}

// 删除缓存
cache.delete('user:123')

// 清空所有缓存
cache.clear()

// 清理过期缓存
cache.cleanup()
```

#### APICache - API响应缓存

```typescript
import { apiCache, APICache } from '@/lib/cache'

// 生成缓存键
const cacheKey = APICache.generateKey('/api/users', { page: 1, limit: 10 })

// 检查缓存
const cached = apiCache.get(cacheKey)
if (cached) {
  return cached
}

// 获取数据并缓存
const data = await fetchData()
apiCache.set(cacheKey, data)
```

#### 函数结果缓存

```typescript
import { memoize } from '@/lib/cache'

// 缓存函数结果
const expensiveOperation = memoize(
  async (param: string) => {
    // 耗时操作
    return result
  },
  {
    ttl: 10 * 60 * 1000, // 10分钟
    keyGenerator: (param) => `operation:${param}`
  }
)
```

#### 防抖和节流

```typescript
import { debounce, throttle } from '@/lib/cache'

// 防抖 - 延迟执行，多次调用只执行最后一次
const debouncedSearch = debounce((query: string) => {
  performSearch(query)
}, 300)

// 节流 - 限制执行频率
const throttledScroll = throttle(() => {
  handleScroll()
}, 100)
```

#### 批量处理

```typescript
import { BatchProcessor } from '@/lib/cache'

const processor = new BatchProcessor(
  async (items: string[]) => {
    // 批量处理多个项目
    return await batchFetch(items)
  },
  {
    batchSize: 10,
    delay: 100
  }
)

// 添加项目到批处理队列
const result = await processor.add(itemId)
```

### 5. React错误边界 (`components/ErrorBoundary.tsx`)

#### ErrorBoundary 组件

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary'

// 包装应用程序
<ErrorBoundary>
  <App />
</ErrorBoundary>

// 自定义错误界面
<ErrorBoundary
  fallback={<CustomErrorPage />}
  onError={(error, errorInfo) => {
    // 自定义错误处理
  }}
>
  <App />
</ErrorBoundary>
```

#### ErrorAlert 组件

```typescript
import { ErrorAlert } from '@/components/ErrorBoundary'

// 显示错误提示
<ErrorAlert
  error={error}
  onDismiss={() => setError(null)}
/>
```

#### LoadingError 组件

```typescript
import { LoadingError } from '@/components/ErrorBoundary'

// 显示加载错误
<LoadingError
  message="无法加载用户数据"
  onRetry={() => refetch()}
/>
```

## 集成示例

### API客户端集成

API客户端已经集成了错误处理和性能监控：

```typescript
import { apiRequest } from '@/lib/api'

// 自动记录性能和错误
const response = await apiRequest('/api/users', {
  method: 'GET'
})

if (response.success) {
  // 使用数据
  console.log(response.data)
} else {
  // 错误已被记录和处理
  console.error(response.error)
}
```

### AI服务集成

AI导师服务已集成速率限制和性能监控：

```typescript
import { aiTutor } from '@/lib/ai-tutor'

try {
  const content = await aiTutor.generateContent(prompt, userLevel)
  // 使用生成的内容
} catch (error) {
  // 错误已被记录，包括性能指标
  if (error instanceof AppError) {
    // 显示用户友好的错误消息
    showError(error.userMessage)
  }
}
```

### 完整应用示例

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { logger } from '@/lib/error-handler'
import { performanceMonitor } from '@/lib/performance-monitor'

function App() {
  useEffect(() => {
    // 应用启动时记录
    logger.info('Application started')

    // 定期报告性能统计
    const interval = setInterval(() => {
      const stats = performanceMonitor.getStats()
      logger.info('Performance stats', stats)
    }, 60000) // 每分钟

    return () => clearInterval(interval)
  }, [])

  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  )
}
```

## 最佳实践

### 1. 错误处理

- 始终使用 `AppError` 创建自定义错误
- 为用户提供友好的错误消息
- 记录详细的错误上下文以便调试
- 使用适当的错误严重程度

### 2. 性能监控

- 监控关键操作的性能
- 设置性能阈值并记录警告
- 定期清理性能指标以防止内存泄漏
- 使用性能数据优化应用程序

### 3. 数据安全

- 始终验证用户输入
- 脱敏敏感数据后再记录
- 使用速率限制防止滥用
- 加密存储敏感信息

### 4. 缓存策略

- 为不同类型的数据设置适当的TTL
- 定期清理过期缓存
- 监控缓存命中率
- 避免缓存过大的数据

## 性能指标

系统自动监控以下性能指标：

- **API响应时间**: 所有API请求的响应时间
- **成功率**: API请求的成功率
- **慢操作**: 超过阈值的操作
- **错误率**: 错误发生的频率

## 配置

### 超时设置

在 `lib/api.ts` 中配置：

```typescript
const API_TIMEOUT = 30000 // 30秒
const GLM_API_TIMEOUT = 60000 // 60秒
```

### 速率限制

在 `lib/security.ts` 中配置：

```typescript
export const apiRateLimiter = new RateLimiter(30, 60) // 每分钟30次
export const aiRateLimiter = new RateLimiter(10, 60) // 每分钟10次
```

### 缓存配置

```typescript
const cache = new MemoryCache({
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 100 // 最多100项
})
```

## 故障排除

### 查看日志

```typescript
import { logger } from '@/lib/error-handler'

// 获取所有错误日志
const errors = logger.getLogs(LogLevel.ERROR)
console.log('Recent errors:', errors)
```

### 查看性能统计

```typescript
import { performanceMonitor } from '@/lib/performance-monitor'

const stats = performanceMonitor.getStats()
console.log('Performance stats:', stats)
console.log('Slowest operations:', stats.slowestOperations)
console.log('API success rate:', stats.apiStats.successRate)
```

### 清理资源

```typescript
// 清理日志
logger.clearLogs()

// 清理性能指标
performanceMonitor.clearMetrics()

// 清理缓存
apiCache.clear()
```

## 总结

本系统提供了全面的错误处理、性能监控、数据安全和缓存功能，确保应用程序的稳定性和良好的用户体验。所有功能都已集成到核心服务中，开箱即用。
