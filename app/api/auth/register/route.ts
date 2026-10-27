import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { InputValidator } from '@/lib/security'
import { learningPathService } from '@/lib/learning-path'
import { env, hasSupabase, hasSupabaseServiceRole } from '@/lib/env'
import { supabaseAdmin } from '@/lib/supabase'
import { logger } from '@/lib/error-handler'

function createAuthClient() {
  return createClient(
    env.supabaseUrl || 'https://your-project.supabase.co',
    env.supabaseAnonKey || 'your-anon-key'
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, level } = body

    if (!username || !email || !password || !level) {
      return NextResponse.json(
        { error: { message: '请填写所有必需字段' } },
        { status: 400 }
      )
    }

    if (!InputValidator.isValidEmail(email)) {
      return NextResponse.json(
        { error: { message: '邮箱格式不正确' } },
        { status: 400 }
      )
    }

    const usernameValidation = InputValidator.isValidUsername(username)
    if (!usernameValidation.valid) {
      return NextResponse.json(
        { error: { message: usernameValidation.errors[0] } },
        { status: 400 }
      )
    }

    const passwordValidation = InputValidator.isValidPassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: { message: passwordValidation.errors[0] } },
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
    let authUser = null as Awaited<ReturnType<typeof authClient.auth.getUser>>['data']['user'] | null
    let authSession = null as Awaited<ReturnType<typeof authClient.auth.signInWithPassword>>['data']['session'] | null

    if (hasSupabaseServiceRole() && supabaseAdmin) {
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username,
          level,
        },
      })

      if (createError || !createData.user) {
        return NextResponse.json(
          { error: { message: createError?.message || '注册失败，请稍后重试' } },
          { status: 400 }
        )
      }

      authUser = createData.user

      const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
        email,
        password,
      })

      if (!signInError) {
        authSession = signInData.session || null
      }
    } else {
      const { data, error } = await authClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            level,
          },
        },
      })

      if (error || !data.user) {
        return NextResponse.json(
          { error: { message: error?.message || '注册失败，请稍后重试' } },
          { status: 400 }
        )
      }

      authUser = data.user
      authSession = data.session || null
    }

    if (!authUser) {
      return NextResponse.json(
        { error: { message: '注册失败，请稍后重试' } },
        { status: 400 }
      )
    }

    if (hasSupabaseServiceRole() && supabaseAdmin) {
      const learningPath = await learningPathService.createPathForNewUser(authUser.id, {
        level: level as any,
        targetLevel: level === 'beginner' ? 'intermediate' : 'advanced',
      })

      const { error: profileError } = await supabaseAdmin.from('user_profiles').upsert({
        id: authUser.id,
        username,
        email,
        level,
        star_coins: 200,
        learning_progress: 0,
        language_star_map: learningPath ? { pathId: learningPath.id } : {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        logger.warn('Profile upsert failed on register', profileError as Error)
      }

      const { error: settingsError } = await supabaseAdmin.rpc('ensure_user_study_settings', {
        p_user_id: authUser.id,
      })

      if (settingsError) {
        logger.warn('Study settings seed failed on register', settingsError as Error)
      }

      const { error: pathError } = await supabaseAdmin.from('learning_paths').insert({
        user_id: authUser.id,
        current_level: level,
        target_level: level === 'beginner' ? 'intermediate' : 'advanced',
        progress: 0,
        path_title: `${username} 的英语成长星图`,
        path_summary: '根据入门水平生成的第一条学习路径',
        path_payload: learningPath,
        recommended_next: learningPath.recommendedNext?.slice(0, 3).map((lesson: any) => lesson.id) || [],
      })

      if (pathError) {
        logger.warn('Learning path insert failed on register', pathError as Error)
      }
    }

    logger.info('User registered successfully', {
      userId: authUser.id,
      username,
      email,
    })

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: authUser.id,
          username,
          email,
          level,
          starCoins: 200,
          isNewUser: true,
        },
        session: authSession ? {
          accessToken: authSession.access_token,
          refreshToken: authSession.refresh_token,
        } : null,
        message: '注册成功！欢迎加入问芽星图！获得200星币新人礼包！',
      },
    })
  } catch (error) {
    logger.error('Registration failed', error as Error)

    return NextResponse.json(
      { error: { message: '注册失败，请稍后重试' } },
      { status: 500 }
    )
  }
}
