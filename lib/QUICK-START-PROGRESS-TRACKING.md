# 进度追踪系统快速入门

## 5分钟快速开始

### 1. 显示学习统计

```typescript
import { useProgressTracking } from '@/hooks/useProgressTracking'
import { StatsCard } from '@/components/dashboard'

function MyDashboard() {
  const { stats, isLoading } = useProgressTracking('user-123')
  
  if (isLoading) return <div>加载中...</div>
  
  return <StatsCard stats={stats} />
}
```

### 2. 显示学习趋势

```typescript
import { useProgressTracking } from '@/hooks/useProgressTracking'
import { ProgressChart } from '@/components/dashboard'

function TrendsView() {
  const { trends } = useProgressTracking('user-123')
  
  return (
    <div>
      {/* 学习时长趋势 */}
      <ProgressChart trends={trends} type="studyTime" />
      
      {/* 完成课程趋势 */}
      <ProgressChart trends={trends} type="lessons" />
      
      {/* 平均分数趋势 */}
      <ProgressChart trends={trends} type="score" />
    </div>
  )
}
```

### 3. 显示智能分析

```typescript
import { useProgressTracking } from '@/hooks/useProgressTracking'
import { ProgressAnalysis } from '@/components/dashboard'

function AnalysisView() {
  const { analysis } = useProgressTracking('user-123')
  
  return analysis ? <ProgressAnalysis analysis={analysis} /> : null
}
```

### 4. 成就分享

```typescript
import { useState } from 'react'
import { AchievementShare } from '@/components/dashboard'

function AchievementCard({ achievement }) {
  const [isShareOpen, setIsShareOpen] = useState(false)
  
  return (
    <>
      <button onClick={() => setIsShareOpen(true)}>
        分享成就
      </button>
      
      <AchievementShare
        achievement={achievement}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </>
  )
}
```

### 5. 成就庆祝动画

```typescript
import { AchievementCelebration } from '@/components/exercise'

function ExerciseComplete({ newAchievements }) {
  const [showCelebration, setShowCelebration] = useState(true)
  
  return (
    <>
      {/* 你的练习完成界面 */}
      
      {newAchievements.length > 0 && showCelebration && (
        <AchievementCelebration
          achievements={newAchievements}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </>
  )
}
```

## 完整示例

查看完整的集成示例：

1. **演示页面**: `/app/progress-demo/page.tsx`
   - 访问 `/progress-demo` 查看所有功能

2. **集成示例**: `/lib/examples/progress-tracking-integration.tsx`
   - 5个完整的使用示例

3. **详细文档**: `/lib/README-PROGRESS-TRACKING.md`
   - 完整的 API 文档和使用指南

## 常见用例

### 在仪表板中整合所有功能

```typescript
import { useProgressTracking } from '@/hooks/useProgressTracking'
import {
  StatsCard,
  ProgressChart,
  ProgressAnalysis,
  StarMap
} from '@/components/dashboard'

function CompleteDashboard() {
  const { stats, trends, analysis, achievements } = useProgressTracking('user-123')
  
  return (
    <div className="space-y-6">
      {/* 统计 */}
      <StatsCard stats={stats} />
      
      {/* 趋势 */}
      <div className="grid grid-cols-2 gap-4">
        <ProgressChart trends={trends} type="studyTime" />
        <ProgressChart trends={trends} type="score" />
      </div>
      
      {/* 星图和分析 */}
      <div className="grid grid-cols-2 gap-4">
        <StarMap achievements={achievements} />
        <ProgressAnalysis analysis={analysis} />
      </div>
    </div>
  )
}
```

### 练习完成后的完整流程

```typescript
function ExerciseFlow() {
  const [newAchievements, setNewAchievements] = useState([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [showShare, setShowShare] = useState(false)
  
  const handleExerciseComplete = async (result) => {
    // 1. 保存练习结果
    await saveExerciseResult(result)
    
    // 2. 检查新成就
    const achievements = await checkNewAchievements()
    
    // 3. 如果有新成就，显示庆祝动画
    if (achievements.length > 0) {
      setNewAchievements(achievements)
      setShowCelebration(true)
    }
  }
  
  const handleCelebrationClose = () => {
    setShowCelebration(false)
    // 庆祝动画结束后，可以选择显示分享对话框
    if (newAchievements.length > 0) {
      setShowShare(true)
    }
  }
  
  return (
    <>
      {/* 练习界面 */}
      <ExerciseUI onComplete={handleExerciseComplete} />
      
      {/* 庆祝动画 */}
      {showCelebration && (
        <AchievementCelebration
          achievements={newAchievements}
          onClose={handleCelebrationClose}
        />
      )}
      
      {/* 分享对话框 */}
      {showShare && newAchievements[0] && (
        <AchievementShare
          achievement={newAchievements[0]}
          isOpen={showShare}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  )
}
```

## 提示和技巧

### 1. 刷新数据

```typescript
const { refreshData } = useProgressTracking('user-123')

// 在完成练习后刷新
const handleExerciseComplete = async () => {
  await saveExercise()
  refreshData() // 刷新进度数据
}
```

### 2. 错误处理

```typescript
const { error, isLoading } = useProgressTracking('user-123')

if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage message={error} />
```

### 3. 自定义趋势天数

修改 `useProgressTracking` hook 中的天数参数：

```typescript
// 在 hooks/useProgressTracking.ts 中
const calculatedTrends = progressTrackingService.analyzeTrends(
  mockData.sessions,
  14 // 改为14天
)
```

### 4. 星图点击事件

```typescript
<StarMap
  achievements={achievements}
  onAchievementClick={(achievement) => {
    console.log('点击了成就:', achievement)
    // 打开分享对话框或显示详情
  }}
/>
```

## 下一步

- 查看 [完整文档](./README-PROGRESS-TRACKING.md)
- 运行 [演示页面](/progress-demo)
- 查看 [集成示例](./examples/progress-tracking-integration.tsx)
- 阅读 [学习路径文档](./README-LEARNING-PATH.md)
