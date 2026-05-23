const trim = (value: string | undefined) => value?.trim() || ''
const vercelUrl = trim(process.env.VERCEL_URL)
const vercelAppUrl = vercelUrl ? `https://${vercelUrl}` : ''

export const env = {
  appUrl:
    trim(process.env.NEXT_PUBLIC_APP_URL) ||
    vercelAppUrl ||
    'http://localhost:3000',
  nodeEnv: trim(process.env.NODE_ENV) || 'development',
  supabaseUrl: trim(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: trim(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  supabaseServiceRoleKey: trim(process.env.SUPABASE_SERVICE_ROLE_KEY),
  adminEmails: trim(process.env.ADMIN_EMAILS),
  databaseUrl: trim(process.env.DATABASE_URL),
  openRouterApiKey: trim(process.env.OPENROUTER_API_KEY) || trim(process.env.GLM_API_KEY),
  openRouterModel:
    trim(process.env.OPENROUTER_MODEL) || 'google/gemma-4-31b-it:free',
  stripePublishableKey:
    trim(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) ||
    trim(process.env.STRIPE_PUBLISHABLE_KEY),
  stripeSecretKey: trim(process.env.STRIPE_SECRET_KEY),
  stripeWebhookSecret: trim(process.env.STRIPE_WEBHOOK_SECRET),
  stripePriceIdMembership: trim(process.env.STRIPE_PRICE_ID_MEMBERSHIP),
}

export function hasOpenRouter(): boolean {
  return Boolean(env.openRouterApiKey)
}

export function hasSupabase(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey)
}

export function hasSupabaseServiceRole(): boolean {
  return Boolean(env.supabaseServiceRoleKey)
}
