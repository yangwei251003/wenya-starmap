# 问芽星图 - Netlify部署指南

## 部署前准备

### 1. 确保项目构建成功

```bash
npm run build
```

如果构建成功，你会看到类似以下的输出：
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

### 2. 环境变量配置

在部署到Netlify之前，需要配置以下环境变量：

- `GLM_API_KEY`: 智谱GLM API密钥（必需）
- `NEXT_PUBLIC_API_URL`: API基础URL（可选，默认为 http://localhost:3000/api）

## Netlify部署步骤

### 方法一：通过Netlify CLI部署（推荐）

#### 1. 安装Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. 登录Netlify

```bash
netlify login
```

这会打开浏览器，让你授权Netlify CLI访问你的账户。

#### 3. 初始化Netlify站点

```bash
netlify init
```

按照提示操作：
- 选择 "Create & configure a new site"
- 选择你的团队
- 输入站点名称（可选）
- 构建命令：`npm run build`
- 发布目录：`.next`

#### 4. 配置环境变量

```bash
netlify env:set GLM_API_KEY "your-api-key-here"
```

#### 5. 部署

```bash
netlify deploy --prod
```

### 方法二：通过Netlify Web界面部署

#### 1. 推送代码到Git仓库

首先，确保你的代码已经推送到GitHub、GitLab或Bitbucket：

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

#### 2. 在Netlify创建新站点

1. 访问 [Netlify](https://app.netlify.com/)
2. 点击 "Add new site" > "Import an existing project"
3. 选择你的Git提供商（GitHub/GitLab/Bitbucket）
4. 授权Netlify访问你的仓库
5. 选择你的项目仓库

#### 3. 配置构建设置

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18

#### 4. 配置环境变量

在 "Site settings" > "Environment variables" 中添加：

- `GLM_API_KEY`: 你的智谱GLM API密钥
- `NEXT_PUBLIC_API_URL`: （可选）你的API URL

#### 5. 部署

点击 "Deploy site" 按钮开始部署。

## 部署后验证

### 1. 检查站点状态

部署完成后，Netlify会提供一个URL（例如：`https://your-site-name.netlify.app`）

### 2. 测试功能

访问你的站点并测试以下功能：
- ✅ 首页加载正常
- ✅ 导航到各个页面
- ✅ 仪表板显示正常
- ✅ 练习系统工作正常
- ✅ 进度追踪功能正常

### 3. 检查控制台错误

打开浏览器开发者工具，检查是否有JavaScript错误或网络请求失败。

## 自定义域名（可选）

### 1. 在Netlify添加自定义域名

1. 进入 "Site settings" > "Domain management"
2. 点击 "Add custom domain"
3. 输入你的域名
4. 按照提示配置DNS记录

### 2. 配置DNS

在你的域名提供商处添加以下DNS记录：

```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

### 3. 启用HTTPS

Netlify会自动为你的自定义域名配置Let's Encrypt SSL证书。

## 持续部署

一旦配置完成，每次你推送代码到主分支，Netlify都会自动构建和部署你的站点。

### 查看部署日志

1. 进入Netlify控制台
2. 选择你的站点
3. 点击 "Deploys" 标签
4. 查看每次部署的详细日志

## 性能优化建议

### 1. 启用Netlify插件

在 `netlify.toml` 中已经配置了 `@netlify/plugin-nextjs` 插件，它会自动优化Next.js应用。

### 2. 配置缓存

静态资源已经配置了适当的缓存头部（在 `netlify.toml` 中）。

### 3. 启用Netlify Analytics（可选）

在Netlify控制台中启用Analytics来监控站点性能和访问情况。

## 故障排除

### 构建失败

如果构建失败，检查：
1. 构建日志中的错误信息
2. 确保所有依赖都在 `package.json` 中
3. 确保Node版本正确（18或更高）

### 环境变量问题

如果功能不正常，检查：
1. 环境变量是否正确配置
2. 环境变量名称是否正确（区分大小写）
3. 重新部署以应用环境变量更改

### 页面404错误

确保 `netlify.toml` 中的重定向规则正确配置。

## 监控和维护

### 1. 设置部署通知

在 "Site settings" > "Build & deploy" > "Deploy notifications" 中配置：
- 部署成功通知
- 部署失败通知
- 通过Email、Slack等接收通知

### 2. 定期检查

- 检查Netlify控制台的部署状态
- 监控站点性能
- 查看错误日志

### 3. 更新依赖

定期更新项目依赖以获得安全补丁和性能改进：

```bash
npm update
npm audit fix
```

## 回滚部署

如果新部署出现问题，可以快速回滚：

1. 进入 "Deploys" 标签
2. 找到之前的成功部署
3. 点击 "Publish deploy" 按钮

## 支持

如果遇到问题：
- 查看 [Netlify文档](https://docs.netlify.com/)
- 查看 [Next.js部署文档](https://nextjs.org/docs/deployment)
- 联系技术支持

## 成本

Netlify提供免费套餐，包括：
- 100GB带宽/月
- 300分钟构建时间/月
- 自动HTTPS
- 持续部署

对于大多数个人项目和小型应用，免费套餐已经足够。

---

祝部署顺利！🚀
