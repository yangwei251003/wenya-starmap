// 用户登录API路由

import { NextRequest, NextResponse } from 'next/server'
import { InputValidator } from '@/lib/security'
import { logger } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 输入验证
    if (!email || !password) {
      return NextResponse.json(
        { error: { message: '请输入邮箱和密码' } },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    if (!InputValidator.isValidEmail(email)) {
      return NextResponse.json(
        { error: { message: '邮箱格式不正确' } },
        { status: 400 }
      )
    }

    // 模拟用户验证（在实际应用中，这里会查询数据库）
    // 为了演示，我们接受任何有效的邮箱和密码组合
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 模拟用户数据
    const user = {
      id: userId,
      username: email.split('@')[0], // 使用邮箱前缀作为用户名
      email,
      level: 'intermediate', // 默认中级水平
      createdAt: new Date().toISOString()
    }

    // 记录登录成功
    logger.info('User logged in successfully', { userId, email })

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        user,
        token: `demo_token_${userId}`, // 演示用的token
        message: '登录成功！'
      }
    })

  } catch (error) {
    logger.error('Login failed', error as Error)
    
    return NextResponse.json(
      { error: { message: '登录失败，请稍后重试' } },
      { status: 500 }
    )
  }
}