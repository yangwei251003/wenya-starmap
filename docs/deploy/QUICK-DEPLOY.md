# 🚀 问芽星图 - 快速部署指南

## ✅ 部署前确认

你的项目已经准备就绪！所有配置文件都已正确设置：
- ✅ `netlify.toml` - Netlify配置
- ✅ `next.config.js` - Next.js配置  
- ✅ API路由正常工作
- ✅ 构建测试通过
- ✅ 演示功能完整

## 🌐 方法一：Netlify CLI部署（推荐）

### 1. 安装Netlify CLI
```bash
npm install -g netlify-cli
```

### 2. 登录Netlify
```bash
netlify login
```
这会打开浏览器，用你的GitHub/GitLab/Email账号登录Netlify。

### 3. 在项目根目录初始化
```bash
netlify init
```
选择：
- **What would you like to do?** → `Create & configure a new site`
- **Team:** → 选择你的团队（通常是你的用户名）
- **Site name:** → 输入 `wenya-starmap`（或其他你喜欢的名称）
- **Build command:** → `npm run build`
- **Directory to deploy:** → `.next`

### 4. 部署
```bash
# 预览部署（测试用）
netlify deploy

# 生产部署
netlify deploy --prod
```

### 5. 获取网站链接
部署成功后，你会看到类似这样的输出：
```
✔ Deploy is live!

Live Draft URL: https://wenya-starmap-abc123.netlify.app
```

## 🌐 方法二：GitHub + Netlify网页部署

### 1. 推送到GitHub
如果还没有GitHub仓库：
```bash
# 在GitHub创建新仓库，然后：
git remote add origin https://github.com/你的用户名/wenya-starmap.git
git branch -M main
git add .
git commit -m "Ready for deployment"
git push -u origin main
```

### 2. 在Netlify导入
1. 访问 https://app.netlify.com/
2. 点击 **"Add new site"** → **"Import an existing project"**
3. 选择 **GitHub** 并授权
4. 选择你的 `wenya-starmap` 仓库
5. 构建设置会自动检测，确认：
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
6. 点击 **"Deploy site"**

## 🎯 部署后测试

访问你的网站URL，测试以下功能：

### 基础功能测试
- [ ] 首页加载：`https://你的网站.netlify.app`
- [ ] 演示页面：`/demo` - 点击三个角色卡片
- [ ] 登录页面：`/auth/login` - 有演示账号按钮
- [ ] 注册页面：`/auth/register` - 表单提交
- [ ] API测试：`/test-api` - 点击测试按钮

### 演示账号测试
在演示页面点击任一角色卡片，应该能：
1. 自动登录
2. 跳转到仪表板
3. 显示对应等级的学习内容

## 🔧 如果遇到问题

### 构建失败
1. 确保本地 `npm run build` 成功
2. 检查Netlify构建日志
3. 确认Node.js版本（项目使用18+）

### 页面404
1. 检查 `netlify.toml` 文件存在
2. 确认重定向规则正确

### API不工作
1. 确认使用了 `@netlify/plugin-nextjs` 插件
2. 检查API路由文件在 `app/api/` 目录

## 🎉 成功部署！

如果所有测试通过，恭喜！你的问芽星图已经成功上线。

**你可以分享这个链接给朋友体验：**
`https://你的网站名.netlify.app/demo`

## 📱 预览链接示例

部署成功后，你的网站将有这些页面：
- 首页：`https://wenya-starmap.netlify.app`
- 快速体验：`https://wenya-starmap.netlify.app/demo`
- 学习仪表板：`https://wenya-starmap.netlify.app/dashboard`
- 练习中心：`https://wenya-starmap.netlify.app/quiz`

---

**需要帮助？** 如果遇到任何问题，请查看详细的 `NETLIFY-DEPLOY-GUIDE.md` 文件。