import { NextRequest, NextResponse } from 'next/server'
import { getStudyQueue } from '@/lib/study-db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: { message: '缺少用户ID' } },
        { status: 400 }
      )
    }

    const result = await getStudyQueue(userId)
    const nextCard = result.queue[0]

    if (!nextCard) {
      return NextResponse.json({
        success: true,
        data: {
          message: '当前没有待学习内容',
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: nextCard,
    })
  } catch (error) {
    return NextResponse.json(
      { error: { message: '获取单词失败' } },
      { status: 500 }
    )
  }
}
