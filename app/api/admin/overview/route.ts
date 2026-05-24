import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { env, hasOpenAIRealtime, hasOpenRouter, hasSupabase, hasSupabaseServiceRole } from '@/lib/env'
import { isAdminIdentity } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type TableState<T> = {
  data: T[]
  count: number | null
  error: string | null
}

async function safeCount(table: string): Promise<TableState<never>> {
  if (!supabaseAdmin) {
    return { data: [], count: null, error: 'Database service is unavailable' }
  }

  const { count, error } = await supabaseAdmin.from(table).select('id', { count: 'exact', head: true })
  return {
    data: [],
    count: typeof count === 'number' ? count : 0,
    error: error ? error.message : null,
  }
}

async function safeRecent<T>(table: string, select: string, orderColumn: string, limit = 8): Promise<TableState<T>> {
  if (!supabaseAdmin) {
    return { data: [], count: null, error: 'Database service is unavailable' }
  }

  const { data, error, count } = await supabaseAdmin
    .from(table)
    .select(select, { count: 'exact' })
    .order(orderColumn, { ascending: false })
    .limit(limit)

  return {
    data: (data || []) as T[],
    count: typeof count === 'number' ? count : null,
    error: error ? error.message : null,
  }
}

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
        { success: false, error: 'Supabase 配置缺失' },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

    if (!token) {
      return NextResponse.json(
        { success: false, error: '未提供访问令牌' },
        { status: 401 }
      )
    }

    const authClient = createAuthClient()
    const { data: authData, error: authError } = await authClient.auth.getUser(token)

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: authError?.message || '未登录' },
        { status: 401 }
      )
    }

    const authProfile =
      supabaseAdmin
        ? await supabaseAdmin
            .from('user_profiles')
            .select('username, email, level')
            .eq('id', authData.user.id)
            .maybeSingle()
        : { data: null, error: null }

    const isAdmin = isAdminIdentity({
      email: authData.user.email,
      level:
        authProfile?.data?.level ||
        authData.user.user_metadata?.level ||
        'intermediate',
      metadata: authData.user.user_metadata as Record<string, unknown> | null,
    })

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: '无权访问后台控制台' },
        { status: 403 }
      )
    }

    const apiHealth = await fetch(new URL('/api/test', request.url), { cache: 'no-store' })
      .then(async (response) => ({
        ok: response.ok,
        status: response.status,
        message: (await response.json()).message || 'API服务器正常运行',
      }))
      .catch((error) => ({
        ok: false,
        status: 0,
        message: error instanceof Error ? error.message : 'API health check failed',
      }))

    const [
      userProbe,
      transactionCount,
      orderCount,
      purchaseCount,
      subscriptionCount,
      studyLogCount,
      reviewLogCount,
      voiceSessionCount,
      resourceCacheCount,
      recentUsers,
      recentTransactions,
      recentOrders,
      recentPurchases,
      recentSubscriptions,
      recentStudyLogs,
      recentReviewLogs,
      recentVoiceSessions,
      recentResourceCache,
    ] = await Promise.all([
      safeCount('user_profiles'),
      safeCount('star_coin_transactions'),
      safeCount('purchase_orders'),
      safeCount('purchased_courses'),
      safeCount('subscriptions'),
      safeCount('study_logs'),
      safeCount('review_logs'),
      safeCount('voice_sessions'),
      safeCount('resource_cache'),
      safeRecent(
        'user_profiles',
        'id, username, email, level, star_coins, learning_progress, created_at, updated_at',
        'updated_at',
        12
      ),
      safeRecent(
        'star_coin_transactions',
        'id, user_id, type, amount, balance, description, related_id, created_at',
        'created_at',
        12
      ),
      safeRecent(
        'purchase_orders',
        'id, user_id, product_type, product_id, product_name, amount_cny, star_coins, currency, provider, status, created_at, completed_at, metadata',
        'created_at',
        12
      ),
      safeRecent(
        'purchased_courses',
        'user_id, course_id, price, progress, purchase_date, last_study_date, updated_at, metadata',
        'purchase_date',
        12
      ),
      safeRecent(
        'subscriptions',
        'user_id, plan_id, provider, status, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at, metadata',
        'updated_at',
        12
      ),
      safeRecent(
        'study_logs',
        'user_id, word_id, state, stability, difficulty, next_review, updated_at, created_at',
        'updated_at',
        12
      ),
      safeRecent(
        'review_logs',
        'user_id, word_id, rating, review_time, created_at',
        'created_at',
        12
      ),
      safeRecent(
        'voice_sessions',
        'id, user_id, provider, model, topic, status, started_at, ended_at, created_at',
        'created_at',
        12
      ),
      safeRecent(
        'resource_cache',
        'id, cache_key, resource_type, source, expires_at, updated_at',
        'updated_at',
        12
      ),
    ])

    const errors = [
      userProbe.error && { table: 'user_profiles', message: userProbe.error },
      transactionCount.error && { table: 'star_coin_transactions', message: transactionCount.error },
      orderCount.error && { table: 'purchase_orders', message: orderCount.error },
      purchaseCount.error && { table: 'purchased_courses', message: purchaseCount.error },
      subscriptionCount.error && { table: 'subscriptions', message: subscriptionCount.error },
      studyLogCount.error && { table: 'study_logs', message: studyLogCount.error },
      reviewLogCount.error && { table: 'review_logs', message: reviewLogCount.error },
      voiceSessionCount.error && { table: 'voice_sessions', message: voiceSessionCount.error },
      resourceCacheCount.error && { table: 'resource_cache', message: resourceCacheCount.error },
      recentUsers.error && { table: 'recentUsers', message: recentUsers.error },
      recentTransactions.error && { table: 'recentTransactions', message: recentTransactions.error },
      recentOrders.error && { table: 'recentOrders', message: recentOrders.error },
      recentPurchases.error && { table: 'recentPurchases', message: recentPurchases.error },
      recentSubscriptions.error && { table: 'recentSubscriptions', message: recentSubscriptions.error },
      recentStudyLogs.error && { table: 'recentStudyLogs', message: recentStudyLogs.error },
      recentReviewLogs.error && { table: 'recentReviewLogs', message: recentReviewLogs.error },
      recentVoiceSessions.error && { table: 'recentVoiceSessions', message: recentVoiceSessions.error },
      recentResourceCache.error && { table: 'recentResourceCache', message: recentResourceCache.error },
    ].filter(Boolean) as Array<{ table: string; message: string }>
    const schemaReady = errors.length === 0

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      serviceStatus: {
        api: apiHealth,
        supabaseConfigured: hasSupabase(),
        supabaseServiceRole: hasSupabaseServiceRole(),
        databaseConnected: Boolean(supabaseAdmin),
        schemaReady,
        openRouter: hasOpenRouter(),
        openAIRealtime: hasOpenAIRealtime(),
        stripeConfigured: Boolean(env.stripeSecretKey || env.stripePublishableKey),
        stripeWebhookConfigured: Boolean(env.stripeWebhookSecret),
        databaseUrlConfigured: Boolean(env.databaseUrl),
        appUrl: env.appUrl,
      },
      summary: {
        userProfiles: userProbe.count,
        starCoinTransactions: transactionCount.count,
        purchaseOrders: orderCount.count,
        purchasedCourses: purchaseCount.count,
        subscriptions: subscriptionCount.count,
        studyLogs: studyLogCount.count,
        reviewLogs: reviewLogCount.count,
        voiceSessions: voiceSessionCount.count,
        resourceCache: resourceCacheCount.count,
      },
      recent: {
        users: recentUsers.data,
        transactions: recentTransactions.data,
        orders: recentOrders.data,
        purchases: recentPurchases.data,
        subscriptions: recentSubscriptions.data,
        studyLogs: recentStudyLogs.data,
        reviewLogs: recentReviewLogs.data,
        voiceSessions: recentVoiceSessions.data,
        resourceCache: recentResourceCache.data,
      },
      errors,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load admin overview',
      },
      { status: 500 }
    )
  }
}
