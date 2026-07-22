import { NextRequest, NextResponse } from 'next/server'
import { runHazardPoll } from '@/lib/hazards/poll'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function isAuthorizedCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV === 'development'
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

/** Poll all hazard adapters and upsert hazard_events. */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ skipped: 'supabase_not_configured' })
  }

  try {
    const result = await runHazardPoll()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[hazards] cron failed:', error)
    return NextResponse.json({ error: 'poll_failed' }, { status: 500 })
  }
}
