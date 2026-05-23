# 问芽星图 - WenYa StarMap

面向“传智杯 Web 开发智慧教育赛道”的 AI 英语学习平台。项目以 Next.js 全栈架构实现学习诊断、AI 陪练、智能复习、成长星图、课程生态与后台运维控制台，目标是把英语学习从零散任务变成一条可视化、可反馈、可持续运营的成长路径。

> 前后端一体化部署于 Vercel，API 路由、页面渲染与运维控制台同域运行。

## 评委快速浏览

- 线上体验：<https://wenya-starmap-e6f3.vercel.app/>
- 评审中心：`/competition`
- 演示入口：`/demo`
- 学习总览：`/dashboard`
- AI 对话陪练：`/chat`
- AI 写作工坊：`/ai-writing`
- 成长星图：`/growth-starmap`
- 后台控制台：`/admin`

建议浏览顺序：**首页 -> Dashboard -> AI 写作工坊 -> 练习中心 -> 成长星图 -> 评审中心**。如果评委只看 2 分钟，优先体验首页、AI 中心、写作工坊、练习解析和评审中心。

## 项目亮点

1. **智慧教育闭环**：覆盖诊断、学习、练习、复习、反馈、成长展示。
2. **语言星图可视化**：把课程、单词、成就和成长轨迹重构为可点亮的星座路径。
3. **AI 学习能力**：支持 AI 对话陪练、写作批改、学习诊断、错题解析与个性化建议。
4. **智能复习系统**：结合 SRS / FSRS 记忆调度，让复习时机更科学。
5. **产品化后台**：提供后台控制台，展示用户、交易、学习日志、服务健康等运维视角。
6. **完整上线能力**：GitHub 托管代码，Vercel 部署前后端一体化应用。

## 功能特色

- 🤖 **AI智能对话** - 与AI导师实时互动练习英语
- 📚 **个性化学习路径** - 根据水平定制学习计划
- 🎯 **互动练习** - 听说读写全方位训练
- ⭐ **成就系统** - 学习成果可视化，点亮专属星图
- 📊 **进度追踪** - 实时监控学习进度
- 🌌 **语言星图** - 基于动态星座的成长可视化
- 🎙️ **NovaSprout** - AI 语音助手随节奏律动反馈
- 🛠️ **后台控制台** - 直连数据库与服务健康状态，支持运维查看

## 技术实现

| 模块 | 技术 |
|------|------|
| 前端框架 | Next.js 14, React 18, TypeScript |
| 视觉交互 | Tailwind CSS, Framer Motion, Recharts, Lucide React |
| 后端接口 | Next.js API Routes |
| 数据服务 | Supabase |
| AI 能力 | OpenRouter 模型服务 |
| 支付与交易 | Stripe 接口预留与星币交易逻辑 |
| 测试与质量 | Jest, TypeScript, Next.js production build |
| 部署 | Vercel |

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
# 复制环境变量示例文件
cp .env.example .env.local

# 编辑 .env.local，填入你的配置
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 访问应用
- 线上地址: https://wenya-starmap-e6f3.vercel.app/
- 本地开发: [http://localhost:3000](http://localhost:3000)

## 📋 环境变量配置

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 项目地址 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase 公钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | 服务端数据库访问密钥 |
| `OPENROUTER_API_KEY` | ✅ | AI 模型调用密钥 |
| `STRIPE_SECRET_KEY` | ❌ | 支付服务密钥 |
| `NEXT_PUBLIC_APP_URL` | ❌ | 应用URL |

### 获取GLM API Key
1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册并登录
3. 进入控制台 → API Keys
4. 创建新的API Key

## 📁 项目结构

```
├── app/                    # Next.js 页面
│   ├── api/               # API路由
│   │   ├── auth/          # 认证接口
│   │   └── ai/            # AI接口
│   ├── auth/              # 登录/注册页面
│   ├── dashboard/         # 学习仪表板
│   ├── quiz/              # 练习中心
│   ├── vocab/             # 词汇学习
│   ├── chat/              # AI对话
│   └── lesson/            # 课程学习
├── components/            # React组件
│   ├── ui/               # 通用UI组件
│   ├── dashboard/        # 仪表板组件
│   └── exercise/         # 练习组件
├── lib/                   # 工具库
├── hooks/                 # React Hooks
└── types/                 # TypeScript类型
```

## 🔧 API接口

详细的API文档请查看 [API-CONFIGURATION.md](./docs/ai/API-CONFIGURATION.md)

### 主要接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/ai/chat` - AI对话

## 🌐 部署

### Vercel 部署
```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录并部署
vercel login
vercel --prod
```

详细部署指南请查看 [docs/deploy/VERCEL-部署指南.md](./docs/deploy/VERCEL-%E9%83%A8%E7%BD%B2%E6%8C%87%E5%8D%97.md)

## 🎮 演示账号

无需注册，直接体验：
- 访问 `/demo` 页面
- 选择任意角色即可开始

## 📄 文档

- [API配置文档](./docs/ai/API-CONFIGURATION.md)
- [Vercel 部署指南](./docs/deploy/VERCEL-部署指南.md)
- [评委版项目介绍](./docs/competition/问芽星图-项目作品介绍（评委版）.md)
- [评委浏览顺序介绍](./docs/competition/评委浏览顺序介绍.md)

## 🛠 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI**: 智谱GLM API
- **部署**: Vercel

## 📝 License

MIT License

---

**让学习如星辰般闪耀** ✨
