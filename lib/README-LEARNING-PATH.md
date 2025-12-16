# AI导师和学习路径生成 - 实现文档

## 概述

本模块实现了问芽星图（WenYa StarMap）的AI导师和学习路径生成功能，包括：

1. ✅ 智谱GLM API客户端集成
2. ✅ 基于评估结果的个性化学习建议生成
3. ✅ Learning_Path数据模型
4. ✅ 学习路径动态调整逻辑

## 核心组件

### 1. AI导师服务 (`lib/ai-tutor.ts`)

#### GLMAITutor 类

实现了 `AITutor` 接口，提供以下功能：

- **generateContent**: 生成个性化学习内容
  - 根据用户英语水平调整内容难度
  - 使用智谱GLM API生成内容
  
- **evaluateAnswer**: 评估用户答案
  - 提供详细的评估结果（正确性、分数、反馈）
  - 返回改进建议和下一步学习建议
  
- **provideFeedback**: 提供学习反馈
  - 分析用户表现数据
  - 生成鼓励性反馈和改进建议

#### 使用示例

```typescript
import { aiTutor } from '@/lib/ai-tutor'

// 生成学习内容
const content = await aiTutor.generateContent(
  '请生成一个关于日常问候的练习',
  'beginner'
)

// 评估答案
const evaluation = await aiTutor.evaluateAnswer(
  'What is your name?',
  'My name is John'
)

// 提供反馈
const feedback = await aiTutor.provideFeedback({
  userId: 'user-123',
  answers: [...],
  timeSpent: 300,
  accuracy: 0.85
})
```

### 2. 学习路径生成器 (`lib/learning-path.ts`)

#### LearningPathGenerator 类

核心功能：

- **generateLearningPath**: 生成个性化学习路径
  - 基于用户当前水平和目标水平
  - 考虑评估结果（词汇、语法、听说读写）
  - 使用AI生成学习建议
  - 返回推荐课程列表

- **adjustLearningPath**: 动态调整学习路径
  - 根据用户表现更新路径
  - 自动调整难度等级
  - 更新推荐课程
  - 计算学习进度

- **getNextLesson**: 获取下一个推荐课程
  - 返回第一个未完成的推荐课程

#### 难度调整逻辑

- **提升等级条件**: 准确率 ≥ 85% 且完成 ≥ 10个练习
- **降低等级条件**: 准确率 < 50% 且完成 ≥ 10个练习

#### 进度计算

进度 = 等级进度(70%) + 课程完成进度(30%)

- 等级进度：基于从起始等级到目标等级的进展
- 课程完成进度：基于完成的课程数量（最多20个课程）

### 3. 学习路径服务 (`lib/learning-path.ts`)

#### LearningPathService 类

高级API，简化学习路径管理：

- **createPathForNewUser**: 为新用户创建学习路径
  - 自动设置默认目标等级
  - 处理评估数据
  
- **updatePath**: 更新学习路径
  - 简化的更新接口
  
- **getNextRecommendation**: 获取下一个推荐课程

#### 使用示例

```typescript
import { learningPathService } from '@/lib/learning-path'

// 为新用户创建学习路径
const learningPath = await learningPathService.createPathForNewUser(
  'user-123',
  {
    level: 'beginner',
    targetLevel: 'intermediate',
    scores: {
      vocabulary: 60,
      grammar: 70,
      listening: 50,
      speaking: 55,
      reading: 65,
      writing: 60
    }
  }
)

// 获取下一个推荐课程
const nextLesson = learningPathService.getNextRecommendation(learningPath)

// 完成课程后更新路径
const updatedPath = await learningPathService.updatePath(
  learningPath,
  performance,
  ['lesson-1']
)
```

## 数据模型

### LearningPath

```typescript
interface LearningPath {
  id: string                    // 学习路径ID
  userId: string                // 用户ID
  currentLevel: EnglishLevel    // 当前等级
  targetLevel: EnglishLevel     // 目标等级
  completedLessons: string[]    // 已完成课程ID列表
  recommendedNext: Lesson[]     // 推荐课程列表
  progress: number              // 进度 (0-100)
  createdAt: Date              // 创建时间
  updatedAt: Date              // 更新时间
}
```

### UserPerformance

```typescript
interface UserPerformance {
  userId: string
  lessonId?: string
  exerciseId?: string
  answers: Answer[]
  timeSpent: number
  accuracy: number
}
```

## API集成

### 智谱GLM API配置

在 `.env` 文件中配置：

```env
GLM_API_KEY=your_glm_api_key_here
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
```

### API调用流程

1. 构建消息数组（system prompt + user prompt）
2. 调用 `callGLMAPI` 函数
3. 处理响应（成功/失败）
4. 解析返回内容

## 测试

### 运行测试

```bash
npm test lib/learning-path.test.ts
```

### 运行演示

```bash
npx ts-node lib/demo-learning-path.ts
```

## 集成到应用

### 在注册流程中使用

```typescript
// app/auth/register/page.tsx
import { learningPathService } from '@/lib/learning-path'

async function handleRegistration(userData) {
  // 1. 创建用户账户
  const user = await createUser(userData)
  
  // 2. 生成学习路径
  const learningPath = await learningPathService.createPathForNewUser(
    user.id,
    {
      level: userData.level,
      scores: userData.assessmentScores
    }
  )
  
  // 3. 保存学习路径到数据库
  await saveLearningPath(learningPath)
  
  return { user, learningPath }
}
```

### 在学习仪表板中使用

```typescript
// app/dashboard/page.tsx
import { learningPathService } from '@/lib/learning-path'

async function DashboardPage() {
  const learningPath = await getLearningPath(userId)
  const nextLesson = learningPathService.getNextRecommendation(learningPath)
  
  return (
    <div>
      <h1>学习进度: {learningPath.progress}%</h1>
      <NextLessonCard lesson={nextLesson} />
    </div>
  )
}
```

### 在练习完成后使用

```typescript
// 练习完成处理
async function handleExerciseCompletion(lessonId, answers) {
  const performance = calculatePerformance(answers)
  
  const updatedPath = await learningPathService.updatePath(
    currentPath,
    performance,
    [lessonId]
  )
  
  // 保存更新后的路径
  await saveLearningPath(updatedPath)
  
  // 检查是否升级
  if (updatedPath.currentLevel !== currentPath.currentLevel) {
    showLevelUpAnimation()
  }
}
```

## 未来改进

1. **数据库集成**: 将模拟课程数据替换为真实数据库查询
2. **缓存优化**: 缓存AI生成的内容以减少API调用
3. **更智能的推荐**: 基于协同过滤的课程推荐
4. **A/B测试**: 测试不同的难度调整策略
5. **多语言支持**: 支持其他语言的学习路径

## 相关文件

- `lib/ai-tutor.ts` - AI导师实现
- `lib/learning-path.ts` - 学习路径生成和管理
- `lib/api.ts` - API客户端（包含GLM API集成）
- `types/index.ts` - TypeScript类型定义
- `lib/learning-path.test.ts` - 单元测试
- `lib/demo-learning-path.ts` - 功能演示

## 需求验证

本实现满足以下需求：

- ✅ **需求 1.3**: AI导师提供个性化学习体验
- ✅ **需求 3.1**: 基于评估结果生成学习建议
- ✅ **需求 3.2**: 动态调整学习路径
- ✅ **需求 3.5**: 学习路径数据模型和管理
