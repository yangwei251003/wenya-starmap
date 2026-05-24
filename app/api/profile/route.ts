import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import { supabaseAdmin } from '@/lib/supabase'

function isMissingTable(error: { message?: string; code?: string } | null | undefined) {
  return (
    error?.code === 'PGRST205' ||
    error?.message?.includes('Could not find the table')
  )
}

function fallbackProfile(userId: string) {
  return {
    id: userId,
    username: '星图体验用户',
    email: 'demo@wenya-starmap.local',
    level: 'intermediate',
    star_coins: 200,
    learning_progress: 0,
    language_star_map: {},
    demo: true,
  }
}

function createAuthClient() {
  return createClient(
    env.supabaseUrl || 'https://your-project.supabase.co',
    env.supabaseAnonKey || 'your-anon-key'
  )
}

async function resolveUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (token) {
    const authClient = createAuthClient()
    const { data, error } = await authClient.auth.getUser(token)
    if (!error && data.user) {
      return data.user.id
    }
  }

  const { searchParams } = new URL(request.url)
  return searchParams.get('userId')
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request)
    if (!userId) {
      return NextResponse.json({ error: { message: '缺少用户身份' } }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: { message: '数据库服务不可用' } }, { status: 503 })
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (isMissingTable(error)) {
      return NextResponse.json({
        success: true,
        data: fallbackProfile(userId),
        meta: { degraded: true, reason: 'schema_not_ready' },
      })
    }

    if (error) {
      return NextResponse.json(
        { error: { message: error.message || '获取资料失败' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || fallbackProfile(userId),
    })
  } catch (error) {
    return NextResponse.json(
      { error: { message: '获取资料失败' } },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await resolveUserId(request)
    if (!userId) {
      return NextResponse.json({ error: { message: '缺少用户身份' } }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: { message: '数据库服务不可用' } }, { status: 503 })
    }

    const body = await request.json()
    const payload: Record<string, any> = {}

    if (typeof body.username === 'string') payload.username = body.username
    if (typeof body.bio === 'string') payload.bio = body.bio
    if (typeof body.avatar_url === 'string') payload.avatar_url = body.avatar_url
    if (typeof body.level === 'string') payload.level = body.level
    if (typeof body.learning_progress === 'number') payload.learning_progress = body.learning_progress
    if (typeof body.star_coins === 'number') payload.star_coins = body.star_coins
    if (body.language_star_map && typeof body.language_star_map === 'object') {
      payload.language_star_map = body.language_star_map
    }

    payload.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: userId,
        ...payload,
      })
      .select('*')
      .single()

    if (isMissingTable(error)) {
      return NextResponse.json({
        success: true,
        data: fallbackProfile(userId),
        meta: { degraded: true, reason: 'schema_not_ready' },
      })
    }

    if (error) {
      return NextResponse.json(
        { error: { message: error.message || '更新资料失败' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    return NextResponse.json(
      { error: { message: '更新资料失败' } },
      { status: 500 }
    )
  }
}
