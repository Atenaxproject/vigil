import { createHash } from 'crypto'

function adminCookieValue(secret: string): string {
  return createHash('sha256').update(`vigil-admin:${secret}`).digest('hex').slice(0, 32)
}

export function isValidAdminCookie(cookieValue: string | undefined): boolean {
  const secret = process.env.VIGIL_ADMIN_SECRET
  if (!secret || !cookieValue) return false
  return cookieValue === adminCookieValue(secret)
}

export function createAdminCookieValue(secret: string): string {
  return adminCookieValue(secret)
}
