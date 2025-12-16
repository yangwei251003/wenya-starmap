# 问芽星图 Netlify 部署脚本

Write-Host "🌱 问芽星图 - Netlify 部署脚本" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# 1. 检查构建
Write-Host "📦 步骤 1/4: 检查项目构建..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败！请修复错误后重试。" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 构建成功！" -ForegroundColor Green
Write-Host ""

# 2. 检查Git状态
Write-Host "📝 步骤 2/4: 检查Git状态..." -ForegroundColor Cyan
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  发现未提交的更改" -ForegroundColor Yellow
    Write-Host "是否要提交这些更改？(Y/N)" -ForegroundColor Yellow
    $commit = Read-Host
    if ($commit -eq "Y" -or $commit -eq "y") {
        git add .
        $commitMessage = Read-Host "请输入提交信息"
        git commit -m $commitMessage
        Write-Host "✅ 更改已提交" -ForegroundColor Green
    }
} else {
    Write-Host "✅ 没有未提交的更改" -ForegroundColor Green
}
Write-Host ""

# 3. 登录Netlify
Write-Host "🔐 步骤 3/4: 登录Netlify..." -ForegroundColor Cyan
Write-Host "如果这是第一次部署，请按照浏览器提示登录Netlify" -ForegroundColor Yellow
npx netlify-cli login
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Netlify登录失败！" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Netlify登录成功！" -ForegroundColor Green
Write-Host ""

# 4. 部署到Netlify
Write-Host "🚀 步骤 4/4: 部署到Netlify..." -ForegroundColor Cyan
Write-Host "选择部署类型：" -ForegroundColor Yellow
Write-Host "1. 生产环境部署 (--prod)" -ForegroundColor Yellow
Write-Host "2. 预览部署 (draft)" -ForegroundColor Yellow
$deployType = Read-Host "请选择 (1/2)"

if ($deployType -eq "1") {
    Write-Host "正在部署到生产环境..." -ForegroundColor Cyan
    npx netlify-cli deploy --prod
} else {
    Write-Host "正在创建预览部署..." -ForegroundColor Cyan
    npx netlify-cli deploy
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 部署失败！" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "🎉 部署完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 后续步骤：" -ForegroundColor Cyan
Write-Host "1. 访问Netlify控制台查看部署状态" -ForegroundColor White
Write-Host "2. 配置环境变量（如果还没有配置）：" -ForegroundColor White
Write-Host "   npx netlify-cli env:set GLM_API_KEY 'your-api-key'" -ForegroundColor Gray
Write-Host "3. 测试部署的站点功能" -ForegroundColor White
Write-Host ""
Write-Host "💡 提示：查看 DEPLOYMENT.md 获取详细的部署指南" -ForegroundColor Yellow
