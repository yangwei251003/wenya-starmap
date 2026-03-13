# FSRS 智能学习系统实施指南

## 概述

本系统实现了完整的 FSRS (Free Spaced Repetition Scheduler) 算法，提供科学的间隔重复学习体验，配合 React Query 实现实时数据同步和乐观更新。

## 🧠 1. FSRS 算法实现

### 核心文件: `utils/fsrs.ts`

**特性:**
- ✅ 完整的 FSRS 算法实现，基于最新科学研究
- ✅ 支持 4 个评级系统：Again (1), Hard (2), Good (3), Easy (4)
- ✅ 精确计算 Stability (S), Difficulty (D), Retrievability (R)
- ✅ 智能调度下次复习时间

**核心函数:**
```typescript
// 创建新卡片
const card = createCard('word_id')

// 复习卡片
const updatedCard = reviewCard(card, Rating.Good)

// 获取记忆强度
const strength = fsrs.getMemoryStrength(card) // 返回 0-100%

// 预测下次复习时间
const nextReview = fsrs.getNextReviewTime(card, Rating.Good)
```

## 🗄️ 2. 数据库模式 (Supabase)

### 主要表结构

#### `study_logs` 表
```sql
- id: UUID (主键)
- user_id: UUID (用户ID)
- word_id: VARCHAR(255) (单词ID)
- last_review: TIMESTAMPTZ (上次复习时间)
- next_review: TIMESTAMPTZ (下次复习时间) [已索引]
- stability: FLOAT (稳定性)
- difficulty: FLOAT (难度)
- state: ENUM ('new', 'learning', 'review', 'relearning')
- step: INTEGER (学习步骤)
- reps: INTEGER (复习次数)
- lapses: INTEGER (遗忘次数)
```

#### `review_logs` 表
```sql
- id: UUID (主键)
- user_id: UUID (用户ID)
- word_id: VARCHAR(255) (单词ID)
- rating: INTEGER (1-4 评级)
- elapsed_days: FLOAT (经过天数)
- review_time: TIMESTAMPTZ (复习时间)
- previous_state: ENUM (之前状态)
```

#### `user_study_settings` 表
```sql
- user_id: UUID (用户ID)
- daily_new_limit: INTEGER (每日新词限制)
- daily_review_limit: INTEGER (每日复习限制)
- request_retention: FLOAT (目标保持率)
```

### 数据库迁移
```bash
# 运行迁移
supabase db push

# 或手动执行
psql -f supabase/migrations/001_study_logs_table.sql
```

## 🚀 3. 智能调度 API

### 获取学习队列: `GET /api/study/queue`

**优先级系统:**
1. **优先级 1 (复习)**: `next_review <= NOW()` 的单词
2. **优先级 2 (新词)**: `state === 'new'` 的单词

**每日限制:**
- 新词限制: 默认 20 个/天
- 复习限制: 默认 200 个/天

**响应格式:**
```json
{
  "queue": [
    {
      "id": "uuid",
      "word_id": "abandon",
      "priority": 1,
      "type": "review",
      "stability": 5.2,
      "difficulty": 3.8,
      "memory_strength": 75
    }
  ],
  "stats": {
    "total": 25,
    "review": 15,
    "new": 10,
    "remainingNewWords": 10
  }
}
```

### 提交复习: `POST /api/study/review`

**请求格式:**
```json
{
  "userId": "uuid",
  "wordId": "abandon",
  "rating": 3,
  "reviewTime": "2024-01-01T10:00:00Z"
}
```

**FSRS 处理流程:**
1. 获取当前卡片状态
2. 使用 FSRS 算法计算新的调度
3. 更新数据库 (事务处理)
4. 记录复习日志
5. 返回新的卡片状态

## ⚡ 4. 实时数据同步 (React Query)

### 核心 Hook: `useStudyQueue`

**特性:**
- ✅ 自动缓存和同步
- ✅ 乐观更新 (Optimistic Updates)
- ✅ 错误回滚
- ✅ 后台重新验证

### 乐观更新流程

```typescript
const submitReviewMutation = useSubmitReview()

// 1. onMutate: 立即更新 UI
onMutate: async (variables) => {
  // 取消正在进行的查询
  await queryClient.cancelQueries({ queryKey: queueKey })
  
  // 立即从队列中移除卡片
  const updatedQueue = {
    ...previousQueue,
    queue: previousQueue.queue.filter(card => card.word_id !== variables.wordId)
  }
  
  // 乐观更新缓存
  queryClient.setQueryData(queueKey, updatedQueue)
}

// 2. 后台发送请求到 Supabase
// 3. onError: 如果失败，回滚更改
// 4. onSettled: 重新验证数据
```

### 实时更新效果

当用户点击"简单"按钮时：
1. **立即**: 卡片从 UI 中消失
2. **立即**: 进度条更新
3. **立即**: 统计数据更新
4. **后台**: 发送请求到 Supabase
5. **如果失败**: 自动回滚所有更改

## 🎯 5. 使用指南

### 基本使用流程

1. **用户登录后访问 Dashboard**
2. **点击"智能学习 (FSRS)"按钮**
3. **系统自动获取学习队列**
4. **用户学习单词并评分**
5. **实时更新记忆可视化**

### 评分指导

- **忘记了 (1)**: 完全不记得，需要重新学习
- **困难 (2)**: 想起来了但很困难
- **良好 (3)**: 正确回忆，标准间隔
- **简单 (4)**: 轻松回忆，延长间隔

### 记忆强度可视化

- **绿色 (80-100%)**: 记忆牢固
- **黄色 (50-79%)**: 记忆一般
- **红色 (0-49%)**: 需要复习

## 🔧 6. 开发配置

### 环境变量设置

```bash
# 复制环境变量模板
cp .env.example .env.local

# 配置 Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 安装依赖

```bash
npm install @tanstack/react-query @supabase/supabase-js
```

### 启动开发服务器

```bash
npm run dev
```

## 📊 7. 性能优化

### 数据库优化
- ✅ 复合索引: `(user_id, state, next_review)`
- ✅ 单独索引: `next_review` 用于快速队列查询
- ✅ 分页查询: 限制每次返回的卡片数量

### 前端优化
- ✅ React Query 缓存: 5分钟 staleTime
- ✅ 乐观更新: 立即 UI 响应
- ✅ 后台重新验证: 确保数据一致性
- ✅ 错误边界: 优雅的错误处理

### 内存管理
- ✅ 自动垃圾回收: 30分钟 gcTime
- ✅ 查询取消: 防止内存泄漏
- ✅ 组件卸载清理: useEffect cleanup

## 🧪 8. 测试策略

### FSRS 算法测试
```typescript
// 测试文件: utils/__tests__/fsrs.test.ts
describe('FSRS Algorithm', () => {
  test('should calculate correct intervals', () => {
    const card = createCard('test')
    const reviewed = reviewCard(card, Rating.Good)
    expect(reviewed.scheduled_days).toBeGreaterThan(0)
  })
})
```

### API 测试
```typescript
// 测试队列 API
test('GET /api/study/queue returns correct format', async () => {
  const response = await fetch('/api/study/queue?userId=test')
  const data = await response.json()
  expect(data).toHaveProperty('queue')
  expect(data).toHaveProperty('stats')
})
```

### 组件测试
```typescript
// 测试学习组件
test('StarSproutMemory handles review submission', () => {
  render(<StarSproutMemory userId="test" />)
  // 测试用户交互
})
```

## 🚀 9. 部署指南

### Supabase 设置
1. 创建新项目
2. 运行数据库迁移
3. 配置 RLS (Row Level Security)
4. 获取 API 密钥

### Vercel 部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod

# 配置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 环境变量配置
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY`: 服务端密钥 (可选)

## 🔍 10. 监控和分析

### 学习数据分析
- 每日学习统计
- 记忆强度分布
- 复习成功率
- 学习时间分析

### 性能监控
- API 响应时间
- 数据库查询性能
- 前端渲染性能
- 错误率监控

## 🎉 完成功能清单

- ✅ FSRS 算法完整实现
- ✅ Supabase 数据库模式
- ✅ 智能调度 API
- ✅ React Query 实时同步
- ✅ 乐观更新机制
- ✅ 记忆可视化组件
- ✅ 响应式学习界面
- ✅ 键盘快捷键支持
- ✅ 错误处理和回滚
- ✅ 性能优化
- ✅ 完整的 TypeScript 支持

## 🔗 相关文件

- `utils/fsrs.ts` - FSRS 算法核心
- `hooks/useStudyQueue.ts` - React Query hooks
- `components/study/StarSproutMemory.tsx` - 学习组件
- `app/api/study/queue/route.ts` - 队列 API
- `app/api/study/review/route.ts` - 复习 API
- `supabase/migrations/001_study_logs_table.sql` - 数据库迁移

这个系统现在提供了完整的科学间隔重复学习体验，具有实时数据同步、智能调度和优美的用户界面！