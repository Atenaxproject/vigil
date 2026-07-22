import { NextResponse } from 'next/server'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const threshold = CRISIS_CONFIG.directoryBadNumberThreshold
  const counts: Record<string, number> = {}

  try {
    const supabase = await createClient()

    const { data: config } = await supabase
      .from('directory_report_config')
      .select('bad_number_threshold')
      .eq('id', 1)
      .maybeSingle()

    const effectiveThreshold =
      typeof config?.bad_number_threshold === 'number' ? config.bad_number_threshold : threshold

    const { data } = await supabase
      .from('feedback')
      .select('entry_id, ip_hash')
      .eq('category', 'bad_number')

    // Count distinct ip_hash per entry_id when available
    const byEntry = new Map<string, Set<string>>()
    for (const row of data ?? []) {
      if (!row.entry_id) continue
      const set = byEntry.get(row.entry_id) ?? new Set()
      set.add(row.ip_hash || `anon-${set.size}`)
      byEntry.set(row.entry_id, set)
    }
    for (const [id, set] of byEntry) {
      counts[id] = set.size
    }

    return NextResponse.json({ counts, threshold: effectiveThreshold })
  } catch {
    return NextResponse.json({ counts: {}, threshold })
  }
}
