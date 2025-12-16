# 互动练习系统 (Interactive Exercise System)

## 概述

互动练习系统是问芽星图的核心功能之一，提供多种类型的英语练习，包括听说读写全方位训练。系统集成AI实时反馈和成就系统，为学习者提供个性化的学习体验。

## 功能特性

### 1. 多种练习类型

- **选择题 (Multiple Choice)**: 从选项中选择正确答案
- **填空题 (Fill Blank)**: 填写正确的单词或短语
- **听力练习 (Listening)**: 听音频并回答问题
- **口语练习 (Speaking)**: 练习英语口语表达
- **阅读理解 (Reading Comprehension)**: 阅读文章并回答问题
- **写作练习 (Writing)**: 练习英语写作技能

### 2. AI实时反馈

- 使用智谱GLM API进行答案评估
- 提供详细的反馈和改进建议
- 根据用户水平调整内容难度
- 个性化学习建议

### 3. 成就系统

- **初次绽放**: 完成第一节课程
- **坚持之星**: 连续学习7天
- **完美答题**: 练习全部答对
- **词汇大师**: 掌握100个新单词
- **语法专家**: 语法练习获得90分以上
- **听力冠军**: 听力练习表现优秀
- **口语之星**: 口语练习表现出色

### 4. 进度追踪

- 实时显示答题进度
- 统计正确率和用时
- 计算综合分数
- 可视化学习成果

## 组件结构

### ExerciseTypeSelector

练习类型选择器，展示所有可用的练习类型。

```tsx
<ExerciseTypeSelector onSelect={(type) => handleStartExercise(type)} />
```

### ExerciseCard

练习卡片组件，显示单个练习题并处理用户输入。

```tsx
<ExerciseCard
  exercise={currentExercise}
  onSubmit={handleSubmitAnswer}
  onNext={handleNext}
  currentIndex={0}
  totalExercises={5}
/>
```

### ExerciseResult

练习结果展示组件，显示统计信息和AI反馈。

```tsx
<ExerciseResult
  result={result}
  onRestart={handleRestart}
  onBackToMenu={handleBackToMenu}
/>
```

### AchievementCelebration

成就庆祝动画组件，展示新获得的成就。

```tsx
<AchievementCelebration
  achievements={newAchievements}
  onClose={() => setShowAchievements(false)}
/>
```

## 服务层

### ExerciseService

练习服务类，负责练习题生成、答案评估和会话管理。

```typescript
import { exerciseService } from '@/lib/exercise-service'

// 生成练习题
const exercises = await exerciseService.generateExercises(
  'multiple_choice',
  'intermediate',
  5
)

// 评估答案
const evaluation = await exerciseService.evaluateAnswer(
  exercise,
  userAnswer
)

// 提交会话
const result = await exerciseService.submitSession(session)
```

### AchievementService

成就服务类，负责成就检查和授予。

```typescript
import { achievementService } from '@/lib/achievement-service'

// 检查成就
const newAchievements = achievementService.checkAchievements(
  userId,
  data,
  existingAchievements
)

// 计算进度
const progress = achievementService.calculateProgress(userAchievements)

// 获取下一个可获得的成就
const nextAchievements = achievementService.getNextAchievements(
  existingAchievements,
  3
)
```

## 使用示例

### 完整的练习流程

```typescript
'use client'

import { useState } from 'react'
import { ExerciseTypeSelector, ExerciseCard, ExerciseResult } from '@/components/exercise'
import { exerciseService } from '@/lib/exercise-service'

export default function QuizPage() {
  const [viewState, setViewState] = useState<'menu' | 'exercise' | 'result'>('menu')
  const [session, setSession] = useState(null)
  const [result, setResult] = useState(null)

  const handleStartExercise = async (type) => {
    const exercises = await exerciseService.generateExercises(type, 'intermediate', 5)
    const newSession = {
      id: `session_${Date.now()}`,
      userId: 'user_id',
      exercises,
      answers: [],
      startTime: new Date(),
      currentIndex: 0,
      score: 0
    }
    setSession(newSession)
    setViewState('exercise')
  }

  const handleSubmitAnswer = async (userAnswer) => {
    const evaluation = await exerciseService.evaluateAnswer(
      session.exercises[session.currentIndex],
      userAnswer
    )
    // 记录答案...
    return evaluation
  }

  const handleNext = async () => {
    if (session.currentIndex < session.exercises.length - 1) {
      setSession({ ...session, currentIndex: session.currentIndex + 1 })
    } else {
      const result = await exerciseService.submitSession(session)
      setResult(result)
      setViewState('result')
    }
  }

  return (
    <div>
      {viewState === 'menu' && <ExerciseTypeSelector onSelect={handleStartExercise} />}
      {viewState === 'exercise' && session && (
        <ExerciseCard
          exercise={session.exercises[session.currentIndex]}
          onSubmit={handleSubmitAnswer}
          onNext={handleNext}
          currentIndex={session.currentIndex}
          totalExercises={session.exercises.length}
        />
      )}
      {viewState === 'result' && result && (
        <ExerciseResult result={result} onRestart={...} onBackToMenu={...} />
      )}
    </div>
  )
}
```

## 数据流

1. **选择练习类型** → ExerciseTypeSelector
2. **生成练习题** → ExerciseService.generateExercises()
3. **创建会话** → ExerciseSession
4. **答题** → ExerciseCard
5. **评估答案** → ExerciseService.evaluateAnswer()
6. **记录答案** → Answer[]
7. **完成练习** → ExerciseService.submitSession()
8. **检查成就** → AchievementService.checkAchievements()
9. **显示结果** → ExerciseResult
10. **庆祝成就** → AchievementCelebration

## 扩展性

### 添加新的练习类型

1. 在 `types/index.ts` 中添加新的 `ExerciseType`
2. 在 `ExerciseTypeSelector` 中添加新的选项
3. 在 `ExerciseCard` 中添加新的输入组件
4. 在 `ExerciseService` 中添加生成逻辑

### 添加新的成就

1. 在 `types/index.ts` 中添加新的 `AchievementType`
2. 在 `AchievementService` 的 `initializeAchievements()` 中添加配置
3. 在 `ExerciseService` 的 `checkAchievements()` 中添加检查逻辑

## 性能优化

- 练习题生成使用缓存机制
- AI评估结果本地存储
- 成就检查使用Set数据结构
- 动画使用Framer Motion优化

## 测试

```bash
# 运行单元测试
npm test -- exercise-service
npm test -- achievement-service

# 运行所有测试
npm test
```

## 未来改进

- [ ] 添加语音识别功能（口语练习）
- [ ] 添加音频播放功能（听力练习）
- [ ] 支持离线练习模式
- [ ] 添加练习历史记录
- [ ] 实现练习推荐算法
- [ ] 添加社交分享功能
- [ ] 支持自定义练习题
