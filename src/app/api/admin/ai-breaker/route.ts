import { NextRequest, NextResponse } from 'next/server'
import { getAiBreakerSnapshot } from '@/lib/ai/circuit-breaker'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest): boolean {
  const adminSecret = process.env.VIGIL_ADMIN_SECRET
  const cronSecret = process.env.CRON_SECRET

  const adminHeader = request.headers.get('x-admin-secret')
  if (adminSecret && adminHeader === adminSecret) return true

  const auth = request.headers.get('authorization')
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true

  return process.env.NODE_ENV === 'development'
}

/**
 * Breaker state for Orlando — readable from Studio or curl with x-admin-secret.
 * Does not expose raw IPs or user content.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const snapshot = await getAiBreakerSnapshot()
  return NextResponse.json(snapshot)
}
