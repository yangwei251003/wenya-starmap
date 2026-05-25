import { NextRequest, NextResponse } from 'next/server'
import { getStudyQueue } from '@/lib/study-db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 20)))

    if (!userId) {
      return NextResponse.json(
        { error: { message: '缺少用户ID' } },
        { status: 400 }
      )
    }

    const result = await getStudyQueue(userId, limit)

    if (!result.queue.length) {
      return NextResponse.json({
        success: true,
        data: {
          message: '当前没有待学习内容',
          queue: [],
          stats: result.stats,
          recommendation: result.recommendation,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        queue: result.queue.map((item) => ({ ...item, resource: null })),
        stats: result.stats,
        recommendation: result.recommendation,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: { message: '获取单词失败' } },
      { status: 500 }
    )
  }
}
