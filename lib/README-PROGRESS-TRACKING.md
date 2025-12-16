# 学习进度追踪和可视化系统

## 概述

学习进度追踪系统提供全面的学习数据统计、分析和可视化功能，帮助用户了解学习情况并获得个性化建议。

## 核心功能

### 1. 学习数据统计

自动收集和计算以下学习数据：

- **学习时长**: 总学习时间（秒）
- **完成课程**: 已完成的课程数量
- **完成练习**: 已完成的练习数量
- **平均分数**: 所有已完成练习的平均分数
- **连续学习**: 连续学习的天数
- **获得成就**: 解锁的成就数量
- **等级进度**: 当前等级的完成进度（0-100%）

### 2. 学习趋势分析

提供多维度的学习趋势可视化：

- **学习时长趋势**: 每日学习时间变化
- **完成课程趋势**: 每日完成课程数量
- **平均分数趋势**: 学习表现变化

支持自定义时间范围（默认7天）。

### 3. 进度分析

智能分析学习表现，提供：

- **优势识别**: 自动识别学习中的优势
  - 整体表现优秀
  - 学习效率高
  - 学习表现稳定

- **劣势识别**: 指出需要改进的方面
  - 需要加强基础知识
  - 学习表现波动较大

- **个性化建议**: 基于分析结果生成建议
  - 增加学习时间
  - 建立学习习惯
  - 复习已学内容
  - 尝试更高难度

- **完成时间预测**: 基于学习速度预测完成时间

### 4. 成就庆祝动画

当用户获得新成就时：

- 全屏庆祝动画
- 星星闪烁效果
- 成就信息展示
- 自动播放和手动关闭

### 5. 成就分享功能

支持多种分享方式：

- **复制文本**: 一键复制分享文本到剪贴板
- **下载图片**: 生成精美的成就分享图片
- **社交媒体**: 分享到微博、Twitter、Facebook

## 技术架构

### 服务层

#### ProgressTrackingService

核心进度追踪服务，提供：

```typescript
class ProgressTrackingService {
  // 计算学习统计数据
  calculateStats(data: ProgressData): LearningStats
  
  // 分析学习趋势
  analyzeTrends(sessions: LearningSession[], days: number): LearningTrend[]
  
  // 执行完整的进度分析
  analyzeProgress(data: ProgressData): ProgressAnalysis
  
  // 记录学习会话
  recordSession(session: LearningSession): void
  
  // 更新进度
  updateProgress(progress: Progress): void
}
```

### Hook层

#### useProgressTracking

React Hook，封装进度追踪逻辑：

```typescript
function useProgressTracking(userId?: string): {
  stats: LearningStats | null
  trends: LearningTrend[]
  analysis: ProgressAnalysis | null
  isLoading: boolean
  error: string | null
  refreshData: () => void
}
```

### 组件层

#### 1. StatsCard

显示学习统计数据的卡片组件。

**Props:**
```typescript
interface StatsCardProps {
  stats: LearningStats
}
```

**特性:**
- 网格布局展示6项统计数据
- 图标和颜色区分
- 悬停效果

#### 2. ProgressChart

学习趋势图表组件。

**Props:**
```typescript
interface ProgressChartProps {
  trends: LearningTrend[]
  type?: 'studyTime' | 'lessons' | 'score'
}
```

**特性:**
- 柱状图可视化
- 动画效果
- 悬停显示详细数据
- 支持三种数据类型

#### 3. ProgressAnalysis

进度分析展示组件。

**Props:**
```typescript
interface ProgressAnalysisProps {
  analysis: ProgressAnalysis
}
```

**特性:**
- 优势和劣势展示
- 学习建议列表
- 预计完成时间
- 动画效果

#### 4. AchievementShare

成就分享对话框组件。

**Props:**
```typescript
interface AchievementShareProps {
  achievement: StarAchievement
  isOpen: boolean
  onClose: () => void
}
```

**特性:**
- 成就预览
- 多种分享方式
- Canvas生成分享图片
- 响应式设计

#### 5. AchievementCelebration

成就庆祝动画组件。

**Props:**
```typescript
interface AchievementCelebrationProps {
  achievements: StarAchievement[]
  onClose: () => void
}
```

**特性:**
- 全屏动画
- 星星粒子效果
- 自动轮播多个成就
- 点击关闭

## 使用指南

### 基础使用

```typescript
import { useProgressTracking } from '@/hooks/useProgressTracking'
import { StatsCard } from '@/components/dashboard'

function MyComponent() {
  const { stats, isLoading } = useProgressTracking('user-123')
  
  if (isLoading) return <div>加载中...</div>
  
  return <StatsCard stats={stats} />
}
```

### 显示学习趋势

```typescript
import { useProgressTracking } from '@/hooks/useProgressTracking'
import { ProgressChart } from '@/components/dashboard'

function TrendsView() {
  const { trends } = useProgressTracking('user-123')
  
  return (
    <div>
      <ProgressChart trends={trends} type="studyTime" />
      <ProgressChart trends={trends} type="lessons" />
      <ProgressChart trends={trends} type="score" />
    </div>
  )
}
```

### 显示进度分析

```typescript
import { useProgressTracking } from '@/hooks/useProgressTracking'
import { ProgressAnalysis } from '@/components/dashboard'

function AnalysisView() {
  const { analysis } = useProgressTracking('user-123')
  
  return analysis ? <ProgressAnalysis analysis={analysis} /> : null
}
```

### 成就分享

```typescript
import { useState } from 'react'
import { AchievementShare } from '@/components/dashboard'

function AchievementList({ achievements }) {
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  
  return (
    <>
      {achievements.map(achievement => (
        <button
          key={achievement.id}
          onClick={() => {
            setSelected(achievement)
            setIsShareOpen(true)
          }}
        >
          分享 {achievement.title}
        </button>
      ))}
      
      {selected && (
        <AchievementShare
          achievement={selected}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </>
  )
}
```

### 成就庆祝

```typescript
import { useState } from 'react'
import { AchievementCelebration } from '@/components/exercise'

function ExerciseComplete({ newAchievements }) {
  const [showCelebration, setShowCelebration] = useState(true)
  
  return (
    <>
      {/* 练习完成界面 */}
      
      {newAchievements.length > 0 && (
        <AchievementCelebration
          achievements={newAchievements}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </>
  )
}
```

## 数据流

```
用户学习活动
    ↓
LearningSession 记录
    ↓
ProgressTrackingService
    ↓
├─ calculateStats() → LearningStats
├─ analyzeTrends() → LearningTrend[]
└─ analyzeProgress() → ProgressAnalysis
    ↓
useProgressTracking Hook
    ↓
React 组件展示
```

## 扩展性

### 添加新的统计指标

1. 在 `LearningStats` 接口中添加新字段
2. 在 `ProgressTrackingService.calculateStats()` 中实现计算逻辑
3. 在 `StatsCard` 组件中添加显示

### 添加新的趋势类型

1. 在 `LearningTrend` 接口中添加新字段
2. 在 `ProgressTrackingService.analyzeTrends()` 中实现聚合逻辑
3. 在 `ProgressChart` 组件中添加新的 type 选项

### 添加新的分析维度

1. 在 `ProgressAnalysis` 接口中添加新字段
2. 在 `ProgressTrackingService.analyzeProgress()` 中实现分析逻辑
3. 在 `ProgressAnalysis` 组件中添加显示

## 性能优化

- 使用 React.memo 优化组件渲染
- 趋势数据默认只分析最近7天
- 图表动画使用 Framer Motion 的硬件加速
- 分享图片使用 Canvas 离屏渲染

## 最佳实践

1. **定期刷新数据**: 在关键操作后调用 `refreshData()`
2. **错误处理**: 始终检查 `error` 状态
3. **加载状态**: 使用 `isLoading` 提供良好的用户体验
4. **数据持久化**: 在实际应用中将数据保存到数据库
5. **隐私保护**: 分享功能应征得用户同意

## 示例代码

完整的集成示例请参考：
- `lib/examples/progress-tracking-integration.tsx`

## 相关文档

- [学习路径系统](./README-LEARNING-PATH.md)
- [成就系统](../lib/achievement-service.ts)
- [练习系统](../components/exercise/README.md)
