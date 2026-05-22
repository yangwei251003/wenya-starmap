import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { RECHARGE_PACKAGES } from '@/lib/star-coin-service'
import { env } from '@/lib/env'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId, packageId, paymentMethod = 'card' } = await request.json()

    if (!userId || !packageId) {
      return NextResponse.json({ error: 'User ID and Package ID are required' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database service is unavailable' }, { status: 503 })
    }

    const pkg = RECHARGE_PACKAGES.find(item => item.id === packageId)
    if (!pkg) {
      return NextResponse.json({ error: '充值套餐不存在' }, { status: 404 })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ error: '用户资料不存在' }, { status: 404 })
    }

    const now = new Date().toISOString()
    const totalCoins = pkg.starCoins + pkg.bonusCoins

    if (stripe) {
      if (!env.stripeWebhookSecret) {
        return NextResponse.json(
          {
            error: 'Stripe 已启用，但缺少 STRIPE_WEBHOOK_SECRET，请先补齐后再开启真实充值',
          },
          { status: 503 }
        )
      }

      const { data: order } = await supabaseAdmin
        .from('purchase_orders')
        .insert({
          user_id: userId,
          product_type: 'recharge',
          product_id: packageId,
          product_name: pkg.name,
          amount_cny: pkg.price,
          star_coins: totalCoins,
          currency: 'cny',
          provider: 'stripe',
          provider_order_id: `sess_pending_${Date.now()}`,
          status: 'pending',
          metadata: {
            paymentMethod,
            bonusCoins: pkg.bonusCoins,
          },
        })
        .select('*')
        .single()

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        success_url: `${env.appUrl}/recharge?success=1`,
        cancel_url: `${env.appUrl}/recharge?canceled=1`,
        customer_email: profile.email || undefined,
        metadata: {
          orderId: order?.id || '',
          userId,
          packageId,
          productType: 'recharge',
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'cny',
              unit_amount: Math.round(pkg.price * 100),
              product_data: {
                name: `问芽星图 - ${pkg.name}`,
                description: `获得 ${totalCoins} 星币`,
              },
            },
          },
        ],
      })

      await supabaseAdmin
        .from('purchase_orders')
        .update({
          provider_order_id: session.id,
          metadata: {
            paymentMethod,
            bonusCoins: pkg.bonusCoins,
            checkoutSessionId: session.id,
          },
          updated_at: now,
        })
        .eq('id', order?.id || '')

      return NextResponse.json({
        success: true,
        data: {
          checkoutUrl: session.url,
          sessionId: session.id,
          packageId,
        },
      })
    }

    const nextBalance = profile.star_coins + totalCoins

    const { error: orderError } = await supabaseAdmin
      .from('purchase_orders')
      .insert({
        user_id: userId,
        product_type: 'recharge',
        product_id: packageId,
        product_name: pkg.name,
        amount_cny: pkg.price,
        star_coins: totalCoins,
        currency: 'cny',
        provider: 'demo',
        provider_order_id: `demo_${packageId}_${Date.now()}`,
        status: 'paid',
        metadata: {
          paymentMethod,
          bonusCoins: pkg.bonusCoins,
        },
        completed_at: now,
      })

    if (orderError) {
      return NextResponse.json({ error: orderError.message || '创建订单失败' }, { status: 500 })
    }

    const { error: txnError } = await supabaseAdmin
      .from('star_coin_transactions')
      .insert({
        user_id: userId,
        type: 'recharge',
        amount: totalCoins,
        balance: nextBalance,
        description: `充值「${pkg.name}」 +${pkg.starCoins}星币${pkg.bonusCoins > 0 ? ` (赠送+${pkg.bonusCoins})` : ''}`,
        related_id: packageId,
        metadata: {
          paymentMethod,
          packageName: pkg.name,
        },
      })

    if (txnError) {
      return NextResponse.json({ error: txnError.message || '写入交易失败' }, { status: 500 })
    }

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
        packageId,
        balance: nextBalance,
        totalCoins,
        simulated: true,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
