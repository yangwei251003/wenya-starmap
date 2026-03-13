# 🚀 Netlify 部署完整指南

## 📋 部署前准备

### 1. 确保项目可以正常构建

```bash
# 安装依赖
npm install

# 测试构建
npm run build

# 如果构建成功，你会看到 .next 文件夹
```

### 2. 检查必要文件

确保以下文件存在：
- ✅ `netlify.toml` - Netlify配置文件
- ✅ `next.config.js` - Next.js配置
- ✅ `package.json` - 项目依赖
- ✅ `.gitignore` - Git忽略文件

## 🌐 方法一：通过Netlify网站部署（推荐）

### 步骤1: 注册Netlify账号

1. 访问 [https://www.netlify.com](https://www.netlify.com)
2. 点击 "Sign up" 注册账号
3. 可以使用GitHub、GitLab或Email注册

### 步骤2: 准备项目文件

#### 选项A: 使用Git（推荐）

1. **初始化Git仓库**（如果还没有）
```bash
git init
git add .
git commit -m "Initial commit"
```

2. **推送到GitHub**
```bash
# 在GitHub创建新仓库后
git remote add origin https://github.com/你的用户名/wenya-starmap.git
git branch -M main
git push -u origin main
```

3. **在Netlify导入项目**
   - 登录Netlify
   - 点击 "Add new site" → "Import an existing project"
   - 选择 "GitHub"
   - 授权Netlify访问你的GitHub
   - 选择 `wenya-starmap` 仓库
   - 配置构建设置（通常会自动检测）:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - 点击 "Deploy site"

#### 选项B: 手动上传（快速测试）

1. **构建项目**
```bash
npm run build
```

2. **在Netlify手动部署**
   - 登录Netlify
   - 点击 "Add new site" → "Deploy manually"
   - 将整个项目文件夹拖拽到上传区域
   - 等待部署完成

### 步骤3: 配置环境变量（可选）

如果你的项目需要环境变量：

1. 在Netlify项目页面，点击 "Site settings"
2. 点击 "Environment variables"
3. 添加以下变量（如果需要）:
   ```
   NEXT_PUBLIC_SUPABASE_URL=你的Supabase URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase密钥
   OPENAI_API_KEY=你的OpenAI密钥（如果使用AI功能）
   ```

### 步骤4: 自定义域名（可选）

1. 在项目页面，点击 "Domain settings"
2. 点击 "Add custom domain"
3. 输入你的域名（如 `wenya.com`）
4. 按照提示配置DNS记录

## 💻 方法二：使用Netlify CLI部署

### 步骤1: 安装Netlify CLI

```bash
npm install -g netlify-cli
```

### 步骤2: 登录Netlify

```bash
netlify login
```

这会打开浏览器，让你授权CLI访问你的Netlify账号。

### 步骤3: 初始化项目

```bash
# 在项目根目录执行
netlify init
```

按照提示选择：
1. "Create & configure a new site"
2. 选择你的团队
3. 输入网站名称（或留空使用随机名称）
4. Build command: `npm run build`
5. Publish directory: `.next`

### 步骤4: 部署

```bash
# 预览部署（测试用）
netlify deploy

# 生产部署
netlify deploy --prod
```

或者使用package.json中的脚本：

```bash
# 预览部署
npm run deploy:preview

# 生产部署
npm run deploy
```

## 📦 方法三：创建部署包（离线部署）

### 步骤1: 构建项目

```bash
npm run build
```

### 步骤2: 创建部署包

创建一个包含以下文件的文件夹：

```
wenya-starmap-deploy/
├── .next/                 # 构建输出
├── public/                # 静态资源
├── node_modules/          # 依赖（可选，Netlify会自动安装）
├── package.json           # 项目配置
├── package-lock.json      # 锁定依赖版本
├── next.config.js         # Next.js配置
├── netlify.toml           # Netlify配置
└── .env.local            # 环境变量（如果有）
```

### 步骤3: 压缩文件夹

```bash
# Windows PowerShell
Compress-Archive -Path wenya-starmap-deploy -DestinationPath wenya-starmap-deploy.zip

# 或者使用7-Zip、WinRAR等工具
```

### 步骤4: 上传到Netlify

1. 登录 [Netlify](https://app.netlify.com)
2. 点击 "Add new site" → "Deploy manually"
3. 拖拽 `wenya-starmap-deploy.zip` 到上传区域
4. 等待部署完成

## 🔧 部署配置详解

### netlify.toml 配置说明

```toml
[build]
  command = "npm run build"        # 构建命令
  publish = ".next"                # 发布目录

[[plugins]]
  package = "@netlify/plugin-nextjs"  # Next.js插件

[build.environment]
  NODE_VERSION = "18"              # Node.js版本
  NEXT_TELEMETRY_DISABLED = "1"    # 禁用遥测

[functions]
  node_bundler = "esbuild"         # 函数打包工具

# API路由重定向
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/___netlify-handler"
  status = 200

# SPA路由支持
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### next.config.js 配置说明

```javascript
const nextConfig = {
  images: {
    unoptimized: true,  // 禁用图片优化（Netlify免费版限制）
  },
  // 不要使用 output: 'export'，因为我们需要API路由
}
```

## 🐛 常见问题解决

### 问题1: 构建失败 - "Module not found"

**解决方案**:
```bash
# 删除node_modules和锁文件
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 再次构建
npm run build
```

### 问题2: API路由404错误

**原因**: 使用了 `output: 'export'` 配置

**解决方案**:
1. 打开 `next.config.js`
2. 确保没有 `output: 'export'` 这一行
3. 或者注释掉这一行
4. 重新部署

### 问题3: 页面刷新后404

**原因**: SPA路由配置问题

**解决方案**:
确保 `netlify.toml` 中有以下重定向规则：
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 问题4: 环境变量不生效

**解决方案**:
1. 在Netlify控制台添加环境变量
2. 确保变量名以 `NEXT_PUBLIC_` 开头（客户端变量）
3. 重新部署项目

### 问题5: 构建超时

**解决方案**:
1. 优化依赖，移除不必要的包
2. 使用 `.npmrc` 配置更快的镜像：
```
registry=https://registry.npmmirror.com
```

### 问题6: 图片不显示

**解决方案**:
确保 `next.config.js` 中设置了：
```javascript
images: {
  unoptimized: true,
}
```

## 📊 部署后检查清单

部署完成后，检查以下功能：

- [ ] 首页正常加载
- [ ] 注册/登录功能正常
- [ ] Dashboard显示正常
- [ ] 学习功能可用
- [ ] API路由正常工作
- [ ] 数据保存到localStorage
- [ ] 页面刷新不会404
- [ ] 所有按钮都有响应
- [ ] 移动端显示正常

## 🔄 持续部署（CI/CD）

### 使用GitHub自动部署

1. **连接GitHub仓库**（如果还没有）
   - 在Netlify项目设置中连接GitHub

2. **配置自动部署**
   - 每次推送到 `main` 分支自动部署
   - Pull Request会创建预览部署

3. **部署通知**
   - 在项目设置中配置Slack/Email通知

### 部署流程

```bash
# 开发
git checkout -b feature/new-feature
# 修改代码...
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# 创建Pull Request查看预览部署

# 合并到main分支后自动部署到生产环境
```

## 🎯 性能优化建议

### 1. 启用缓存

在 `netlify.toml` 中已配置：
```toml
[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 2. 压缩资源

Netlify自动启用Gzip/Brotli压缩

### 3. CDN加速

Netlify自动使用全球CDN

### 4. 图片优化

考虑使用外部图片CDN服务（如Cloudinary）

## 📱 移动端访问

部署后，你可以通过以下方式访问：

1. **Netlify提供的域名**
   - 格式: `https://你的网站名.netlify.app`
   - 例如: `https://wenya-starmap.netlify.app`

2. **自定义域名**（如果配置了）
   - 例如: `https://wenya.com`

3. **二维码分享**
   - 在Netlify控制台可以生成二维码
   - 方便移动设备扫码访问

## 🔐 安全设置

### 1. 环境变量保护

- 敏感信息（API密钥）只在Netlify控制台配置
- 不要提交到Git仓库

### 2. HTTPS

- Netlify自动提供免费SSL证书
- 强制HTTPS重定向

### 3. 访问控制

- 可以设置密码保护（付费功能）
- 或使用Netlify Identity进行用户认证

## 📞 获取帮助

如果遇到问题：

1. **查看构建日志**
   - 在Netlify控制台查看详细的构建日志

2. **Netlify文档**
   - [https://docs.netlify.com](https://docs.netlify.com)

3. **Netlify社区**
   - [https://answers.netlify.com](https://answers.netlify.com)

4. **Next.js文档**
   - [https://nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

## 🎉 部署成功！

部署完成后，你的网站将在全球CDN上运行，具有：
- ✅ 自动HTTPS
- ✅ 全球CDN加速
- ✅ 自动构建和部署
- ✅ 免费托管
- ✅ 无限带宽（免费版有限制）

访问你的网站：`https://你的网站名.netlify.app`

---

**祝你部署顺利！🚀**