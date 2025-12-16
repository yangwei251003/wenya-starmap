# 问芽星图 (WenYa StarMap) - 设计文档

## 概述

问芽星图是一个基于Next.js的AI驱动英语学习平台，采用"嫩芽成长 + 璀璨繁星"的视觉主题。系统通过智谱GLM API提供个性化学习体验，使用现代Web技术栈构建响应式、交互式的学习环境。

## 架构

### 整体架构
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Node.js API    │    │  智谱 GLM API   │
│   (Frontend)    │◄──►│   (Backend)      │◄──►│   (AI Service)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   TailwindCSS   │    │    Database      │
│ Framer Motion   │    │   (用户数据)      │
└─────────────────┘    └──────────────────┘
```

### 前端架构 (Next.js App Router)
- **App Router**: 使用Next.js 13+的app目录结构
- **组件层次**: 页面组件 → 布局组件 → UI组件 → 基础组件
- **状态管理**: React Context + useState/useReducer
- **样式系统**: TailwindCSS + CSS变量（主题系统）
- **动画系统**: Framer Motion（成长动画和星空效果）

### 后端架构 (Node.js + Express)
- **API层**: RESTful API设计
- **服务层**: 业务逻辑处理
- **数据层**: 数据库操作和缓存
- **AI集成层**: 智谱GLM API调用和响应处理

## 组件和接口

### 核心页面组件
```typescript
// 页面路由结构
/app
├── page.tsx                 // 首页
├── auth/
│   ├── login/page.tsx      // 登录页
│   └── register/page.tsx   // 注册页
├── dashboard/page.tsx      // 学习仪表板
├── lesson/
│   ├── page.tsx           // 课程列表
│   └── [id]/page.tsx      // 具体课程
├── quiz/
│   ├── page.tsx           // 练习中心
│   └── [type]/page.tsx    // 具体练习类型
├── vocab/page.tsx         // 词汇学习
├── chat/page.tsx          // AI对话
└── profile/page.tsx       // 个人档案
```

### 核心组件接口
```typescript
// 用户相关接口
interface User {
  id: string;
  username: string;
  email: string;
  level: EnglishLevel;
  starAchievements: StarAchievement[];
  learningPath: LearningPath;
  createdAt: Date;
}

// 学习路径接口
interface LearningPath {
  id: string;
  userId: string;
  currentLevel: EnglishLevel;
  targetLevel: EnglishLevel;
  completedLessons: string[];
  recommendedNext: Lesson[];
  progress: number; // 0-100
}

// 星辰成就接口
interface StarAchievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  earnedAt: Date;
  starPosition: { x: number; y: number }; // 星图中的位置
}

// 课程接口
interface Lesson {
  id: string;
  title: string;
  description: string;
  level: EnglishLevel;
  content: LessonContent;
  exercises: Exercise[];
  estimatedTime: number; // 分钟
}

// AI导师接口
interface AITutor {
  generateContent(prompt: string, userLevel: EnglishLevel): Promise<string>;
  evaluateAnswer(question: string, answer: string): Promise<Evaluation>;
  provideFeedback(performance: UserPerformance): Promise<Feedback>;
}
```

## 数据模型

### 用户数据模型
```typescript
// 用户表
interface UserModel {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  englishLevel: 'beginner' | 'intermediate' | 'advanced';
  totalStudyTime: number; // 秒
  createdAt: Date;
  updatedAt: Date;
}

// 学习进度表
interface ProgressModel {
  id: string;
  userId: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  timeSpent: number; // 秒
  completedAt?: Date;
}

// 成就表
interface AchievementModel {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  metadata: Record<string, any>; // 额外数据
  earnedAt: Date;
}
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

**属性 1: 用户注册完整性**
*对于任何*有效的用户注册数据，提交注册应该创建用户账户、生成学习路径，并触发欢迎界面和成长动画
**验证需求: Requirements 1.2, 1.4**

**属性 2: 认证和重定向一致性**
*对于任何*有效的用户凭据，登录应该验证用户身份并重定向到仪表板；对于无效凭据，应该拒绝访问
**验证需求: Requirements 1.5**

**属性 3: AI内容个性化**
*对于任何*用户学习会话，AI生成的内容应该与用户的英语水平和学习路径相匹配
**验证需求: Requirements 3.1, 3.2**

**属性 4: 学习进度可视化**
*对于任何*用户的学习数据，仪表板应该正确显示所有成就在星图中，并使用成长动画展示进度
**验证需求: Requirements 2.2, 2.3**

**属性 5: 练习评估准确性**
*对于任何*练习答案，系统应该通过AI正确评估答案，提供详细反馈，并在答对时触发成就和动画
**验证需求: Requirements 4.2, 4.3**

## 错误处理

### 前端错误处理
```typescript
// 全局错误边界
class GlobalErrorBoundary extends React.Component {
  // 捕获React组件错误
}

// API错误处理
interface APIError {
  code: string;
  message: string;
  details?: any;
}
```

## 测试策略

### 单元测试
- **组件测试**: 使用React Testing Library测试UI组件
- **工具函数测试**: 测试纯函数和工具方法
- **API测试**: 测试后端API端点

### 基于属性的测试
- 使用**fast-check**库进行JavaScript/TypeScript的基于属性测试
- 每个属性测试必须运行最少**100次迭代**
- 每个基于属性的测试必须使用格式：**Feature: wenya-starmap, Property {number}: {property_text}**