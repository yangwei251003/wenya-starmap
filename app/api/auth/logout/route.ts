import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      message: '已退出登录',
    },
  })
}
