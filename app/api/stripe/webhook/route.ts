import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { env } from '@/lib/env'
import { supabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!stripe || !env.stripeWebhookSecret || !supabaseAdmin) {
    return NextResponse.json({ error: 'Stripe webhook is not configured' }, { status: 503 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
  }

  const payload = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const { error: eventInsertError } = await supabaseAdmin
    .from('stripe_events')
    .insert({
      id: event.id,
      event_type: event.type,
      payload: event as any,
    })

  if (eventInsertError?.code === '23505') {
    return NextResponse.json({ received: true, duplicate: true })
  }

  if (eventInsertError) {
    return NextResponse.json({ error: 'Failed to record Stripe event' }, { status: 500 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata || {}
    const orderId = metadata.orderId || ''
    const userId = metadata.userId || ''
    const productType = metadata.productType || 'recharge'

    if (productType === 'recharge' && orderId && userId) {
      const { data: order } = await supabaseAdmin
        .from('purchase_orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle()

      if (order && order.status !== 'paid') {
        const nextBalance = Number(order.star_coins || 0) + Number(
          (await supabaseAdmin
            .from('user_profiles')
            .select('star_coins')
            .eq('id', userId)
            .maybeSingle()).data?.star_coins || 0
        )

        const now = new Date().toISOString()

        await supabaseAdmin
          .from('purchase_orders')
          .update({
            status: 'paid',
            completed_at: now,
            updated_at: now,
            provider_order_id: session.id,
          })
          .eq('id', orderId)

        await supabaseAdmin.from('star_coin_transactions').insert({
          user_id: userId,
          type: 'recharge',
          amount: Number(order.star_coins || 0),
          balance: nextBalance,
          description: `Stripe 充值「${order.product_name}」`,
          related_id: orderId,
          metadata: {
            sessionId: session.id,
            provider: 'stripe',
          },
        })

        await supabaseAdmin
          .from('user_profiles')
          .update({
            star_coins: nextBalance,
            updated_at: now,
          })
          .eq('id', userId)
      }
    }

    if (productType === 'subscription' && userId) {
      const checkoutSessionId = session.id
      const stripeSubscriptionId = session.subscription?.toString() || ''
      const now = new Date().toISOString()

      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_id: metadata.planId || 'membership',
          provider: 'stripe',
          provider_subscription_id: stripeSubscriptionId || checkoutSessionId,
          status: 'active',
          current_period_start: now,
          current_period_end: null,
          cancel_at_period_end: false,
          metadata: {
            sessionId: session.id,
            stripeSubscriptionId,
          },
          updated_at: now,
        }, { onConflict: 'provider_subscription_id' })
    }
  }

  return NextResponse.json({ received: true })
}
