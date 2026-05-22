import { NextRequest, NextResponse } from 'next/server'
import { getStudyQueue, ensureStudyLog } from '@/lib/study-db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const result = await getStudyQueue(userId)

    return NextResponse.json({
      queue: result.queue,
      stats: result.stats,
    })
  } catch (error) {
    console.error('Error in study queue API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, wordId } = await request.json()

    if (!userId || !wordId) {
      return NextResponse.json({ error: 'User ID and Word ID are required' }, { status: 400 })
    }

    const record = await ensureStudyLog(userId, wordId)

    return NextResponse.json({
      success: true,
      data: record,
    })
  } catch (error) {
    console.error('Error in create study log API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
