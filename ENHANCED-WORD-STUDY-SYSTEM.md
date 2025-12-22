# 增强版背单词系统 - 参考"不背单词"APP

## 🎯 系统特点

### 1. 多组学习模式
- ✅ 无限学习：不限制每日学习量
- ✅ 分组学习：每组10-50个单词可自定义
- ✅ 灵活配置：新词/复习词比例可调整
- ✅ 连续学习：完成一组立即可以开始下一组

### 2. 智能算法
- ✅ SuperMemo-2间隔重复算法
- ✅ 优先复习到期单词
- ✅ 自动调整复习间隔
- ✅ 记忆曲线优化

### 3. 用户体验
- ✅ 卡片翻转交互
- ✅ 键盘快捷键支持
- ✅ 实时进度显示
- ✅ 音效反馈
- ✅ 语音朗读

### 4. 数据追踪
- ✅ 今日完成组数
- ✅ 今日学习单词数
- ✅ 正确率统计
- ✅ 连续学习天数
- ✅ 总掌握单词数

## 📱 页面流程

### 1. 配置页面 (`/study-v2`)
用户可以设置：
- 每组单词数（10-50个）
- 每组新词数（0-全部）
- 查看今日统计

### 2. 学习页面
- 卡片式单词展示
- 正面：单词 + 音标
- 背面：释义 + 例句 + 搭配 + 易混词
- 三个选项：不认识 / 模糊 / 认识

### 3. 完成页面
- 本组完成统计
- 继续下一组按钮
- 查看成长星图按钮
- 返回首页按钮

## 🔧 技术实现

### 核心服务：`lib/enhanced-srs-service.ts`

#### 主要功能

**1. 配置管理**
```typescript
interface StudyPlanConfig {
  wordsPerGroup: number      // 每组单词数
  newWordsPerGroup: number    // 每组新词数
  reviewWordsPerGroup: number // 每组复习词数
  unlimitedMode: boolean      // 无限学习模式
  autoNextGroup: boolean      // 自动进入下一组
}
```

**2. 学习组管理**
```typescript
interface StudyGroup {
  groupId: string
  words: Word[]
  isNew: boolean[]
  completed: number
  total: number
  startTime: Date
  endTime?: Date
}
```

**3. 统计数据**
```typescript
interface StudyStats {
  todayGroups: number         // 今日完成组数
  todayWords: number          // 今日学习单词数
  todayNewWords: number       // 今日新词数
  todayReviewWords: number    // 今日复习词数
  todayCorrect: number        // 今日正确数
  todayWrong: number          // 今日错误数
  accuracy: number            // 正确率
  streak: number              // 连续学习天数
  totalMastered: number       // 总掌握单词数
}
```

#### 核心方法

**创建学习组**
```typescript
createStudyGroup(userId: string): StudyGroup | null
```
- 优先安排复习词
- 补充新词
- 打乱顺序
- 返回学习组

**获取下一个单词**
```typescript
getNextWordInGroup(userId: string): {
  word: Word
  isNew: boolean
  progress: { current: number; total: number }
} | null
```

**提交复习结果**
```typescript
submitWordReview(userId: string, wordId: string, quality: ReviewQuality): void
```
- 更新单词记录
- 计算下次复习时间
- 更新学习组进度
- 更新统计数据

## 📊 数据存储

### LocalStorage 键值

- `wenya_enhanced_config_{userId}` - 用户学习配置
- `wenya_enhanced_words_{userId}` - 用户单词记录
- `wenya_enhanced_current_group_{userId}` - 当前学习组
- `wenya_enhanced_stats_{userId}_{date}` - 每日统计数据

### 数据结构

**用户单词记录 (UserWord)**
```typescript
{
  userId: string
  wordId: string
  nextReviewTime: Date        // 下次复习时间
  interval: number            // 复习间隔（天）
  quality: ReviewQuality      // 最后复习质量
  easeFactor: number          // 难度因子
  repetitions: number         // 重复次数
  createdAt: Date
  updatedAt: Date
}
```

## 🎮 交互设计

### 键盘快捷键

- `Space` - 翻转卡片
- `1` - 不认识
- `2` - 模糊
- `Enter` - 认识
- `Esc` - 返回

### 视觉反馈

- ✅ 正确：绿色 + 成功音效
- ❌ 错误：红色 + 震动动画 + 错误音效
- 🆕 新词：星星标记
- 📊 进度条：实时更新

## 🔄 学习流程

```
1. 用户进入配置页面
   ↓
2. 设置每组单词数和新词数
   ↓
3. 点击"开始学习"
   ↓
4. 系统创建学习组（复习词 + 新词）
   ↓
5. 显示第一个单词
   ↓
6. 用户翻转卡片查看释义
   ↓
7. 用户选择：不认识/模糊/认识
   ↓
8. 系统记录结果，更新算法
   ↓
9. 显示下一个单词
   ↓
10. 重复步骤5-9，直到本组完成
    ↓
11. 显示完成页面，统计数据
    ↓
12. 用户选择：
    - 继续下一组 → 回到步骤4
    - 查看成长星图
    - 返回首页
```

## 📈 SuperMemo-2 算法

### 复习质量评分

- `0` - 不认识：重置间隔，从头开始
- `1` - 模糊：间隔减半，降低难度因子
- `2` - 认识：正常推进，增加难度因子

### 间隔计算

```typescript
if (quality === 0) {
  repetitions = 0
  interval = 1
} else if (quality === 1) {
  interval = max(1, floor(interval * 0.5))
  easeFactor = max(1.3, easeFactor - 0.2)
} else {
  repetitions += 1
  if (repetitions === 1) {
    interval = 1
  } else if (repetitions === 2) {
    interval = 3
  } else {
    interval = round(interval * easeFactor)
  }
  easeFactor = max(1.3, easeFactor + 0.1)
}
```

### 记忆曲线

- 第1次：1天后复习
- 第2次：3天后复习
- 第3次：根据难度因子计算（通常7-10天）
- 第4次及以后：间隔逐渐增加

## 🎨 UI 设计参考

### 配置页面
- 大标题 + 副标题
- 今日统计卡片（3个）
- 滑块配置（2个）
- 说明文字
- 大按钮"开始学习"

### 学习页面
- 顶部进度条
- 工具栏（返回 + 统计）
- 中央卡片（可翻转）
- 底部操作按钮（3个）
- 键盘提示

### 完成页面
- 成就图标
- 完成提示
- 统计卡片
- 操作按钮（3个）

## 🚀 使用指南

### 1. 首次使用

1. 访问 `/study-v2`
2. 设置每组单词数（推荐20个）
3. 设置新词数（推荐10个）
4. 点击"开始学习"

### 2. 日常学习

1. 系统自动加载待复习单词
2. 优先复习到期单词
3. 完成复习后学习新词
4. 每组完成后可继续下一组

### 3. 学习建议

- 每组20个单词，学习效率最高
- 新词占50%，复习词占50%
- 每天至少完成2-3组
- 保持连续学习，效果更好

## 📝 单词数据库

### 当前词库

- CET4 核心词汇：40个
- 持续扩展中...

### 单词属性

```typescript
interface Word {
  id: string
  word: string              // 单词
  meaning: string           // 释义
  phonetic: string          // 音标
  example: string           // 例句
  exampleCn: string         // 例句翻译
  chunk: string             // 常用搭配
  confusingWords: string[]  // 易混词
  tags: string[]            // 标签（CET4/CET6/高频等）
}
```

## 🔮 未来规划

- [ ] 扩展词库到5000+单词
- [ ] 添加CET6、考研、托福、雅思词库
- [ ] 单词本功能（收藏/标记）
- [ ] 错题本（重点复习错误单词）
- [ ] 单词测试（拼写/听力）
- [ ] 学习报告（周报/月报）
- [ ] 社交功能（排行榜/打卡）
- [ ] 离线模式
- [ ] 云端同步

## 🐛 已知问题

无

## 📊 性能优化

- LocalStorage 存储，快速读写
- 按需加载单词数据
- 防抖处理用户操作
- 动画性能优化

---

**问芽星图 - 让背单词更高效** 📚✨
