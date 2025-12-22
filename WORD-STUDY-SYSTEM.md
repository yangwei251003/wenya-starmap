# 单词学习系统 - Word Study System

## 功能概述

基于 SuperMemo-2 算法的间隔重复学习系统，提供 Zen Mode 沉浸式背单词体验。

## 核心功能

### 1. SRS 算法 (Spaced Repetition System)

基于 SuperMemo-2 算法实现智能复习调度：

- **复习质量评分**:
  - 0: 不认识 - 重置间隔，从头开始
  - 1: 模糊 - 间隔减半，难度因子降低
  - 2: 认识 - 正常推进，难度因子提升

- **间隔计算**:
  - 首次复习: 1天
  - 第二次: 3天
  - 之后: 间隔 × 难度因子

- **难度因子**:
  - 初始值: 2.5
  - 最小值: 1.3
  - 答对提升 0.1，答错降低 0.2

### 2. Zen Mode 沉浸式学习

全屏无干扰学习模式：

- **卡片正面**: 只显示英文单词和音标
- **卡片背面**: 
  - 中文释义
  - 高亮短语 (Chunking)
  - 例句及翻译
  - 易混词警示区
  - 标签分类

### 3. 键盘快捷操作

- `Space`: 翻转卡片
- `Enter`: 标记为"认识"
- `1`: 标记为"不认识"
- `2`: 标记为"模糊"
- `Esc`: 返回首页

### 4. 学习统计

- 今日学习进度
- 连续学习天数
- 已掌握单词数
- 正确/错误统计

## 页面入口

- 仪表板: `/dashboard` → "背单词" 醒目卡片
- 直接访问: `/study`

## 技术实现

### 文件结构
```
app/study/page.tsx          # Zen Mode 学习页面
lib/srs-service.ts          # SRS 算法服务
lib/words-data.ts           # 单词数据库
app/api/study/next/route.ts # 获取下一单词 API
app/api/study/review/route.ts # 提交复习结果 API
types/index.ts              # 单词相关类型定义
```

### 数据模型

```typescript
// 单词数据
interface Word {
  id: string
  word: string              // 英文单词
  meaning: string           // 中文释义
  phonetic: string          // 音标
  example: string           // 例句
  exampleCn: string         // 例句翻译
  chunk?: string            // 高亮短语
  confusingWords?: string[] // 易混词
  tags: string[]            // 标签
}

// 用户学习记录
interface UserWord {
  userId: string
  wordId: string
  nextReviewTime: Date      // 下次复习时间
  interval: number          // 复习间隔（天）
  quality: number           // 上次掌握度
  easeFactor: number        // 难度因子
  repetitions: number       // 复习次数
}
```

### 数据存储

- 使用 localStorage 存储用户学习记录
- 单词数据预置在代码中（20个CET4核心词汇）

## 界面设计

### 学习界面
- 顶部: 极细进度条
- 中央: 3D翻转卡片
- 底部: 操作按钮和键盘提示

### 视觉效果
- 卡片翻转动画
- 错误时震动效果
- 正确时 Ding 音效
- 深色宇宙主题

## 使用说明

1. 从仪表板点击"背单词"卡片进入学习
2. 看到单词后，按空格键翻转查看释义
3. 根据掌握程度选择：
   - 认识 (Enter) - 下次复习间隔延长
   - 模糊 (2) - 间隔减半
   - 不认识 (1) - 重新学习
4. 完成今日任务后显示统计结果

## 配置参数

```typescript
const SRS_CONFIG = {
  INITIAL_INTERVAL: 1,        // 初始间隔（天）
  INITIAL_EASE_FACTOR: 2.5,   // 初始难度因子
  MIN_EASE_FACTOR: 1.3,       // 最小难度因子
  DAILY_NEW_WORDS: 10,        // 每日新词数量
  DAILY_REVIEW_LIMIT: 50,     // 每日复习上限
}
```
