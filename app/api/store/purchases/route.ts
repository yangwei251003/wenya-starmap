import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function isMissingTable(error: { message?: string; code?: string } | null | undefined) {
  return (
    error?.code === 'PGRST205' ||
    error?.message?.includes('Could not find the table')
  )
}

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

    const { data, error } = await supabaseAdmin
      .from('purchased_courses')
      .select('*')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false })

    if (isMissingTable(error)) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { degraded: true, reason: 'schema_not_ready' },
      })
    }

    if (error) {
      return NextResponse.json({ error: error.message || '获取已购课程失败' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
