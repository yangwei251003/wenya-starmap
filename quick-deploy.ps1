# 问芽星图 - Netlify 快速部署脚本
# 使用方法: .\quick-deploy.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   问芽星图 - Netlify 快速部署工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js
Write-Host "检查 Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 错误: 未安装 Node.js" -ForegroundColor Red
    Write-Host "请访问 https://nodejs.org 下载安装" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green

# 检查npm
Write-Host "检查 npm..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 错误: npm 未正确安装" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm 版本: $npmVersion" -ForegroundColor Green
Write-Host ""

# 选择部署方式
Write-Host "请选择部署方式:" -ForegroundColor Cyan
Write-Host "1. 测试构建（不部署）" -ForegroundColor White
Write-Host "2. 使用 Netlify CLI 部署" -ForegroundColor White
Write-Host "3. 准备手动上传包" -ForegroundColor White
Write-Host "4. 退出" -ForegroundColor White
Write-Host ""

$choice = Read-Host "请输入选项 (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "   开始测试构建" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""

        # 清理旧文件
        Write-Host "清理旧的构建文件..." -ForegroundColor Yellow
        if (Test-Path ".next") {
            Remove-Item -Recurse -Force .next
            Write-Host "✅ 已清理 .next 文件夹" -ForegroundColor Green
        }

        # 安装依赖
        Write-Host ""
        Write-Host "安装依赖..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ 依赖安装失败" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ 依赖安装成功" -ForegroundColor Green

        # 构建项目
        Write-Host ""
        Write-Host "构建项目..." -ForegroundColor Yellow
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ 构建失败" -ForegroundColor Red
            Write-Host "请检查错误信息并修复后重试" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ 构建成功！" -ForegroundColor Green

        # 测试启动
        Write-Host ""
        Write-Host "是否要启动本地服务器测试? (y/n)" -ForegroundColor Yellow
        $testServer = Read-Host
        if ($testServer -eq "y" -or $testServer -eq "Y") {
            Write-Host "启动服务器..." -ForegroundColor Yellow
            Write-Host "访问 http://localhost:3000 测试" -ForegroundColor Cyan
            Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
            npm start
        }
    }

    "2" {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "   使用 Netlify CLI 部署" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""

        # 检查Netlify CLI
        Write-Host "检查 Netlify CLI..." -ForegroundColor Yellow
        $netlifyVersion = netlify --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ 未安装 Netlify CLI" -ForegroundColor Red
            Write-Host "正在安装..." -ForegroundColor Yellow
            npm install -g netlify-cli
            if ($LASTEXITCODE -ne 0) {
                Write-Host "❌ 安装失败" -ForegroundColor Red
                exit 1
            }
            Write-Host "✅ Netlify CLI 安装成功" -ForegroundColor Green
        } else {
            Write-Host "✅ Netlify CLI 已安装" -ForegroundColor Green
        }

        # 登录检查
        Write-Host ""
        Write-Host "检查登录状态..." -ForegroundColor Yellow
        netlify status 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "需要登录 Netlify" -ForegroundColor Yellow
            Write-Host "即将打开浏览器进行授权..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
            netlify login
            if ($LASTEXITCODE -ne 0) {
                Write-Host "❌ 登录失败" -ForegroundColor Red
                exit 1
            }
        }
        Write-Host "✅ 已登录 Netlify" -ForegroundColor Green

        # 构建项目
        Write-Host ""
        Write-Host "构建项目..." -ForegroundColor Yellow
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ 构建失败" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ 构建成功" -ForegroundColor Green

        # 选择部署类型
        Write-Host ""
        Write-Host "选择部署类型:" -ForegroundColor Cyan
        Write-Host "1. 预览部署（测试用）" -ForegroundColor White
        Write-Host "2. 生产部署" -ForegroundColor White
        $deployType = Read-Host "请选择 (1-2)"

        Write-Host ""
        if ($deployType -eq "1") {
            Write-Host "开始预览部署..." -ForegroundColor Yellow
            netlify deploy
        } else {
            Write-Host "开始生产部署..." -ForegroundColor Yellow
            netlify deploy --prod
        }

        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "   🎉 部署成功！" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "请查看上方输出的网站URL" -ForegroundColor Cyan
        } else {
            Write-Host "❌ 部署失败" -ForegroundColor Red
        }
    }

    "3" {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "   准备手动上传包" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""

        # 构建项目
        Write-Host "构建项目..." -ForegroundColor Yellow
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ 构建失败" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ 构建成功" -ForegroundColor Green

        # 创建部署文件夹
        Write-Host ""
        Write-Host "创建部署包..." -ForegroundColor Yellow
        $deployFolder = "netlify-deploy"
        
        if (Test-Path $deployFolder) {
            Remove-Item -Recurse -Force $deployFolder
        }
        New-Item -ItemType Directory -Path $deployFolder | Out-Null

        # 复制必要文件
        Write-Host "复制文件..." -ForegroundColor Yellow
        Copy-Item -Recurse .next "$deployFolder\.next"
        Copy-Item -Recurse public "$deployFolder\public" -ErrorAction SilentlyContinue
        Copy-Item package.json "$deployFolder\package.json"
        Copy-Item package-lock.json "$deployFolder\package-lock.json"
        Copy-Item next.config.js "$deployFolder\next.config.js"
        Copy-Item netlify.toml "$deployFolder\netlify.toml"

        Write-Host "✅ 文件复制完成" -ForegroundColor Green

        # 压缩文件夹
        Write-Host ""
        Write-Host "压缩部署包..." -ForegroundColor Yellow
        $zipFile = "wenya-starmap-netlify.zip"
        if (Test-Path $zipFile) {
            Remove-Item $zipFile
        }
        Compress-Archive -Path $deployFolder -DestinationPath $zipFile
        Write-Host "✅ 压缩完成: $zipFile" -ForegroundColor Green

        # 清理临时文件夹
        Remove-Item -Recurse -Force $deployFolder

        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "   ✅ 部署包准备完成！" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "部署包位置: $zipFile" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "下一步:" -ForegroundColor Yellow
        Write-Host "1. 访问 https://app.netlify.com" -ForegroundColor White
        Write-Host "2. 点击 'Add new site' -> 'Deploy manually'" -ForegroundColor White
        Write-Host "3. 拖拽 $zipFile 到上传区域" -ForegroundColor White
        Write-Host "4. 等待部署完成" -ForegroundColor White
    }

    "4" {
        Write-Host "退出部署工具" -ForegroundColor Yellow
        exit 0
    }

    default {
        Write-Host "❌ 无效选项" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   部署流程完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "需要帮助? 查看 NETLIFY部署完整指南.md" -ForegroundColor Yellow
Write-Host ""