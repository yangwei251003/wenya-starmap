import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCourseById } from '@/lib/store-courses-data'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId, courseId } = await request.json()

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'User ID and Course ID are required' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database service is unavailable' }, { status: 503 })
    }

    const course = getCourseById(courseId)
    if (!course) {
      return NextResponse.json({ error: '课程不存在' }, { status: 404 })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ error: '用户资料不存在' }, { status: 404 })
    }

    const { data: existingCourse } = await supabaseAdmin
      .from('purchased_courses')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle()

    if (existingCourse) {
      return NextResponse.json({ error: '您已经购买过这门课程了' }, { status: 409 })
    }

    if (!course.isFree && profile.star_coins < course.price) {
      return NextResponse.json({ error: '星币不足' }, { status: 400 })
    }

    const nextBalance = profile.star_coins - (course.isFree ? 0 : course.price)
    const now = new Date().toISOString()

    const { error: purchaseError } = await supabaseAdmin
      .from('purchased_courses')
      .upsert({
        user_id: userId,
        course_id: courseId,
        price: course.price,
        progress: 0,
        purchase_date: now,
        last_study_date: null,
        metadata: {
          title: course.title,
          category: course.category,
        },
        updated_at: now,
      }, { onConflict: 'user_id,course_id' })

    if (purchaseError) {
      return NextResponse.json({ error: purchaseError.message || '购买失败' }, { status: 500 })
    }

    await supabaseAdmin.from('star_coin_transactions').insert({
      user_id: userId,
      type: course.isFree ? 'free_course' : 'purchase_course',
      amount: course.isFree ? 0 : -course.price,
      balance: nextBalance,
      description: course.isFree
        ? `领取免费课程「${course.title}」`
        : `购买课程「${course.title}」`,
      related_id: courseId,
      metadata: {
        title: course.title,
      },
    })

    const { error: profileUpdateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        star_coins: nextBalance,
        updated_at: now,
      })
      .eq('id', userId)

    if (profileUpdateError) {
      return NextResponse.json({ error: profileUpdateError.message || '更新余额失败' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        courseId,
        balance: nextBalance,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
