import Stripe from 'stripe'
import { env } from './env'

export const stripe = env.stripeSecretKey
  ? new Stripe(env.stripeSecretKey, {
      apiVersion: '2026-04-22.dahlia',
    })
  : null
