# 成长星图系统 - 智能学习追踪中心

## 🌟 系统概述

成长星图是问芽星图平台的核心功能模块，提供智能化、个性化的学习数据追踪和学习指引服务。

## ✨ 核心功能

### 1. 实时数据追踪
- ✅ 自动记录每次学习活动（单词、课程、练习）
- ✅ 实时更新学习统计数据
- ✅ 30秒自动刷新，确保数据准确性
- ✅ 本地存储 + 内存缓存，快速响应

### 2. 智能学习指引
- ✅ 基于SRS算法的复习提醒
- ✅ 避免重复学习已掌握内容
- ✅ 智能推荐学习优先级（复习/新学/休息）
- ✅ 个性化学习建议

### 3. 多维度数据统计
- ✅ 单词掌握度（已掌握/学习中/待复习）
- ✅ 学习效率（准确率/速度/一致性）
- ✅ 连续学习天数追踪
- ✅ 学习时间统计（今日/本周/总计）
- ✅ 课程完成进度

### 4. 成就系统
- ✅ 5个核心成就徽章
- ✅ 实时进度显示
- ✅ 解锁动画效果

### 5. 可视化展示
- ✅ 进度条动画
- ✅ 数据卡片
- ✅ 趋势图表
- ✅ 星图可视化

## 🏗️ 系统架构

### 核心服务

#### 1. SmartLearningService (`lib/smart-learning-service.ts`)
智能学习服务，统一管理所有学习数据

**主要方法：**
- `getUserLearningData(userId)` - 获取完整学习数据
- `recordLearningActivity(userId, activity)` - 记录学习活动
- `shouldShowReviewReminder(userId)` - 检查是否需要复习提醒
- `getStudyAdvice(data)` - 获取学习建议

**数据结构：**
```typescript
interface SmartLearningData {
  userId: string
  wordStats: {
    total: number
    mastered: number
    learning: number
    needReview: number
    newToday: number
  }
  lessonStats: {
    total: number
    completed: number
    inProgress: number
    recommended: string[]
  }
  timeStats: {
    today: number
    week: number
    total: number
    streak: number
  }
  efficiency: {
    accuracy: number
    speed: number
    consistency: number
  }
  recommendations: {
    priority: 'review' | 'new' | 'rest'
    message: string
    actions: Array<{
      type: 'word' | 'lesson' | 'exercise'
      id: string
      reason: string
    }>
  }
  nextStudyTime: Date
  achievements: Array<{
    id: string
    title: string
    progress: number
    unlocked: boolean
  }>
}
```

#### 2. useSmartLearning Hook (`hooks/useSmartLearning.ts`)
React Hook，提供实时数据追踪

**功能：**
- 自动加载学习数据
- 30秒自动刷新
- 记录学习活动
- 手动刷新
- 获取学习建议

**使用示例：**
```typescript
const { data, loading, recordActivity, refresh, getAdvice } = useSmartLearning('user-id')
```

### 页面组件

#### 1. 成长星图页面 (`app/growth-starmap/page.tsx`)
主要展示页面，包含：
- 智能学习指引卡片
- 核心数据卡片（4个）
- 学习状态详情（单词/课程）
- 成就系统
- 个性化学习建议
- 下次学习时间

#### 2. 学习提醒组件 (`components/LearningReminder.tsx`)
导航栏提醒组件，显示待复习单词数量

### 数据流

```
用户学习活动
    ↓
SRS Service / Lesson Service
    ↓
Smart Learning Service (记录活动)
    ↓
Local Storage (持久化)
    ↓
useSmartLearning Hook (自动刷新)
    ↓
成长星图页面 (实时展示)
```

## 🎯 智能学习算法

### 1. 学习优先级判断

```typescript
if (待复习单词 > 0) {
  优先级 = '复习'
  建议 = '先完成复习以巩固记忆'
}
else if (今日学习时间 > 2小时) {
  优先级 = '休息'
  建议 = '避免过度疲劳'
}
else if (正确率 < 60%) {
  优先级 = '复习'
  建议 = '复习已学内容，打好基础'
}
else {
  优先级 = '新学'
  建议 = '学习新内容'
}
```

### 2. 效率计算

- **准确率** = (正确数 / 总数) × 100%
- **速度** = 学习单词数 / (学习时间 / 60) 词/分钟
- **一致性** = min(100, (总单词数 / 100) × 100)

### 3. 下次学习时间

- 如果有待复习单词：返回最早的复习时间
- 否则：建议明天同一时间

## 📊 数据存储

### LocalStorage 键值

- `wenya_user_words_{userId}` - 用户单词记录
- `wenya_study_session_{userId}_{date}` - 每日学习会话
- `wenya_smart_learning_{userId}` - 智能学习数据

### 数据同步策略

1. **写入时机**：每次学习活动完成后立即写入
2. **读取时机**：页面加载 + 30秒自动刷新
3. **缓存策略**：内存缓存 + LocalStorage持久化

## 🚀 使用指南

### 1. 查看成长星图

访问 `/growth-starmap` 页面，查看完整学习数据

### 2. 集成到其他页面

```typescript
import { useSmartLearning } from '@/hooks/useSmartLearning'

function MyComponent() {
  const { data, recordActivity } = useSmartLearning('user-id')
  
  // 记录学习活动
  const handleStudy = () => {
    recordActivity({
      type: 'word',
      id: 'word-123',
      duration: 30,
      success: true
    })
  }
  
  return <div>...</div>
}
```

### 3. 添加学习提醒

```typescript
import { LearningReminder } from '@/components/LearningReminder'

<LearningReminder userId="user-id" />
```

## 🎨 UI 特性

### 1. 实时动画
- 进度条平滑过渡
- 数据卡片悬停效果
- 成就解锁动画
- 脉冲提醒动画

### 2. 响应式设计
- 移动端适配
- 平板适配
- 桌面端优化

### 3. 主题色彩
- 嫩芽绿（Sprout）：单词学习
- 星辰黄（Star）：课程学习
- 宇宙蓝（Cosmos）：背景和辅助

## 🔧 配置选项

### SRS 配置 (`lib/srs-service.ts`)

```typescript
const SRS_CONFIG = {
  INITIAL_INTERVAL: 1,        // 初始间隔（天）
  INITIAL_EASE_FACTOR: 2.5,   // 初始难度因子
  MIN_EASE_FACTOR: 1.3,       // 最小难度因子
  DAILY_NEW_WORDS: 10,        // 每日新词数量
  DAILY_REVIEW_LIMIT: 50,     // 每日复习上限
}
```

### 刷新间隔 (`hooks/useSmartLearning.ts`)

```typescript
const REFRESH_INTERVAL = 30000 // 30秒
```

## 📈 性能优化

1. **数据缓存**：避免重复计算
2. **按需加载**：只加载必要数据
3. **防抖处理**：避免频繁更新
4. **虚拟滚动**：大数据列表优化

## 🔮 未来规划

- [ ] 云端数据同步
- [ ] 多设备数据共享
- [ ] 更多成就徽章
- [ ] 学习报告导出
- [ ] 社交分享功能
- [ ] AI学习建议优化
- [ ] 学习热力图
- [ ] 知识图谱可视化

## 🐛 已知问题

无

## 📝 更新日志

### v1.0.0 (2024-12-20)
- ✅ 初始版本发布
- ✅ 智能学习追踪系统
- ✅ 实时数据同步
- ✅ 成就系统
- ✅ 学习建议

---

**问芽星图 - 让学习如星辰般闪耀** ✨
