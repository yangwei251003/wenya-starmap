# 🚀 Netlify部署指南 - 问芽星图

## 📋 部署前检查清单

### ✅ 确保本地运行正常

1. **测试本地开发服务器**
```bash
npm run dev
```
访问 http://localhost:3001 确保：
- ✅ 首页正常加载
- ✅ 注册功能正常（访问 /auth/register）
- ✅ API测试页面正常（访问 /test-api）

2. **测试生产构建**
```bash
npm run build
npm start
```

### ✅ 环境变量准备

如果你有智谱GLM API密钥，准备好以下环境变量：
- `GLM_API_KEY`: 你的智谱GLM API密钥

## 🌐 方法一：通过Netlify CLI部署（推荐）

### 步骤1：安装并登录Netlify CLI

```bash
# 安装Netlify CLI（如果还没安装）
npm install -g netlify-cli

# 登录Netlify
netlify login
```

### 步骤2：初始化站点

```bash
netlify init
```

选择：
- **What would you like to do?** → `Create & configure a new site`
- **Team:** → 选择你的团队
- **Site name:** → 输入 `wenya-starmap` 或其他名称
- **Build command:** → `npm run build`
- **Directory to deploy:** → `.next`

### 步骤3：配置环境变量（可选）

如果你有GLM API密钥：
```bash
netlify env:set GLM_API_KEY "你的API密钥"
```

### 步骤4：部署

```bash
# 预览部署
netlify deploy

# 生产部署
netlify deploy --prod
```

## 🌐 方法二：通过Netlify网页界面部署

### 步骤1：推送代码到GitHub

```bash
# 如果还没有远程仓库，先在GitHub创建一个
git remote add origin https://github.com/你的用户名/wenya-starmap.git
git branch -M main
git push -u origin main
```

### 步骤2：在Netlify导入项目

1. 访问 https://app.netlify.com/
2. 点击 **"Add new site"** → **"Import an existing project"**
3. 选择 **GitHub** 并授权
4. 选择你的 `wenya-starmap` 仓库
5. 构建设置：
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
6. 点击 **"Deploy site"**

### 步骤3：配置环境变量

1. 在Netlify控制台，进入你的站点
2. 点击 **"Site settings"** → **"Environment variables"**
3. 添加环境变量（如果需要）：
   - Key: `GLM_API_KEY`
   - Value: 你的智谱GLM API密钥

## 🔧 部署后验证

### 1. 检查部署状态

部署完成后，Netlify会提供一个URL，例如：
```
https://wenya-starmap-abc123.netlify.app
```

### 2. 功能测试

访问你的网站并测试：

**✅ 基础功能**
- [ ] 首页加载正常
- [ ] 导航菜单工作
- [ ] 页面路由正常

**✅ 注册功能**
- [ ] 访问 `/auth/register`
- [ ] 填写表单并提交
- [ ] 检查是否显示成功消息

**✅ API功能**
- [ ] 访问 `/test-api`
- [ ] 点击"测试基础API"按钮
- [ ] 点击"测试注册API"按钮
- [ ] 检查返回结果

**✅ 其他页面**
- [ ] `/dashboard` - 学习仪表板
- [ ] `/quiz` - 练习中心
- [ ] `/progress-demo` - 进度演示

### 3. 检查控制台错误

打开浏览器开发者工具（F12），检查：
- Console标签：是否有JavaScript错误
- Network标签：API请求是否成功

## 🐛 常见问题解决

### 问题1：页面404错误

**原因：** 路由配置问题
**解决：** 检查 `netlify.toml` 中的重定向规则

### 问题2：API请求失败

**原因：** API路由未正确部署
**解决：** 
1. 确保使用了 `@netlify/plugin-nextjs` 插件
2. 检查 `netlify.toml` 配置
3. 重新部署

### 问题3：构建失败

**原因：** 依赖或配置问题
**解决：**
1. 检查 `package.json` 中的依赖
2. 确保本地 `npm run build` 成功
3. 查看Netlify构建日志

### 问题4：环境变量不生效

**原因：** 环境变量配置错误
**解决：**
1. 检查变量名是否正确
2. 重新部署站点
3. 确保变量值没有多余空格

## 📊 部署后优化

### 1. 自定义域名

1. 在Netlify控制台：**Domain settings** → **Add custom domain**
2. 配置DNS记录
3. 启用HTTPS（自动）

### 2. 性能监控

1. 启用Netlify Analytics
2. 查看Core Web Vitals
3. 监控API响应时间

### 3. 持续部署

配置完成后，每次推送到main分支都会自动部署。

## 🎉 部署成功！

如果所有测试都通过，恭喜你！问芽星图已经成功部署到Netlify。

**你的网站链接：** `https://你的站点名.netlify.app`

### 下一步

1. 分享你的网站链接
2. 收集用户反馈
3. 继续开发新功能

## 📞 需要帮助？

如果遇到问题：
1. 查看Netlify部署日志
2. 检查浏览器控制台错误
3. 参考 [Netlify文档](https://docs.netlify.com/)

---

**祝部署顺利！🚀**