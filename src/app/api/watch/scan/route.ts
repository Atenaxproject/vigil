import { NextRequest, NextResponse } from 'next/server'
import { runWatchScan } from '@/lib/watch'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Vigil Watch scan — operator early-warning monitor.
 * Triggered by GitHub Action every 30 min (see .github/workflows/vigil-watch.yml).
 * Same CRON_SECRET guard pattern as /api/cron/dedup.
 */
function isAuthorizedCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV === 'development'
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ skipped: 'supabase_not_configured' })
  }

  try {
    const result = await runWatchScan()
    return NextResponse.json(result)
  } catch (error) {
    console.error('[vigil-watch] scan failed:', error)
    return NextResponse.json({ error: 'scan_failed' }, { status: 500 })
  }
}
