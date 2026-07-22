import type { FeedHealthRecord, FeedId } from '@/lib/feed-health'

/**
 * Persist / list feed health (server-only). Soft-fails without service role.
 */
export async function recordFeedHealth(input: {
  feedId: FeedId | string
  label: string
  ok: boolean
  itemCount?: number
  error?: string
  meta?: Record<string, unknown>
}): Promise<void> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()
    const now = new Date().toISOString()
    const row = {
      feed_id: input.feedId,
      label: input.label,
      last_attempt_at: now,
      last_error: input.ok ? null : (input.error ?? 'fetch failed'),
      item_count: input.itemCount ?? null,
      meta: input.meta ?? {},
      updated_at: now,
      ...(input.ok ? { last_success_at: now } : {}),
    }
    const { error } = await supabase.from('feed_health').upsert(row, { onConflict: 'feed_id' })
    if (error) console.error('[feed-health] upsert failed:', error.message)
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[feed-health] skip persist:', err instanceof Error ? err.message : err)
    }
  }
}

export async function listFeedHealth(): Promise<FeedHealthRecord[]> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('feed_health')
      .select('feed_id, label, last_success_at, last_attempt_at, last_error, item_count, meta')
      .order('feed_id')
    if (error) {
      console.error('[feed-health] list failed:', error.message)
      return []
    }
    return (data ?? []) as FeedHealthRecord[]
  } catch {
    return []
  }
}
