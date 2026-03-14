# 🌟 问芽星图 - WenYa StarMap

AI驱动的智慧英语学习平台，让学习像星辰般闪耀。

## ✨ 功能特色

- 🤖 **AI智能对话** - 与AI导师实时互动练习英语
- 📚 **个性化学习路径** - 根据水平定制学习计划
- 🎯 **互动练习** - 听说读写全方位训练
- ⭐ **成就系统** - 学习成果可视化，点亮专属星图
- 📊 **进度追踪** - 实时监控学习进度

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
- 主页: https://wenya-starmap-e6f3.vercel.app/
- 快速体验: [http://localhost:3001/demo](https://wenya-starmap-e6f3.vercel.app/)

## 📋 环境变量配置

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `GLM_API_KEY` | ✅ | 智谱GLM API密钥 |
| `JWT_SECRET` | ✅ | JWT认证密钥 |
| `NEXT_PUBLIC_APP_URL` | ❌ | 应用URL |

### 获取GLM API Key
1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
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

详细的API文档请查看 [API-CONFIGURATION.md](./API-CONFIGURATION.md)

### 主要接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/ai/chat` - AI对话

## 🌐 部署

### Netlify部署
```bash
# 安装Netlify CLI
npm install -g netlify-cli

# 登录并部署
netlify login
netlify deploy --prod
```

详细部署指南请查看 [NETLIFY-DEPLOY-GUIDE.md](./NETLIFY-DEPLOY-GUIDE.md)

## 🎮 演示账号

无需注册，直接体验：
- 访问 `/demo` 页面
- 选择任意角色即可开始

## 📄 文档

- [API配置文档](./API-CONFIGURATION.md)
- [部署指南](./NETLIFY-DEPLOY-GUIDE.md)
- [快速部署](./QUICK-DEPLOY.md)

## 🛠 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI**: 智谱GLM API
- **部署**: Netlify

## 📝 License

MIT License

---

**让学习如星辰般闪耀** ✨
