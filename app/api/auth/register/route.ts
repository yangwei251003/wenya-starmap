// 用户注册API路由

import { NextRequest, NextResponse } from 'next/server'
import { InputValidator } from '@/lib/security'
import { learningPathService } from '@/lib/learning-path'
import { logger } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, level } = body

    // 输入验证
    if (!username || !email || !password || !level) {
      return NextResponse.json(
        { error: { message: '请填写所有必需字段' } },
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

    // 验证用户名
    const usernameValidation = InputValidator.isValidUsername(username)
    if (!usernameValidation.valid) {
      return NextResponse.json(
        { error: { message: usernameValidation.errors[0] } },
        { status: 400 }
      )
    }

    // 验证密码强度
    const passwordValidation = InputValidator.isValidPassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: { message: passwordValidation.errors[0] } },
        { status: 400 }
      )
    }

    // 模拟用户创建（在实际应用中，这里会保存到数据库）
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 创建学习路径
    const learningPath = await learningPathService.createPathForNewUser(userId, {
      level: level as any,
      targetLevel: level === 'beginner' ? 'intermediate' : 'advanced'
    })

    // 模拟用户数据（包含星币初始值，实际发放在客户端完成）
    const user = {
      id: userId,
      username,
      email,
      level,
      starCoins: 200, // 新用户初始星币（实际发放在客户端登录后完成）
      learningPath,
      purchasedCourses: [],
      createdAt: new Date().toISOString()
    }

    // 记录注册成功
    logger.info('User registered successfully', { userId, username, email })

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          level: user.level,
          starCoins: user.starCoins,
          isNewUser: true // 标记为新用户，客户端需要发放注册奖励
        },
        message: '注册成功！欢迎加入问芽星图！获得200星币新人礼包！'
      }
    })

  } catch (error) {
    logger.error('Registration failed', error as Error)
    
    return NextResponse.json(
      { error: { message: '注册失败，请稍后重试' } },
      { status: 500 }
    )
  }
}