# 快速部署指南 🚀

## 方法一：使用PowerShell脚本（推荐）

```powershell
.\deploy.ps1
```

按照提示操作即可完成部署。

## 方法二：使用npm命令

### 首次部署

1. **登录Netlify**
```bash
npx netlify-cli login
```

2. **初始化站点**
```bash
npx netlify-cli init
```

按照提示选择：
- Create & configure a new site
- 选择你的团队
- 输入站点名称（可选）
- Build command: `npm run build`
- Publish directory: `.next`

3. **配置环境变量**
```bash
npx netlify-cli env:set GLM_API_KEY "your-glm-api-key-here"
```

4. **部署到生产环境**
```bash
npm run deploy
```

### 后续部署

直接运行：
```bash
npm run deploy
```

## 方法三：通过GitHub自动部署

1. **创建GitHub仓库并推送代码**
```bash
# 如果还没有远程仓库
git remote add origin https://github.com/your-username/wenya-starmap.git
git branch -M main
git push -u origin main
```

2. **在Netlify连接GitHub仓库**
- 访问 https://app.netlify.com/
- 点击 "Add new site" > "Import an existing project"
- 选择GitHub并授权
- 选择你的仓库
- 配置构建设置（已在netlify.toml中配置）
- 添加环境变量 `GLM_API_KEY`
- 点击 "Deploy site"

3. **自动部署**
之后每次推送到main分支，Netlify会自动构建和部署。

## 验证部署

部署完成后，访问Netlify提供的URL（例如：`https://your-site.netlify.app`）

检查以下功能：
- ✅ 首页加载
- ✅ 导航功能
- ✅ 仪表板
- ✅ 练习系统
- ✅ 进度追踪

## 常见问题

### Q: 构建失败怎么办？
A: 检查构建日志，确保本地 `npm run build` 能成功运行。

### Q: 如何更新环境变量？
A: 使用命令：
```bash
npx netlify-cli env:set VARIABLE_NAME "value"
```
然后重新部署。

### Q: 如何回滚到之前的版本？
A: 在Netlify控制台的"Deploys"标签中，找到之前的部署，点击"Publish deploy"。

### Q: 如何查看部署日志？
A: 在Netlify控制台的"Deploys"标签中，点击具体的部署查看详细日志。

## 需要帮助？

查看完整的部署文档：[DEPLOYMENT.md](./DEPLOYMENT.md)
