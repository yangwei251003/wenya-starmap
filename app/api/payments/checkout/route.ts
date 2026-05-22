import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId, planId = 'membership' } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database service is unavailable' }, { status: 503 })
    }

    if (!stripe || !env.stripePriceIdMembership || !env.stripeWebhookSecret) {
      return NextResponse.json(
        {
          success: false,
          error: '会员支付未配置完整，请先补齐 STRIPE_SECRET_KEY、STRIPE_PRICE_ID_MEMBERSHIP 和 STRIPE_WEBHOOK_SECRET',
        },
        { status: 503 }
      )
    }

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: `${env.appUrl}/dashboard?tab=ecosystem&subscribed=1`,
      cancel_url: `${env.appUrl}/dashboard?tab=ecosystem&canceled=1`,
      customer_email: profile?.email || undefined,
      metadata: {
        userId,
        planId,
        productType: 'subscription',
      },
      line_items: [
        {
          price: env.stripePriceIdMembership,
          quantity: 1,
        },
      ],
    })

    await supabaseAdmin.from('subscriptions').upsert({
      user_id: userId,
      plan_id: planId,
      provider: 'stripe',
      provider_subscription_id: session.id,
      status: 'pending',
      metadata: {
        checkoutSessionId: session.id,
        planId,
      },
    }, { onConflict: 'provider_subscription_id' })

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
