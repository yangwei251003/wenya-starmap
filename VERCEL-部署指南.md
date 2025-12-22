# 🚀 Vercel 部署指南（最简单）

## 为什么选择Vercel？

- ✅ Next.js官方推荐
- ✅ 完全免费
- ✅ 自动构建和部署
- ✅ 全球CDN
- ✅ 自动HTTPS
- ✅ 支持API路由
- ✅ 零配置

## 📋 部署步骤（5分钟）

### 步骤1: 推送到GitHub

```bash
# 在项目根目录执行

# 初始化Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Deploy to Vercel"

# 创建GitHub仓库后，添加远程地址
git remote add origin https://github.com/你的用户名/wenya-starmap.git

# 推送
git push -u origin main
```

### 步骤2: 导入到Vercel

1. **访问Vercel**
   - 打开 https://vercel.com
   - 点击 "Sign Up" 或 "Login"

2. **使用GitHub登录**
   - 选择 "Continue with GitHub"
   - 授权Vercel访问你的GitHub

3. **导入项目**
   - 点击 "Add New..." → "Project"
   - 在列表中找到 `wenya-starmap` 仓库
   - 点击 "Import"

4. **配置项目**（通常自动检测，无需修改）
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next
   - Install Command: `npm install`

5. **部署**
   - 点击 "Deploy"
   - 等待2-3分钟

### 步骤3: 访问网站

部署完成后，Vercel会给你一个URL：
```
https://wenya-starmap.vercel.app
```

或者你的自定义域名。

## 🎯 使用Vercel CLI（可选）

如果你想用命令行部署：

```bash
# 1. 安装Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署（预览）
vercel

# 4. 生产部署
vercel --prod
```

## 🔧 环境变量配置

如果需要配置环境变量：

1. 在Vercel项目页面
2. 点击 "Settings"
3. 点击 "Environment Variables"
4. 添加变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL=你的URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的密钥
   ```
5. 重新部署

## 🔄 自动部署

设置完成后：
- 每次推送到 `main` 分支 → 自动部署到生产环境
- 每次创建Pull Request → 自动创建预览部署

## 📱 自定义域名

1. 在Vercel项目页面
2. 点击 "Settings" → "Domains"
3. 添加你的域名
4. 按照提示配置DNS

## ✅ 部署检查清单

- [ ] 代码推送到GitHub
- [ ] Vercel账号已创建
- [ ] 项目已导入到Vercel
- [ ] 部署成功
- [ ] 网站可以访问
- [ ] 所有功能正常

## 🐛 常见问题

### Q: 构建失败
**A**: 查看Vercel的构建日志，通常是依赖问题
```bash
# 本地测试构建
npm run build
```

### Q: API路由404
**A**: Vercel自动支持Next.js API路由，无需配置

### Q: 环境变量不生效
**A**: 确保变量名以 `NEXT_PUBLIC_` 开头（客户端变量）

## 🎉 完成！

你的网站现在已经部署到Vercel，享受：
- 全球CDN加速
- 自动HTTPS
- 无限带宽
- 自动部署

---

**网站地址**: https://你的项目名.vercel.app