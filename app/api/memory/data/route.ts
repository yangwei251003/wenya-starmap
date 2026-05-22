import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { fsrs, State } from '@/utils/fsrs'

export const dynamic = 'force-dynamic'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database service is unavailable' }, { status: 503 })
    }

    const { data: studyLogs, error } = await supabaseAdmin
      .from('study_logs')
      .select('*')
      .eq('user_id', userId)
      .neq('state', 'new')
      .order('updated_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching study logs:', error)
      return NextResponse.json({ error: 'Failed to fetch study logs' }, { status: 500 })
    }

    const memoryData = (studyLogs || []).map(log => {
      const card = {
        id: log.word_id,
        due: new Date(log.next_review),
        stability: log.stability,
        difficulty: log.difficulty,
        elapsed_days: log.elapsed_days,
        scheduled_days: log.scheduled_days,
        reps: log.reps,
        lapses: log.lapses,
        state:
          log.state === 'new'
            ? State.New
            : log.state === 'learning'
              ? State.Learning
              : log.state === 'review'
                ? State.Review
                : State.Relearning,
        last_review: log.last_review ? new Date(log.last_review) : undefined,
      }

      const memoryStrength = fsrs.getMemoryStrength(card)

      return {
        word_id: log.word_id,
        stability: log.stability,
        difficulty: log.difficulty,
        memory_strength: memoryStrength,
        next_review: log.next_review,
        state: log.state,
        last_review: log.last_review,
        reps: log.reps,
        lapses: log.lapses,
      }
    })

    return NextResponse.json(memoryData)
  } catch (error) {
    console.error('Error in memory data API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
