# 学习仪表板组件

这个目录包含了问芽星图学习仪表板的所有UI组件。

## 组件概览

### ProgressCard
显示用户的学习进度，包括当前等级、目标等级、整体进度百分比和课程完成情况。

**Props:**
- `currentLevel`: 当前英语水平
- `targetLevel`: 目标英语水平
- `progress`: 整体进度 (0-100)
- `completedLessons`: 已完成课程数
- `totalLessons`: 总课程数

**特点:**
- 嫩芽主题的渐变卡片
- 动画进度条
- 课程统计网格
- 装饰性嫩芽图案

### StarMap
可视化展示用户的成就星图，每个成就显示为一颗星星。

**Props:**
- `achievements`: 成就数组
- `width`: 星图宽度 (默认: 600)
- `height`: 星图高度 (默认: 400)

**特点:**
- 背景装饰星星（闪烁动画）
- 成就星星连线
- 逐个显示星星的动画
- 悬停显示成就详情
- 星星形状自定义绘制

### GrowthAnimation
成长动画组件，用于庆祝新成就解锁。

**Props:**
- `isVisible`: 是否显示动画
- `onComplete`: 动画完成回调
- `achievementTitle`: 成就标题

**动画阶段:**
1. 种子阶段 (seed)
2. 发芽阶段 (sprout)
3. 开花阶段 (bloom)
4. 完成阶段 (complete)

**特点:**
- 多阶段成长动画
- 星星粒子效果
- 全屏遮罩显示
- 自动完成并回调

### StatsCard
显示用户的学习统计数据。

**Props:**
- `stats`: 学习统计对象

**显示内容:**
- 学习时长
- 完成课程数
- 完成练习数
- 平均分数
- 连续学习天数
- 获得成就数

**特点:**
- 网格布局
- 图标 + 数据展示
- 悬停效果

### RecommendedLessons
显示推荐的学习课程列表。

**Props:**
- `lessons`: 课程数组
- `onStartLesson`: 开始课程回调

**特点:**
- 课程卡片列表
- 等级徽章
- 课程信息（时长、练习数）
- 开始学习按钮
- 空状态处理

## 使用示例

```tsx
import { 
  ProgressCard, 
  StarMap, 
  StatsCard, 
  RecommendedLessons,
  GrowthAnimation 
} from '@/components/dashboard'

function Dashboard() {
  return (
    <div>
      <ProgressCard
        currentLevel="beginner"
        targetLevel="intermediate"
        progress={35}
        completedLessons={5}
        totalLessons={15}
      />
      
      <StarMap achievements={achievements} />
      
      <StatsCard stats={stats} />
      
      <RecommendedLessons 
        lessons={lessons}
        onStartLesson={(id) => console.log(id)}
      />
      
      <GrowthAnimation
        isVisible={showAnimation}
        onComplete={() => setShowAnimation(false)}
        achievementTitle="新成就解锁！"
      />
    </div>
  )
}
```

## 主题系统

所有组件使用统一的嫩芽+星空主题：

- **嫩芽色系**: `sprout-*` (绿色系)
- **星辰色系**: `star-*` (黄色系)
- **深空色系**: `cosmos-*` (深蓝灰色系)

## 动画

组件使用 Tailwind CSS 和 Framer Motion 实现动画：

- `animate-sprout-grow`: 嫩芽成长动画
- `animate-star-twinkle`: 星星闪烁动画
- `animate-float`: 浮动动画

## 测试

运行测试：
```bash
npm test components/dashboard/__tests__/dashboard.test.tsx
```

## 依赖

- React
- TypeScript
- Tailwind CSS
- @/components/ui (Card, Button)
- @/types (类型定义)
