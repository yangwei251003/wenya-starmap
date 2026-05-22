import { NextRequest, NextResponse } from 'next/server'
import { Rating } from '@/utils/fsrs'
import { recordReview } from '@/lib/study-db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId, wordId, rating, reviewTime } = await request.json()

    if (!userId || !wordId || rating === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 4) {
      return NextResponse.json({ error: 'Rating must be between 1 and 4' }, { status: 400 })
    }

    const result = await recordReview(
      userId,
      wordId,
      rating as Rating,
      reviewTime ? new Date(reviewTime) : new Date()
    )

    if (!result) {
      return NextResponse.json(
        { error: 'Study database is not available' },
        { status: 503 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: wordId,
        word_id: wordId,
        next_review: result.studyLog.next_review,
        stability: result.studyLog.stability,
        difficulty: result.studyLog.difficulty,
        state: result.studyLog.state,
        memory_strength: result.memoryStrength,
        scheduled_days: result.studyLog.scheduled_days,
      },
    })
  } catch (error) {
    console.error('Error in review API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
