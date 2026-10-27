# ✅ Netlify 部署检查清单

## 📋 部署前检查

### 1. 代码检查
- [ ] 所有功能都已测试通过
- [ ] 没有控制台错误
- [ ] 没有TypeScript错误
- [ ] 所有按钮都有响应

### 2. 构建测试
```bash
# 清理旧的构建文件
rm -rf .next

# 安装依赖
npm install

# 测试构建
npm run build
```

- [ ] 构建成功完成
- [ ] 没有构建错误
- [ ] 没有警告（或警告可以忽略）

### 3. 本地测试
```bash
# 启动生产服务器
npm start
```

- [ ] 访问 http://localhost:3000
- [ ] 所有页面正常加载
- [ ] API路由正常工作
- [ ] 数据保存正常

### 4. 文件检查
- [ ] `netlify.toml` 存在且配置正确
- [ ] `next.config.js` 配置正确（没有 output: 'export'）
- [ ] `package.json` 包含正确的构建脚本
- [ ] `.gitignore` 包含必要的忽略规则

### 5. 环境变量准备
- [ ] 列出所有需要的环境变量
- [ ] 准备好Supabase配置（如果使用）
- [ ] 准备好OpenAI密钥（如果使用）

## 🚀 快速部署步骤

### 方法1: GitHub + Netlify（推荐）

#### 步骤1: 推送到GitHub
```bash
# 初始化Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Ready for Netlify deployment"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/wenya-starmap.git

# 推送
git push -u origin main
```

#### 步骤2: 在Netlify导入
1. 访问 https://app.netlify.com
2. 点击 "Add new site" → "Import an existing project"
3. 选择 "GitHub"
4. 选择你的仓库
5. 配置：
   - Build command: `npm run build`
   - Publish directory: `.next`
6. 点击 "Deploy site"

#### 步骤3: 等待部署
- [ ] 构建开始
- [ ] 构建完成
- [ ] 网站上线

### 方法2: Netlify CLI

```bash
# 安装CLI
npm install -g netlify-cli

# 登录
netlify login

# 初始化
netlify init

# 部署
netlify deploy --prod
```

### 方法3: 手动上传

```bash
# 构建项目
npm run build

# 在Netlify网站手动上传整个项目文件夹
```

## 🔍 部署后验证

### 1. 基本功能测试
访问你的Netlify网站：`https://你的网站名.netlify.app`

- [ ] 首页加载正常
- [ ] 样式显示正确
- [ ] 图片显示正常
- [ ] 字体加载正常

### 2. 用户流程测试
- [ ] 注册功能正常
- [ ] 登录功能正常
- [ ] Dashboard显示正常
- [ ] 学习功能可用

### 3. 核心功能测试
- [ ] 传统学习模式正常
- [ ] 智能学习(FSRS)正常加载
- [ ] 每日挑战按钮有响应
- [ ] AI助手建议可点击
- [ ] 成长星图显示正常

### 4. API测试
- [ ] `/api/study/queue` 返回数据
- [ ] `/api/study/review` 正常工作
- [ ] `/api/auth/login` 正常工作
- [ ] `/api/auth/register` 正常工作

### 5. 数据持久化测试
- [ ] localStorage正常工作
- [ ] 学习数据正常保存
- [ ] 刷新页面数据不丢失
- [ ] 统计数据正确更新

### 6. 响应式测试
- [ ] 桌面端显示正常
- [ ] 平板端显示正常
- [ ] 手机端显示正常
- [ ] 横屏/竖屏都正常

### 7. 浏览器兼容性
- [ ] Chrome正常
- [ ] Firefox正常
- [ ] Safari正常
- [ ] Edge正常

### 8. 性能测试
- [ ] 首页加载时间 < 3秒
- [ ] 页面切换流畅
- [ ] 没有明显卡顿
- [ ] 内存使用正常

## 🐛 常见问题快速修复

### 问题: 构建失败
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

### 问题: API路由404
检查 `next.config.js`，确保没有：
```javascript
// 删除或注释这一行
// output: 'export',
```

### 问题: 页面刷新404
检查 `netlify.toml`，确保有：
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 问题: 环境变量不生效
1. 在Netlify控制台添加环境变量
2. 重新部署项目

## 📊 部署成功指标

- [ ] 构建时间 < 5分钟
- [ ] 部署成功率 100%
- [ ] 网站可访问
- [ ] 所有功能正常
- [ ] 没有控制台错误
- [ ] 性能评分 > 80分

## 🎯 优化建议

### 立即优化
- [ ] 启用Netlify CDN
- [ ] 配置缓存策略
- [ ] 压缩图片资源

### 后续优化
- [ ] 配置自定义域名
- [ ] 启用HTTPS（自动）
- [ ] 设置部署通知
- [ ] 配置CI/CD流程

## 📱 分享你的网站

部署成功后，你可以：

1. **获取网站链接**
   - Netlify域名: `https://你的网站名.netlify.app`
   - 自定义域名: `https://你的域名.com`

2. **生成二维码**
   - 在Netlify控制台生成
   - 方便移动设备访问

3. **分享到社交媒体**
   - 复制链接分享
   - 截图展示功能

## 🎉 完成！

恭喜！你的网站已经成功部署到Netlify！

现在你可以：
- ✅ 通过URL访问你的网站
- ✅ 分享给朋友使用
- ✅ 继续开发新功能
- ✅ 自动部署更新

---

**下一步**: 查看 `NETLIFY部署完整指南.md` 了解更多高级配置