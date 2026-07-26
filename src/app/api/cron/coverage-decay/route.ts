import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Days without coverage update before a need is marked needs_reconfirmation. */
const STALE_DAYS = 7

function isAuthorizedCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV === 'development'
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

/**
 * Auto-decay: active need markers with uncovered/partial coverage that have
 * not been updated in STALE_DAYS → needs_reconfirmation (map labels stale).
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ skipped: 'supabase_not_configured' })
  }

  try {
    const admin = createAdminClient()
    const cutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString()

    // Prefer coverage_updated_at; fall back to created_at when never set.
    const { data: candidates, error: selectError } = await admin
      .from('map_markers')
      .select('id, coverage_updated_at, created_at')
      .eq('type', 'need')
      .eq('status', 'active')
      .in('coverage_state', ['uncovered', 'partial'])

    if (selectError) {
      return NextResponse.json({ error: 'select_failed' }, { status: 500 })
    }

    const staleIds = (candidates ?? [])
      .filter((row) => {
        const ref = row.coverage_updated_at ?? row.created_at
        return ref != null && ref < cutoff
      })
      .map((row) => row.id)

    if (staleIds.length === 0) {
      return NextResponse.json({ ok: true, updated: 0, staleDays: STALE_DAYS })
    }

    const { error: updateError } = await admin
      .from('map_markers')
      .update({
        coverage_state: 'needs_reconfirmation',
        coverage_updated_at: new Date().toISOString(),
        coverage_updated_by: 'cron:coverage-decay',
      })
      .in('id', staleIds)

    if (updateError) {
      return NextResponse.json({ error: 'update_failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, updated: staleIds.length, staleDays: STALE_DAYS })
  } catch (error) {
    console.error('[coverage-decay] cron failed:', error)
    return NextResponse.json({ error: 'decay_failed' }, { status: 500 })
  }
}
