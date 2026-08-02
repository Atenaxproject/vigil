import { NextRequest, NextResponse } from 'next/server'
import { runHazardPoll } from '@/lib/hazards/poll'
import { isHazardShardId } from '@/lib/hazards/shards'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export const dynamic = 'force-dynamic'
// Sharded polls keep each invocation small; 300s remains a safety ceiling.
export const maxDuration = 300

function isAuthorizedCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV === 'development'
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

/**
 * Poll hazard adapters and upsert hazard_events.
 * Optional `?shard=eq|weather|land` runs one shard only (preferred for cron).
 * Omitting shard polls every adapter (manual / admin use).
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ skipped: 'supabase_not_configured' })
  }

  const shardParam = request.nextUrl.searchParams.get('shard')
  if (shardParam && !isHazardShardId(shardParam)) {
    return NextResponse.json(
      { error: 'invalid_shard', allowed: ['eq', 'weather', 'land'] },
      { status: 400 }
    )
  }

  try {
    const result = await runHazardPoll(
      shardParam && isHazardShardId(shardParam) ? { shard: shardParam } : undefined
    )
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[hazards] cron failed:', error)
    return NextResponse.json({ error: 'poll_failed' }, { status: 500 })
  }
}
