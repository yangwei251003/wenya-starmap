# 🔧 问芽星图 - API接口配置文档

## 📋 目录

1. [环境变量配置](#环境变量配置)
2. [后端API接口](#后端api接口)
3. [AI接口对接](#ai接口对接)
4. [数据库配置](#数据库配置)
5. [部署配置](#部署配置)

---

## 🔐 环境变量配置

### 创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件，配置以下环境变量：

```env
# ========== AI服务配置 ==========
# 智谱GLM API（推荐）
GLM_API_KEY=your_glm_api_key_here
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions

# OpenAI API（可选）
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_URL=https://api.openai.com/v1/chat/completions

# ========== 数据库配置（可选） ==========
# MongoDB
MONGODB_URI=mongodb://localhost:27017/wenya-starmap

# PostgreSQL（如果使用）
DATABASE_URL=postgresql://user:password@localhost:5432/wenya_starmap

# ========== 认证配置 ==========
JWT_SECRET=your_jwt_secret_key_here_at_least_32_characters
JWT_EXPIRES_IN=7d

# ========== 应用配置 ==========
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
```

---

## 🌐 后端API接口

### 1. 认证接口

#### 1.1 用户注册
```
POST /api/auth/register
```

**请求体：**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "level": "beginner" | "intermediate" | "advanced"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "level": "string"
    },
    "token": "string"
  }
}
```

#### 1.2 用户登录
```
POST /api/auth/login
```

**请求体：**
```json
{
  "email": "string",
  "password": "string"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "level": "string"
    },
    "token": "string"
  }
}
```

### 2. 学习路径接口

#### 2.1 获取学习路径
```
GET /api/learning-path?userId={userId}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "currentLevel": "string",
    "targetLevel": "string",
    "progress": 0.75,
    "completedLessons": ["lesson1", "lesson2"],
    "recommendedNext": [
      {
        "id": "string",
        "title": "string",
        "type": "vocabulary" | "grammar" | "listening" | "speaking",
        "difficulty": "easy" | "medium" | "hard",
        "estimatedTime": 15
      }
    ]
  }
}
```

#### 2.2 更新学习进度
```
POST /api/learning-path/progress
```

**请求体：**
```json
{
  "userId": "string",
  "lessonId": "string",
  "score": 85,
  "timeSpent": 600
}
```

### 3. 练习接口

#### 3.1 获取练习题
```
GET /api/exercises?type={type}&level={level}&count={count}
```

**参数：**
- `type`: `vocabulary` | `grammar` | `listening` | `speaking` | `reading` | `writing`
- `level`: `beginner` | `intermediate` | `advanced`
- `count`: 数量（默认5）

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "type": "vocabulary",
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "string",
      "difficulty": "medium"
    }
  ]
}
```

#### 3.2 提交练习答案
```
POST /api/exercises/submit
```

**请求体：**
```json
{
  "userId": "string",
  "exerciseId": "string",
  "answer": "string",
  "timeSpent": 30
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "isCorrect": true,
    "score": 10,
    "feedback": "string",
    "correctAnswer": "string",
    "explanation": "string"
  }
}
```

### 4. 成就接口

#### 4.1 获取用户成就
```
GET /api/achievements?userId={userId}
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "icon": "string",
      "unlockedAt": "2024-01-01T00:00:00Z",
      "category": "learning" | "streak" | "milestone"
    }
  ]
}
```

---

## 🤖 AI接口对接

### 1. 智谱GLM API配置

#### 获取API Key
1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
2. 注册/登录账号
3. 进入控制台 → API Keys
4. 创建新的API Key
5. 复制Key到 `.env.local` 的 `GLM_API_KEY`

#### API调用示例

**文件位置：** `lib/ai-tutor.ts`

```typescript
// AI对话接口
async function chatWithAI(messages: Message[]): Promise<string> {
  const response = await fetch(process.env.GLM_API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GLM_API_KEY}`
    },
    body: JSON.stringify({
      model: 'glm-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    })
  })
  
  const data = await response.json()
  return data.choices[0].message.content
}
```

#### 支持的模型
| 模型 | 说明 | 推荐场景 |
|------|------|----------|
| glm-4 | 最新版本，能力最强 | 复杂对话、写作 |
| glm-4-flash | 快速响应版本 | 实时对话 |
| glm-3-turbo | 性价比高 | 日常练习 |

### 2. AI功能接口

#### 2.1 AI对话练习
```
POST /api/ai/chat
```

**请求体：**
```json
{
  "userId": "string",
  "message": "string",
  "context": "english_learning",
  "level": "intermediate"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "reply": "string",
    "corrections": [
      {
        "original": "string",
        "corrected": "string",
        "explanation": "string"
      }
    ],
    "suggestions": ["string"]
  }
}
```

#### 2.2 AI作文批改
```
POST /api/ai/writing-review
```

**请求体：**
```json
{
  "userId": "string",
  "content": "string",
  "topic": "string",
  "level": "intermediate"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "feedback": {
      "grammar": ["string"],
      "vocabulary": ["string"],
      "structure": ["string"],
      "content": ["string"]
    },
    "improvedVersion": "string",
    "suggestions": ["string"]
  }
}
```

#### 2.3 AI发音评估
```
POST /api/ai/pronunciation
```

**请求体：**
```json
{
  "userId": "string",
  "audioUrl": "string",
  "targetText": "string"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "score": 90,
    "accuracy": 0.92,
    "fluency": 0.88,
    "feedback": "string",
    "problemWords": [
      {
        "word": "string",
        "issue": "string",
        "suggestion": "string"
      }
    ]
  }
}
```

### 3. 创建AI API路由

在 `app/api/ai/chat/route.ts` 创建：

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, level, context } = await request.json()
    
    const systemPrompt = `你是一位专业的英语教师，正在帮助一位${level}水平的学生学习英语。
    请用中英双语回复，纠正学生的错误，并给出学习建议。
    保持友好和鼓励的态度。`
    
    const response = await fetch(process.env.GLM_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GLM_API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      })
    })
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: {
        reply: data.choices[0].message.content
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'AI服务暂时不可用' },
      { status: 500 }
    )
  }
}
```

---

## 💾 数据库配置（可选）

### 当前状态
项目目前使用 **localStorage** 存储数据，适合演示和小规模使用。

### 生产环境推荐

#### MongoDB配置
```typescript
// lib/mongodb.ts
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI!
const client = new MongoClient(uri)

export async function connectDB() {
  await client.connect()
  return client.db('wenya-starmap')
}
```

#### 数据模型
```typescript
// 用户模型
interface User {
  _id: ObjectId
  username: string
  email: string
  passwordHash: string
  level: 'beginner' | 'intermediate' | 'advanced'
  createdAt: Date
  lastLoginAt: Date
}

// 学习记录模型
interface LearningRecord {
  _id: ObjectId
  userId: ObjectId
  lessonId: string
  score: number
  timeSpent: number
  completedAt: Date
}

// 成就模型
interface Achievement {
  _id: ObjectId
  userId: ObjectId
  achievementId: string
  unlockedAt: Date
}
```

---

## 🚀 部署配置

### Netlify部署

1. **环境变量设置**
   - 进入 Netlify 控制台
   - Site settings → Environment variables
   - 添加以下变量：
     - `GLM_API_KEY`
     - `JWT_SECRET`
     - `NEXT_PUBLIC_APP_URL`

2. **构建设置**
   - Build command: `npm run build`
   - Publish directory: `.next`

### Vercel部署

1. **环境变量设置**
   - 进入 Vercel 控制台
   - Settings → Environment Variables
   - 添加相同的环境变量

---

## ✅ 配置检查清单

### 必须配置
- [ ] 创建 `.env.local` 文件
- [ ] 配置 `GLM_API_KEY`（AI功能必需）
- [ ] 配置 `JWT_SECRET`（认证必需）

### 可选配置
- [ ] 配置数据库连接
- [ ] 配置 OpenAI API（备用）
- [ ] 配置自定义域名

### 测试步骤
1. 启动开发服务器：`npm run dev`
2. 访问 http://localhost:3001
3. 测试演示登录功能
4. 测试AI对话功能（需要配置API Key）

---

## 📞 常见问题

### Q: AI功能不工作？
A: 检查 `GLM_API_KEY` 是否正确配置，确保API余额充足。

### Q: 登录后数据丢失？
A: 当前使用localStorage，清除浏览器数据会丢失。生产环境建议配置数据库。

### Q: 部署后API不工作？
A: 确保在部署平台配置了所有必需的环境变量。

---

**文档版本：** 1.0  
**最后更新：** 2024年12月
