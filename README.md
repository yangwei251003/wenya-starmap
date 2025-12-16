# 问芽星图 (WenYa StarMap)

AI驱动的智慧英语学习平台，以"嫩芽成长 + 璀璨繁星"为核心主题。

## 🌱 项目概述

问芽星图是一个现代化的英语学习平台，通过智谱GLM API提供个性化学习体验。平台将学习者的成长过程可视化为从嫩芽破土到璀璨繁星的美丽旅程。

### 核心特色

- 🤖 **AI个性化学习**: 基于智谱GLM API的智能内容生成和学习路径规划
- ⭐ **成就可视化**: 将学习成果转化为星图中的闪亮星辰
- 📊 **进度追踪**: 全面的学习数据统计、趋势分析和智能建议
- 🎨 **统一主题设计**: 嫩芽成长 + 星空主题的一致性视觉体验
- 📱 **响应式设计**: 支持桌面端和移动端的完美体验
- 🎯 **互动练习**: 听说读写全方位的学习练习系统
- 🎉 **成就分享**: 支持社交媒体分享和精美图片生成

## 🛠️ 技术栈

### 前端
- **Next.js 14**: React框架，使用App Router
- **TypeScript**: 类型安全的JavaScript
- **TailwindCSS**: 实用优先的CSS框架
- **Framer Motion**: 流畅的动画效果库

### 后端
- **Node.js**: JavaScript运行时
- **Express**: Web应用框架
- **智谱GLM API**: AI内容生成和评估

### 开发工具
- **ESLint**: 代码质量检查
- **Jest**: 单元测试框架
- **fast-check**: 基于属性的测试库

## 🚀 快速开始

### 环境要求

- Node.js 18.0+
- npm 或 yarn

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd wenya-starmap
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 配置环境变量
```bash
cp .env.example .env.local
# 编辑 .env.local 文件，填入必要的配置
```

4. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

5. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
wenya-starmap/
├── app/                    # Next.js App Router页面
│   ├── auth/              # 认证相关页面
│   ├── dashboard/         # 学习仪表板
│   ├── lesson/            # 课程页面
│   ├── quiz/              # 练习页面
│   ├── vocab/             # 词汇学习
│   ├── chat/              # AI对话
│   ├── profile/           # 个人档案
│   └── progress-demo/     # 进度追踪演示页面
├── components/            # React组件
│   ├── dashboard/         # 仪表板组件
│   ├── exercise/          # 练习组件
│   └── ui/                # 基础UI组件
├── hooks/                 # 自定义React Hooks
│   ├── useDashboard.ts    # 仪表板数据Hook
│   ├── useProgressTracking.ts  # 进度追踪Hook
│   └── useLocalStorage.ts # 本地存储Hook
├── lib/                   # 工具函数和服务
│   ├── achievement-service.ts  # 成就系统服务
│   ├── exercise-service.ts     # 练习系统服务
│   ├── learning-path.ts        # 学习路径服务
│   ├── progress-tracking-service.ts  # 进度追踪服务
│   ├── examples/          # 集成示例
│   └── __tests__/         # 单元测试
├── types/                 # TypeScript类型定义
└── .kiro/                 # 项目规范文档
    └── specs/
        └── wenya-starmap/
            ├── requirements.md  # 需求文档
            ├── design.md       # 设计文档
            └── tasks.md        # 任务列表
```

## 🎨 设计主题

### 色彩系统

- **嫩芽绿 (Sprout)**: 代表成长和学习的开始
- **星辰金 (Star)**: 代表成就和闪耀的时刻
- **深空蓝 (Cosmos)**: 代表知识的深邃和无限可能

### 动画效果

- **成长动画**: 模拟嫩芽破土而出的生长过程
- **星辰闪烁**: 展示学习成就的闪耀效果
- **浮动效果**: 营造轻盈的学习氛围

## 📚 功能文档

### 核心系统

- **学习路径系统**: [lib/README-LEARNING-PATH.md](lib/README-LEARNING-PATH.md)
- **进度追踪系统**: [lib/README-PROGRESS-TRACKING.md](lib/README-PROGRESS-TRACKING.md)
- **快速入门指南**: [lib/QUICK-START-GUIDE.md](lib/QUICK-START-GUIDE.md)
- **进度追踪快速入门**: [lib/QUICK-START-PROGRESS-TRACKING.md](lib/QUICK-START-PROGRESS-TRACKING.md)

### 演示页面

- **仪表板**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **进度追踪演示**: [http://localhost:3000/progress-demo](http://localhost:3000/progress-demo)

## 🧪 测试

### 运行测试
```bash
npm run test
# 或
yarn test
```

### 运行特定测试
```bash
# 进度追踪服务测试
npm test lib/__tests__/progress-tracking-service.test.ts

# 进度追踪集成测试
npm test lib/__tests__/progress-tracking.integration.test.tsx
```

### 测试覆盖率
```bash
npm run test -- --coverage
# 或
yarn test --coverage
```

## 📝 开发规范

项目遵循规范驱动开发(Spec-Driven Development)方法论：

1. **需求阶段**: 明确功能需求和验收标准
2. **设计阶段**: 制定技术架构和正确性属性
3. **实施阶段**: 按任务列表逐步实现功能

详细的开发规范请参考 `.kiro/specs/wenya-starmap/` 目录下的文档。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🌟 致谢

- 智谱AI提供的GLM API支持
- Next.js团队提供的优秀框架
- 所有为开源社区做出贡献的开发者们

---

**让学习如星辰般闪耀 ✨**