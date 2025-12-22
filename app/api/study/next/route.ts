/**
 * 获取下一个待学习单词 API
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 从查询参数获取用户ID
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: { message: '缺少用户ID' } },
        { status: 400 }
      )
    }

    // 注意：实际的SRS逻辑在客户端执行（使用localStorage）
    // 这个API主要用于未来扩展到服务端存储

    return NextResponse.json({
      success: true,
      data: {
        message: '请使用客户端SRS服务获取单词'
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: { message: '获取单词失败' } },
      { status: 500 }
    )
  }
}
