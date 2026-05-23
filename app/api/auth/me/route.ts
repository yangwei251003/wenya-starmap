import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { env, hasSupabase } from '@/lib/env'
import { isAdminIdentity } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase'

function createAuthClient() {
  return createClient(
    env.supabaseUrl || 'https://your-project.supabase.co',
    env.supabaseAnonKey || 'your-anon-key'
  )
}

export async function GET(request: NextRequest) {
  try {
    if (!hasSupabase()) {
      return NextResponse.json(
        { error: { message: 'Supabase 配置缺失' } },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

    if (!token) {
      return NextResponse.json(
        { error: { message: '未提供访问令牌' } },
        { status: 401 }
      )
    }

    const authClient = createAuthClient()
    const { data, error } = await authClient.auth.getUser(token)

    if (error || !data.user) {
      return NextResponse.json(
        { error: { message: error?.message || '未登录' } },
        { status: 401 }
      )
    }

    let profile: any = null

    if (supabaseAdmin) {
      const { data: profileData } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()

      profile = profileData
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          username:
            profile?.username ||
            data.user.user_metadata?.username ||
            data.user.email?.split('@')[0] ||
            'user',
          level:
            profile?.level ||
            data.user.user_metadata?.level ||
            'intermediate',
          starCoins: profile?.star_coins ?? 0,
          learningProgress: profile?.learning_progress ?? 0,
          avatarUrl: profile?.avatar_url || null,
          isAdmin: isAdminIdentity({
            email: data.user.email,
            level:
              profile?.level ||
              data.user.user_metadata?.level ||
              'intermediate',
            metadata: data.user.user_metadata as Record<string, unknown> | null,
          }),
        },
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: { message: '获取用户信息失败' } },
      { status: 500 }
    )
  }
}
