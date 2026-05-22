import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { InputValidator } from '@/lib/security'
import { env, hasSupabase } from '@/lib/env'
import { supabaseAdmin } from '@/lib/supabase'
import { logger } from '@/lib/error-handler'

function createAuthClient() {
  return createClient(env.supabaseUrl || 'https://your-project.supabase.co', env.supabaseAnonKey || 'your-anon-key')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: { message: '请输入邮箱和密码' } },
        { status: 400 }
      )
    }

    if (!InputValidator.isValidEmail(email)) {
      return NextResponse.json(
        { error: { message: '邮箱格式不正确' } },
        { status: 400 }
      )
    }

    if (!hasSupabase()) {
      return NextResponse.json(
        { error: { message: 'Supabase 配置缺失，请检查环境变量' } },
        { status: 500 }
      )
    }

    const authClient = createAuthClient()
    const { data, error } = await authClient.auth.signInWithPassword({ email, password })

    if (error || !data.user) {
      return NextResponse.json(
        { error: { message: error?.message || '登录失败，请检查邮箱和密码' } },
        { status: 401 }
      )
    }

    let profile = supabaseAdmin
      ? await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()
      : { data: null, error: null }

    if (profile?.error) {
      logger.warn('Profile fetch failed on login', profile.error as Error)
    }

    if (!profile?.data && supabaseAdmin) {
      const metadata = (data.user.user_metadata || {}) as Record<string, any>
      const { data: seededProfile } = await supabaseAdmin
        .from('user_profiles')
        .upsert({
          id: data.user.id,
          username: metadata.username || email.split('@')[0],
          email: data.user.email || email,
          level: metadata.level || 'intermediate',
          star_coins: 0,
          learning_progress: 0,
          language_star_map: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single()

      profile = { data: seededProfile, error: null }
    }

    const metadata = (data.user.user_metadata || {}) as Record<string, any>

    const user = {
      id: data.user.id,
      username:
        profile?.data?.username ||
        metadata.username ||
        email.split('@')[0],
      email: data.user.email || email,
      level:
        profile?.data?.level ||
        metadata.level ||
        'intermediate',
      starCoins: profile?.data?.star_coins ?? 0,
      learningProgress: profile?.data?.learning_progress ?? 0,
      loginTime: new Date().toISOString(),
    }

    logger.info('User logged in successfully', {
      userId: data.user.id,
      email,
    })

    return NextResponse.json({
      success: true,
      data: {
        user,
        token: data.session?.access_token || null,
        refreshToken: data.session?.refresh_token || null,
        message: '登录成功！',
      },
    })
  } catch (error) {
    logger.error('Login failed', error as Error)

    return NextResponse.json(
      { error: { message: '登录失败，请稍后重试' } },
      { status: 500 }
    )
  }
}
