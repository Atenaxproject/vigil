import type { User } from '@supabase/supabase-js'

/** Comma-separated admin emails from VIGIL_ADMIN_EMAILS env var. */
export function getAdminEmails(): string[] {
  const raw = process.env.VIGIL_ADMIN_EMAILS ?? ''
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

/** Check if user is a Vigil admin via env allowlist or app_metadata.role. */
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false

  const role = user.app_metadata?.role as string | undefined
  if (role === 'admin') return true

  const email = user.email?.toLowerCase()
  if (!email) return false

  const allowlist = getAdminEmails()
  return allowlist.length > 0 && allowlist.includes(email)
}
