# 快速开始指南 - AI导师和学习路径

## 5分钟快速集成

### 1. 环境配置

在 `.env` 文件中添加：

```env
GLM_API_KEY=your_glm_api_key_here
```

### 2. 基本使用

#### 为新用户创建学习路径

```typescript
import { learningPathService } from '@/lib/learning-path'

// 在用户注册时
const learningPath = await learningPathService.createPathForNewUser(
  userId,
  {
    level: 'beginner',
    scores: {
      vocabulary: 60,
      grammar: 70,
      listening: 55,
      speaking: 50,
      reading: 65,
      writing: 60
    }
  }
)
```

#### 获取推荐课程

```typescript
const nextLesson = learningPathService.getNextRecommendation(learningPath)
```

#### 完成课程后更新路径

```typescript
const performance = {
  userId: 'user-123',
  lessonId: 'lesson-1',
  answers: [
    { exerciseId: 'ex-1', userAnswer: 'ans', isCorrect: true, timeSpent: 30 }
  ],
  timeSpent: 30,
  accuracy: 1.0
}

const updatedPath = await learningPathService.updatePath(
  learningPath,
  performance,
  ['lesson-1']
)
```

#### 使用AI导师

```typescript
import { aiTutor } from '@/lib/ai-tutor'

// 生成内容
const content = await aiTutor.generateContent(
  '请生成一个关于日常问候的练习',
  'beginner'
)

// 评估答案
const evaluation = await aiTutor.evaluateAnswer(
  'What is your name?',
  'My name is John'
)

// 获取反馈
const feedback = await aiTutor.provideFeedback(performance)
```

### 3. 集成到页面

#### 注册页面

```typescript
// app/auth/register/page.tsx
import { RegistrationWithAssessment } from '@/lib/examples/registration-integration'

export default function RegisterPage() {
  return <RegistrationWithAssessment />
}
```

#### 学习仪表板

```typescript
// app/dashboard/page.tsx
import { DashboardWithLearningPath } from '@/lib/examples/dashboard-integration'

export default function DashboardPage() {
  return <DashboardWithLearningPath />
}
```

## 核心概念

### 学习路径 (LearningPath)
- 包含用户的当前等级、目标等级
- 推荐课程列表
- 已完成课程记录
- 学习进度百分比

### 动态调整
- 准确率 ≥ 85% → 提升等级
- 准确率 < 50% → 降低等级
- 自动更新推荐课程

### AI导师
- 根据用户水平生成内容
- 评估答案并提供反馈
- 分析学习表现

## 完整示例

查看以下文件获取完整示例：

- `lib/examples/dashboard-integration.tsx` - 仪表板集成
- `lib/examples/registration-integration.tsx` - 注册流程集成
- `lib/demo-learning-path.ts` - 功能演示

## 详细文档

查看 `lib/README-LEARNING-PATH.md` 获取完整文档。

## 需要帮助？

1. 查看类型定义：`types/index.ts`
2. 查看实现代码：`lib/learning-path.ts`, `lib/ai-tutor.ts`
3. 运行演示：`npx ts-node lib/demo-learning-path.ts`
4. 运行测试：`npm test lib/learning-path.test.ts`
