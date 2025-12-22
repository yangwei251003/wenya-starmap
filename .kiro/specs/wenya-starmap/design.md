# 成长星图 (Growth Starmap) - 设计文档

## 概述

成长星图是问芽星图学习平台的智能化学习中心，通过实时数据分析和个性化算法，为用户提供精准的学习指引和可视化进度展示。系统采用FSRS（Free Spaced Repetition Scheduler）算法结合机器学习技术，实现智能内容筛选、复习调度、学习路径生成等核心功能。所有学习数据自动收集并实时更新，确保为用户提供最准确和个性化的学习体验。

## 架构

### 整体架构
```
┌──────────────────────────────────────────────────────────────────┐
│                    Growth Starmap UI Layer                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ Star        │ │ Learning    │ │ Progress    │ │ Achievement │ │
│  │ Constellation│ │ Guidance    │ │ Analytics   │ │ Celebration │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│                    ┌─────────────┐ ┌─────────────┐               │
│                    │ Smart       │ │ Real-time   │               │
│                    │ Scheduler   │ │ Tracker     │               │
│                    └─────────────┘ └─────────────┘               │
└──────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                Intelligence Engine Layer                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ Content      │ │ Learning     │ │ Performance  │             │
│  │ Filter       │ │ Path AI      │ │ Predictor    │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ FSRS         │ │ Data         │ │ Accuracy     │             │
│  │ Algorithm    │ │ Validator    │ │ Monitor      │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
└──────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Data Storage Layer                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ Word Records │ │ Course       │ │ Learning     │             │
│  │ Database     │ │ Records DB   │ │ Sessions DB  │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ User         │ │ Analytics    │ │ Cache        │             │
│  │ Profiles DB  │ │ Warehouse    │ │ Layer        │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
└──────────────────────────────────────────────────────────────────┘
```

### 前端架构
- **可视化库**: D3.js（星座图）+ Recharts（统计图表）
- **动画**: Framer Motion（星星闪烁、路径连接动画）
- **状态管理**: Zustand（全局学习状态管理）
- **实时通信**: WebSocket（实时数据更新）
- **响应式**: TailwindCSS Grid（自适应布局）

### 后端架构
- **智能引擎**: 
  - 内容筛选器（避免重复学习）
  - 学习路径AI（个性化推荐）
  - 性能预测器（学习效果预测）
- **核心算法**:
  - FSRS算法（记忆计算）
  - 数据验证器（准确性保障）
  - 准确性监控器（质量控制）
- **数据层**: 
  - 多数据库架构（学习记录、用户档案、分析仓库）
  - 缓存层（Redis）
  - 实时同步机制

## 组件和接口

### 核心UI组件

#### 1. StarConstellation 组件
```typescript
interface StarData {
  id: string;
  position: { x: number; y: number };
  brightness: number; // 0-1，基于掌握程度
  category: 'word' | 'grammar' | 'listening' | 'speaking';
  connections: string[]; // 连接到其他星星的ID
  milestone: boolean; // 是否为里程碑
}

interface StarConstellationProps {
  stars: StarData[];
  userLevel: number;
  onStarClick: (starId: string) => void;
  animationEnabled: boolean;
}

// 使用D3.js渲染交互式星座图
// 星星大小和亮度反映掌握程度
// 连线显示学习路径和依赖关系
```

#### 2. LearningGuidance 组件
```typescript
interface GuidanceRecommendation {
  type: 'review' | 'new_learning' | 'practice' | 'rest';
  content: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number; // 分钟
  reasoning: string;
}

interface LearningGuidanceProps {
  recommendations: GuidanceRecommendation[];
  currentStreak: number;
  nextMilestone: string;
  onAcceptRecommendation: (type: string) => void;
}

// 显示个性化学习建议
// 包含优先级和时间估算
// 提供接受建议的交互按钮
```

#### 3. ProgressAnalytics 组件
```typescript
interface AnalyticsData {
  learningVelocity: number; // 每日新掌握内容数
  retentionRate: number; // 记忆保持率
  masteryProgression: { date: string; count: number }[];
  weakAreas: string[];
  strongAreas: string[];
}

interface ProgressAnalyticsProps {
  data: AnalyticsData;
  timeRange: '7d' | '30d' | '90d';
  onTimeRangeChange: (range: string) => void;
}

// 使用Recharts显示学习趋势
// 包含多维度分析图表
// 支持时间范围切换
```

#### 4. SmartScheduler 组件
```typescript
interface ScheduleItem {
  id: string;
  type: 'review' | 'new';
  content: string;
  scheduledTime: Date;
  estimatedDuration: number;
  priority: number;
}

interface SmartSchedulerProps {
  todaySchedule: ScheduleItem[];
  weeklyForecast: ScheduleItem[][];
  onReschedule: (itemId: string, newTime: Date) => void;
  onComplete: (itemId: string) => void;
}

// 显示智能调度的学习计划
// 支持拖拽重新安排时间
// 实时更新基于完成情况
```

#### 5. RealTimeTracker 组件
```typescript
interface TrackerData {
  currentSession: {
    startTime: Date;
    itemsCompleted: number;
    accuracy: number;
    focusScore: number;
  };
  todayStats: {
    studyTime: number;
    itemsLearned: number;
    reviewsCompleted: number;
  };
  streakInfo: {
    current: number;
    longest: number;
    target: number;
  };
}

interface RealTimeTrackerProps {
  data: TrackerData;
  isActive: boolean;
  onSessionEnd: () => void;
}

// 实时显示学习进度
// 包含专注度监控
// 学习连续天数追踪
```

### 核心服务接口

#### Intelligence Engine Service
```typescript
interface IntelligenceEngineService {
  // 智能内容筛选
  filterLearningContent(
    userId: string,
    availableContent: string[],
    timeAvailable: number
  ): Promise<string[]>;
  
  // 生成个性化学习路径
  generateLearningPath(
    userId: string,
    goals: string[],
    preferences: UserPreferences
  ): Promise<LearningPath>;
  
  // 预测学习效果
  predictPerformance(
    userId: string,
    contentId: string,
    scheduledTime: Date
  ): Promise<number>;
  
  // 检测掌握程度
  assessMasteryLevel(
    userId: string,
    contentId: string
  ): Promise<MasteryLevel>;
}
```

#### Smart Scheduler Service
```typescript
interface SmartSchedulerService {
  // 生成每日学习计划
  generateDailyPlan(
    userId: string,
    availableTime: number,
    preferences: SchedulePreferences
  ): Promise<ScheduleItem[]>;
  
  // 调整复习时间
  adjustReviewSchedule(
    userId: string,
    contentId: string,
    performanceData: PerformanceData
  ): Promise<Date>;
  
  // 检测最佳学习时间
  detectOptimalStudyTime(
    userId: string,
    historicalData: StudySession[]
  ): Promise<number[]>; // 小时数组
  
  // 平衡新学习和复习
  balanceNewAndReview(
    userId: string,
    totalTime: number
  ): Promise<{ newTime: number; reviewTime: number }>;
}
```

#### Real-Time Tracking Service
```typescript
interface RealTimeTrackingService {
  // 开始学习会话
  startSession(userId: string, contentType: string): Promise<string>;
  
  // 记录学习活动
  recordActivity(
    sessionId: string,
    activity: LearningActivity
  ): Promise<void>;
  
  // 结束学习会话
  endSession(sessionId: string): Promise<SessionSummary>;
  
  // 获取实时统计
  getRealTimeStats(userId: string): Promise<TrackerData>;
  
  // 更新掌握状态
  updateMasteryStatus(
    userId: string,
    contentId: string,
    newStatus: MasteryLevel
  ): Promise<void>;
}
```

## 数据模型

### 扩展的Word Record数据模型
```typescript
interface WordRecord {
  id: string;
  userId: string;
  wordId: string;
  
  // 记忆状态
  status: 'new' | 'learning' | 'review' | 'mastered' | 'archived';
  stability: number;        // 记忆稳定性（天）
  difficulty: number;       // 单词难度 0-1
  retrievability: number;   // 当前可提取概率 0-1
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // 时间戳
  nextReviewDate: Date;
  lastReviewDate: Date;
  masteredDate?: Date;      // 掌握时间
  createdAt: Date;
  
  // 统计
  reviewCount: number;
  correctCount: number;
  lapseCount: number;       // 遗忘次数
  averageResponseTime: number; // 平均响应时间
  
  // 智能标记
  isDuplicate: boolean;     // 是否为重复内容
  isArchived: boolean;      // 是否已归档（完全掌握）
  confidenceScore: number;  // 掌握信心分数 0-1
}
```

### Course Record数据模型
```typescript
interface CourseRecord {
  id: string;
  userId: string;
  courseId: string;
  
  // 进度状态
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  completionPercentage: number; // 0-100
  masteryScore: number;         // 0-100
  
  // 时间追踪
  startDate: Date;
  lastAccessDate: Date;
  completionDate?: Date;
  totalStudyTime: number;       // 总学习时间（分钟）
  
  // 性能数据
  averageAccuracy: number;      // 平均准确率
  strugglingAreas: string[];    // 困难领域
  strongAreas: string[];        // 优势领域
  
  // 智能标记
  isRecommended: boolean;       // 是否为推荐课程
  prerequisitesMet: boolean;    // 是否满足前置条件
  difficultyRating: number;     // 难度评级 1-5
}
```

### Learning Session数据模型
```typescript
interface LearningSession {
  id: string;
  userId: string;
  
  // 会话基本信息
  startTime: Date;
  endTime?: Date;
  sessionType: 'review' | 'new_learning' | 'practice' | 'assessment';
  deviceType: 'mobile' | 'desktop' | 'tablet';
  
  // 内容信息
  contentIds: string[];         // 学习的内容ID列表
  contentTypes: string[];       // 内容类型列表
  
  // 性能数据
  totalItems: number;
  correctItems: number;
  averageResponseTime: number;
  focusScore: number;           // 专注度分数 0-1
  
  // 环境数据
  hour: number;                 // 0-23，用于专注度分析
  dayOfWeek: number;           // 0-6，用于模式分析
  studyDuration: number;        // 实际学习时长（分钟）
  
  // 智能分析
  efficiencyScore: number;      // 学习效率分数 0-1
  recommendedBreak: boolean;    // 是否建议休息
  nextSessionSuggestion: Date;  // 下次学习建议时间
}
```

### User Learning Profile数据模型
```typescript
interface UserLearningProfile {
  userId: string;
  
  // 学习偏好
  preferredStudyTimes: number[];    // 偏好的学习时间（小时）
  preferredSessionLength: number;   // 偏好的学习时长（分钟）
  difficultyPreference: 'easy' | 'moderate' | 'challenging';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  
  // 能力评估
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  strongAreas: string[];
  weakAreas: string[];
  learningVelocity: number;         // 学习速度（项目/小时）
  
  // 目标设置
  dailyGoal: number;                // 每日学习目标（分钟）
  weeklyGoal: number;               // 每周学习目标（分钟）
  targetLevel: string;              // 目标水平
  targetDate?: Date;                // 目标达成日期
  
  // 智能参数
  forgettingCurveParams: {
    decayRate: number;
    stabilityFactor: number;
    difficultyWeight: number;
  };
  adaptiveParameters: {
    learningRate: number;
    retentionThreshold: number;
    masteryThreshold: number;
  };
}
```

## 正确性属性

*属性是一个特征或行为,应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

**属性 1: 智能内容筛选准确性**
*对于任何*用户的学习内容请求，系统应该排除掌握程度为"已掌握"且稳定性大于90天的内容
**验证需求: Requirements 1.1**

**属性 2: 学习优先级排序**
*对于任何*学习推荐列表，内容应该按照可提取概率和学习紧急程度进行优先级排序
**验证需求: Requirements 1.2**

**属性 3: 掌握内容确认机制**
*对于任何*已掌握的内容，当用户尝试学习时应该显示确认对话框
**验证需求: Requirements 1.3**

**属性 4: 自动掌握状态提升**
*对于任何*连续高表现的内容，系统应该自动将其提升为已掌握状态
**验证需求: Requirements 1.4**

**属性 5: FSRS复习间隔计算**
*对于任何*单词记录，复习间隔应该基于FSRS算法和个人遗忘曲线计算
**验证需求: Requirements 2.1**

**属性 6: 新学习与复习平衡**
*对于任何*每日学习计划，新学习和复习内容应该保持3:7的比例
**验证需求: Requirements 2.2**

**属性 7: 低可提取概率优先复习**
*对于任何*可提取概率低于0.8的内容，应该被优先安排复习
**验证需求: Requirements 2.3**

**属性 8: 个性化学习路径生成**
*对于任何*用户性能分析，系统应该基于优势和劣势生成个性化学习路径
**验证需求: Requirements 3.1**

**属性 9: 学习指导推理解释**
*对于任何*学习建议，系统应该提供具体的推理解释
**验证需求: Requirements 3.2**

**属性 10: 动态路径调整**
*对于任何*新的学习表现数据，系统应该动态调整学习路径
**验证需求: Requirements 3.3**

**属性 11: 实时记录更新**
*对于任何*完成的学习活动，系统应该在2秒内更新相关的学习记录
**验证需求: Requirements 4.1, 4.2**

**属性 12: 统计数据一致性**
*对于任何*学习记录变化，所有相关统计数据应该保持一致性
**验证需求: Requirements 4.3**

**属性 13: 实时显示最新数据**
*对于任何*进度查看请求，系统应该显示最新的数据而无需手动刷新
**验证需求: Requirements 4.4**

**属性 14: 数据完整性验证**
*对于任何*学习指标计算，系统应该验证输入数据的完整性和准确性
**验证需求: Requirements 5.1**

**属性 15: 数据不一致检测**
*对于任何*检测到的数据不一致，系统应该标记错误并请求验证
**验证需求: Requirements 5.2**

**属性 16: 事务锁定防冲突**
*对于任何*并发更新操作，系统应该使用事务锁定防止数据冲突
**验证需求: Requirements 5.5**

**属性 17: 星座图里程碑显示**
*对于任何*学习里程碑，星座图应该显示相应的星星连接和动画
**验证需求: Requirements 6.1**

**属性 18: 成就动画触发**
*对于任何*达成的学习里程碑，系统应该触发新星星出现的动画
**验证需求: Requirements 6.3**

**属性 19: 跨设备数据同步**
*对于任何*设备切换，系统应该同步所有学习进度和推荐
**验证需求: Requirements 8.4**

**属性 20: 用户数据隔离**
*对于任何*用户的数据请求，系统应该只返回该用户的学习记录和推荐
**验证需求: Requirements 9.2, 9.3**

## 错误处理

### 前端错误处理
```typescript
// 智能引擎错误处理
interface IntelligenceError {
  type: 'recommendation_failed' | 'path_generation_failed' | 'prediction_failed';
  message: string;
  fallback: 'use_cached' | 'use_default' | 'retry_with_simpler_algorithm';
  retryCount: number;
}

// 实时追踪错误处理
interface TrackingError {
  type: 'session_lost' | 'sync_failed' | 'data_corruption';
  message: string;
  recoveryAction: 'restore_from_backup' | 'restart_session' | 'manual_sync';
}
```

### 后端错误处理
```typescript
// 数据一致性错误
// - 检测到记录不匹配时触发数据修复流程
// - 并发更新冲突时使用乐观锁重试机制

// 算法计算错误
// - FSRS参数异常时使用默认参数
// - 学习路径生成失败时提供基础推荐

// 性能监控
// - 响应时间超过2秒时记录性能警告
// - 内存使用过高时触发缓存清理
```

### 数据恢复机制
- **自动备份**: 每小时备份关键学习数据
- **增量同步**: 检测到数据丢失时从最近备份恢复
- **冲突解决**: 多设备数据冲突时使用时间戳优先策略
- **完整性检查**: 每日运行数据完整性检查和修复

## 测试策略

### 单元测试
使用**Jest**和**React Testing Library**进行单元测试：

- **智能算法测试**: 测试内容筛选、路径生成、性能预测等核心算法
- **UI组件测试**: 测试星座图、学习指导、进度分析等可视化组件
- **数据服务测试**: 测试实时追踪、智能调度等数据处理逻辑
- **边界情况**: 测试空数据、极端值、并发操作等情况

### 基于属性的测试
使用**fast-check**库进行JavaScript/TypeScript的基于属性测试：

- 每个属性测试必须运行最少**100次迭代**
- 每个基于属性的测试必须使用格式标注：**Feature: growth-starmap, Property {number}: {property_text}**
- 每个基于属性的测试必须明确标注验证的需求编号

**测试覆盖的属性**:
- 属性1-20: 所有正确性属性都应该有对应的基于属性测试
- 重点测试: 智能筛选、FSRS算法、实时同步、数据一致性

### 集成测试
- **端到端智能流程**: 学习活动 → 智能分析 → 路径调整 → 推荐更新
- **实时同步测试**: 多设备并发学习时的数据同步准确性
- **性能压力测试**: 大量用户同时使用时的系统响应能力

### 测试数据生成器
```typescript
// 为基于属性测试生成随机数据
interface TestDataGenerator {
  // 生成随机学习记录
  generateLearningRecord(): WordRecord | CourseRecord;
  
  // 生成随机学习会话
  generateLearningSession(): LearningSession;
  
  // 生成特定掌握程度的记录
  generateRecordWithMastery(level: MasteryLevel): WordRecord;
  
  // 生成用户学习档案
  generateUserProfile(): UserLearningProfile;
}
```