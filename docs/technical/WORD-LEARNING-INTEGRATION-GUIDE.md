# 单词学习系统集成指南

## 概述

问芽星图的单词学习系统现在完全集成了两个互补的记忆算法:

1. **SRS (SuperMemo-2)**: 传统的间隔重复算法，用于日常学习调度
2. **FSRS (Free Spaced Repetition Scheduler)**: 现代记忆算法，用于记忆驾驶舱分析

## 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    用户学习界面                          │
│                  (app/study/page.tsx)                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  SRS Service                            │
│              (lib/srs-service.ts)                       │
│  - SuperMemo-2 算法                                     │
│  - 学习队列管理                                          │
│  - 每日统计                                             │
└────────────┬───────────────────┬────────────────────────┘
             │                   │
             ▼                   ▼
┌────────────────────┐  ┌──────────────────────────────┐
│  localStorage      │  │  Word Record Service         │
│  (SRS 数据)        │  │  (lib/word-record-service.ts)│
└────────────────────┘  │  - FSRS 算法                 │
                        │  - 记忆分析                   │
                        │  - 学习会话追踪               │
                        └──────────┬───────────────────┘
                                   │
                                   ▼
                        ┌──────────────────────────────┐
                        │  Memory Calculation Service  │
                        │  (记忆驾驶舱)                 │
                        │  - 记忆电量                   │
                        │  - 沉淀层分析                 │
                        │  - 复习预测                   │
                        │  - 专注度分析                 │
                        └──────────────────────────────┘
```

## 使用方法

### 1. 基础学习流程

```typescript
import { srsService } from '@/lib/srs-service'

// 获取下一个待学习的单词
const next = srsService.getNextWord(userId)

if (next) {
  const { word, isNew } = next
  
  // 显示单词给用户
  console.log(`单词: ${word.word}`)
  console.log(`是否新词: ${isNew}`)
  
  // 用户答题后提交结果
  // quality: 0=不认识, 1=模糊, 2=认识
  const quality = 2 // 用户选择"认识"
  
  // 自动同步到两个系统
  srsService.submitReview(userId, word.id, quality)
}
```

### 2. 获取学习进度

```typescript
import { srsService } from '@/lib/srs-service'

const progress = srsService.getProgress(userId)

console.log(`今日待学习: ${progress.todayTotal}`)
console.log(`今日已完成: ${progress.todayCompleted}`)
console.log(`新词数量: ${progress.todayNew}`)
console.log(`复习数量: ${progress.todayReview}`)
console.log(`连续学习: ${progress.streak} 天`)
console.log(`已掌握: ${progress.totalMastered} 个单词`)
```

### 3. 访问记忆驾驶舱数据

```typescript
import { wordRecordService } from '@/lib/word-record-service'

// 获取所有单词记录
const records = wordRecordService.getWordRecords(userId)

// 获取特定单词的记录
const record = wordRecordService.getWordRecord(userId, wordId)

if (record) {
  console.log(`记忆稳定性: ${record.stability} 天`)
  console.log(`可提取概率: ${(record.retrievability * 100).toFixed(1)}%`)
  console.log(`复习次数: ${record.reviewCount}`)
  console.log(`正确次数: ${record.correctCount}`)
  console.log(`遗忘次数: ${record.lapseCount}`)
}

// 获取学习会话（用于专注度分析）
const sessions = wordRecordService.getStudySessions(userId, 7) // 最近7天
console.log(`最近7天学习会话: ${ses