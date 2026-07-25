import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Days without update before a still-missing record is archived (matches 001 pg_cron comment). */
const ARCHIVE_DAYS = 90

function isAuthorizedCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV === 'development'
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

/**
 * Idempotent retention: archive missing_persons with no updates in ARCHIVE_DAYS
 * that are still status=missing and not already archived.
 * Safe when CRON_SECRET is unset in production — returns 401 (Vercel cron sends it).
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
    const cutoff = new Date(Date.now() - ARCHIVE_DAYS * 24 * 60 * 60 * 1000).toISOString()

    const { data: candidates, error: selectError } = await admin
      .from('missing_persons')
      .select('id')
      .is('archived_at', null)
      .eq('status', 'missing')
      .lt('updated_at', cutoff)
      .limit(200)

    if (selectError) {
      return NextResponse.json({ error: 'select_failed' }, { status: 500 })
    }

    const ids = (candidates ?? []).map((r) => r.id)
    if (ids.length === 0) {
      return NextResponse.json({ ok: true, archived: 0, archiveDays: ARCHIVE_DAYS })
    }

    const { error: updateError } = await admin
      .from('missing_persons')
      .update({ archived_at: new Date().toISOString() })
      .in('id', ids)
      .is('archived_at', null)

    if (updateError) {
      return NextResponse.json({ error: 'update_failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, archived: ids.length, archiveDays: ARCHIVE_DAYS })
  } catch (error) {
    console.error('[retention] cron failed:', error)
    return NextResponse.json({ error: 'retention_failed' }, { status: 500 })
  }
}
