import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createAnthropicClient,
  extractTextContent,
  HAIKU_MODEL,
  isAnthropicConfigured,
  parseJsonFromText,
} from '@/lib/ai/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export const dynamic = 'force-dynamic'

interface DuplicatePair {
  original_id: string
  duplicate_id: string
}

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

  if (!isSupabaseConfigured() || !isAnthropicConfigured()) {
    return NextResponse.json({ processed: 0, skipped: 'not_configured' })
  }

  try {
    const supabase = createAdminClient()
    const anthropic = createAnthropicClient()
    if (!anthropic) {
      return NextResponse.json({ processed: 0, skipped: 'ai_not_configured' })
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recent } = await supabase
      .from('missing_persons')
      .select('id, full_name, age, gender, last_seen_location, estado')
      .eq('status', 'missing')
      .is('duplicate_of', null)
      .gte('created_at', since)
      .limit(50)

    if (!recent?.length) {
      return NextResponse.json({ processed: 0 })
    }

    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          // Stable instruction as a cacheable prefix; only the records vary.
          content: [
            {
              type: 'text',
              text: `Analyze this list of missing persons reports and identify probable duplicates.
Two records are probably the same person if: same or very similar name, similar age (within 5 years), same general location.
Return ONLY a JSON array of pairs: [{"original_id": "...", "duplicate_id": "..."}]
If no duplicates found, return [].`,
              cache_control: { type: 'ephemeral' },
            },
            {
              type: 'text',
              text: `Records:\n${JSON.stringify(recent, null, 2)}`,
            },
          ],
        },
      ],
    })

    const text = extractTextContent(response.content)
    const pairs = parseJsonFromText<DuplicatePair[]>(text, [])

    for (const pair of pairs) {
      if (!pair.original_id || !pair.duplicate_id) continue
      await supabase.from('moderation_queue').insert({
        table_name: 'missing_persons',
        record_id: pair.duplicate_id,
        reason: 'ai_duplicate',
        ai_confidence: 0.8,
        notes: `Probable duplicate of record ${pair.original_id}`,
      })
    }

    return NextResponse.json({
      processed: recent.length,
      duplicatesFound: pairs.length,
    })
  } catch {
    return NextResponse.json({ error: 'dedup_failed' }, { status: 500 })
  }
}
