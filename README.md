# 🌱 问芽星图 (WenYa StarMap)

<div align="center">

**AI驱动的英语学习平台 | 让学习像星辰般璀璨**

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## ✨ 特性

- 🌱 **个性化学习路径** - 基于AI的智能学习路径生成
- ⭐ **星图可视化** - 将学习进度转化为璀璨星空
- 🎯 **多样化练习** - 听说读写全方位练习，AI实时反馈
- 📊 **智能分析** - 详细的学习数据分析和进度追踪
- 🎨 **精美设计** - 嫩芽成长+星空主题
- 🤖 **AI导师** - 智谱GLM驱动的智能辅导系统
- 🔒 **安全可靠** - 完善的错误处理和性能监控
- ⚡ **高性能** - 优化的缓存策略和性能监控

## 🚀 快速开始

### 安装

```bash
npm install
```

### 配置环境变量

```bash
cp .env.example .env.local
# 编辑 .env.local 填入你的 GLM_API_KEY
```

### 开发

```bash
npm run dev
# 打开 http://localhost:3000
```

### 构建

```bash
npm run build
npm start
```

### 测试

```bash
npm test
```

## 🚢 部署到Netlify

```bash
# 使用部署脚本
.\deploy.ps1

# 或使用npm命令
npm run deploy
```

详细步骤请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📁 项目结构

```
├── app/                    # Next.js页面
├── components/             # React组件
├── lib/                    # 核心服务
├── hooks/                  # 自定义Hooks
└── types/                  # TypeScript类型
```

## 🛠️ 技术栈

- Next.js 14 + TypeScript
- TailwindCSS + Framer Motion
- 智谱GLM API
- Jest + React Testing Library

## 📚 文档

- [部署指南](./DEPLOYMENT.md)
- [快速部署](./QUICK-DEPLOY.md)
- [性能和错误处理](./lib/SYSTEM-PERFORMANCE-ERROR-HANDLING.md)

## 📄 许可证

MIT

---

<div align="center">

**用心打造，让英语学习像星辰般璀璨 ✨**

</div>
