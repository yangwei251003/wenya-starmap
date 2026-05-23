import { env } from './env'

type AdminIdentity = {
  email?: string | null
  level?: string | null
  metadata?: Record<string, unknown> | null
}

function normalizeEmails(value: string | undefined) {
  return (value || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

const adminEmails = normalizeEmails(env.adminEmails)

export function isAdminIdentity(identity: AdminIdentity): boolean {
  const email = identity.email?.trim().toLowerCase() || ''
  const level = identity.level?.trim().toLowerCase() || ''
  const metadata = identity.metadata || {}
  const metadataAdmin = metadata.admin === true || metadata.isAdmin === true

  if (metadataAdmin) return true
  if (level === 'advanced') return true
  if (email && adminEmails.includes(email)) return true

  return false
}

