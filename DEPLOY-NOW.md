# 🚀 立即部署 - 详细步骤

## 方法一：Netlify CLI 部署（最快 - 5分钟）

### 步骤 1: 登录 Netlify

在终端中运行：
```bash
npx netlify-cli login
```

这会打开浏览器，点击"Authorize"授权。授权成功后，终端会显示"You are now logged in"。

### 步骤 2: 初始化站点

```bash
npx netlify-cli init
```

按照提示选择：
1. **What would you like to do?** 
   → 选择 `Create & configure a new site`

2. **Team:** 
   → 选择你的团队（通常是你的用户名）

3. **Site name (optional):** 
   → 输入站点名称，例如：`wenya-starmap` 或直接回车使用随机名称

4. **Your build command:**
   → 输入：`npm run build`

5. **Directory to deploy:**
   → 输入：`.next`

### 步骤 3: 配置环境变量（重要！）

```bash
npx netlify-cli env:set GLM_API_KEY "你的智谱GLM_API密钥"
```

如果你还没有GLM API密钥，可以：
1. 访问 https://open.bigmodel.cn/
2. 注册并获取API密钥
3. 然后运行上面的命令

### 步骤 4: 部署到生产环境

```bash
npx netlify-cli deploy --prod
```

等待部署完成（通常需要1-2分钟）。

### 步骤 5: 获取网站链接

部署成功后，终端会显示：
```
✔ Deploy is live!
Website URL: https://your-site-name.netlify.app
```

复制这个URL，在浏览器中打开即可访问你的网站！

---

## 方法二：通过 Netlify 网页界面（更直观）

### 步骤 1: 推送代码到 GitHub

如果你还没有GitHub仓库：

```bash
# 1. 在 GitHub 上创建新仓库（不要初始化README）
# 2. 在终端运行：

git remote add origin https://github.com/你的用户名/wenya-starmap.git
git branch -M main
git push -u origin main
```

### 步骤 2: 在 Netlify 导入项目

1. 访问 https://app.netlify.com/
2. 点击 **"Add new site"** → **"Import an existing project"**
3. 选择 **GitHub** 并授权
4. 选择你的 `wenya-starmap` 仓库
5. 构建设置会自动从 `netlify.toml` 读取，确认即可
6. 点击 **"Deploy site"**

### 步骤 3: 配置环境变量

1. 在 Netlify 控制台，进入你的站点
2. 点击 **"Site settings"** → **"Environment variables"**
3. 点击 **"Add a variable"**
4. 添加：
   - Key: `GLM_API_KEY`
   - Value: 你的智谱GLM API密钥
5. 点击 **"Save"**

### 步骤 4: 重新部署

1. 进入 **"Deploys"** 标签
2. 点击 **"Trigger deploy"** → **"Deploy site"**
3. 等待部署完成

### 步骤 5: 访问网站

部署成功后，你会看到网站URL，格式为：
```
https://你的站点名.netlify.app
```

---

## 方法三：拖拽部署（最简单 - 无需Git）

### 步骤 1: 构建项目

在终端运行：
```bash
npm run build
```

### 步骤 2: 访问 Netlify Drop

1. 打开浏览器访问：https://app.netlify.com/drop
2. 将 `.next` 文件夹拖拽到页面中
3. 等待上传和部署完成

### 步骤 3: 配置环境变量

1. 部署完成后，点击站点进入控制台
2. 按照方法二的步骤3配置环境变量
3. 重新部署

---

## ⚠️ 重要提示

### 必需的环境变量

- `GLM_API_KEY`: 智谱GLM API密钥（必需）

### 获取 GLM API 密钥

1. 访问：https://open.bigmodel.cn/
2. 注册/登录账号
3. 进入控制台
4. 创建API密钥
5. 复制密钥并保存

### 如果没有 API 密钥

网站可以部署，但AI功能将无法使用。你可以：
1. 先部署网站查看界面
2. 后续获取API密钥后再配置

---

## 🎉 部署成功后

### 验证功能

访问你的网站并测试：
- ✅ 首页加载
- ✅ 导航到各个页面
- ✅ 仪表板显示
- ✅ 练习系统
- ✅ 进度追踪

### 查看部署状态

在 Netlify 控制台可以查看：
- 部署历史
- 构建日志
- 访问统计
- 性能指标

### 自定义域名（可选）

1. 在 Netlify 控制台
2. **"Domain settings"** → **"Add custom domain"**
3. 按照提示配置DNS

---

## 🆘 遇到问题？

### 构建失败

检查构建日志，确保本地 `npm run build` 能成功运行。

### 页面空白

1. 检查浏览器控制台是否有错误
2. 确认环境变量配置正确
3. 查看 Netlify 函数日志

### AI功能不工作

1. 确认 `GLM_API_KEY` 已配置
2. 检查API密钥是否有效
3. 查看网络请求是否成功

---

## 📞 需要帮助？

如果遇到任何问题，请：
1. 查看 Netlify 部署日志
2. 检查浏览器控制台错误
3. 参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 完整文档

---

**祝部署顺利！🚀**
