import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createAnthropicClient,
  extractTextContent,
  HAIKU_MODEL,
  isAnthropicConfigured,
  parseJsonFromText,
  SONNET_MODEL,
} from '@/lib/ai/client'
import { identifyByPhotoDTV } from '@/lib/dtv-api'
import { mapDTVPersonaToFederated } from '@/lib/dtv-mapper'

export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
const MAX_BYTES = 5 * 1024 * 1024

interface MatchResult {
  matches: string[]
  confidence: 'alta' | 'media' | 'baja'
}

export async function POST(request: NextRequest) {
  if (!isAnthropicConfigured()) {
    return NextResponse.json(
      { unavailable: true, matches: [], dtvMatches: [], description: null },
      { status: 503 }
    )
  }

  try {
    const formData = await request.formData()
    const photo = formData.get('photo')
    if (!(photo instanceof File)) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(photo.type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }
    if (photo.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    const anthropic = createAnthropicClient()
    if (!anthropic) {
      return NextResponse.json(
        { unavailable: true, matches: [], dtvMatches: [], description: null },
        { status: 503 }
      )
    }

    const bytes = await photo.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mediaType = photo.type as 'image/jpeg' | 'image/png' | 'image/webp'

    const visionResponse = await anthropic.messages.create({
      model: SONNET_MODEL,
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          // Stable instruction first (cacheable prefix), image after — prompt
          // caching only applies to an unchanged leading block sequence.
          content: [
            {
              type: 'text',
              text: `Describe the physical characteristics of the person in this photo to help identify them among missing persons records.
Be specific about: estimated age range, gender, hair color and style, any distinctive features.
Do NOT speculate about identity, nationality, or name.
Return a brief, factual description in Spanish under 100 words.
If no person is clearly visible, say "No se puede identificar una persona en esta imagen."`,
              cache_control: { type: 'ephemeral' },
            },
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
          ],
        },
      ],
    })

    const description = extractTextContent(visionResponse.content)
    if (!description || description.includes('No se puede identificar')) {
      const dtvOnly = await identifyByPhotoDTV(base64, photo.type)
      return NextResponse.json({
        matches: [],
        dtvMatches: (dtvOnly ?? []).map(mapDTVPersonaToFederated),
        description: null,
      })
    }

    const supabase = await createClient()
    const { data: candidates } = await supabase
      .from('public_missing_persons')
      .select('id, full_name, age, gender, last_seen_location, estado, notes, photo_url')
      .eq('status', 'missing')
      .limit(100)

    const matchResponse = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `You described this photo person as: "${description}"

Compare against these missing persons records and return the IDs of the top 3 most likely matches.
Only include a record if there's a reasonable possibility of a match — never force a match if none exist.
Return ONLY JSON: {"matches": ["id1", "id2"], "confidence": "alta/media/baja"}

Missing persons:
${JSON.stringify(
  (candidates ?? []).map((c) => ({
    id: c.id,
    name: c.full_name,
    age: c.age,
    gender: c.gender,
    location: c.last_seen_location,
    estado: c.estado,
    notes: c.notes,
  }))
)}`,
        },
      ],
    })

    const matchText = extractTextContent(matchResponse.content)
    const result = parseJsonFromText<MatchResult>(matchText, { matches: [], confidence: 'baja' })
    const matchedRecords = (candidates ?? []).filter((c) => result.matches?.includes(c.id))

    const dtvMatches = await identifyByPhotoDTV(base64, photo.type)

    return NextResponse.json({
      description,
      confidence: result.confidence ?? 'baja',
      matches: matchedRecords.map((r) => ({
        id: r.id,
        full_name: r.full_name,
        age: r.age,
        gender: r.gender,
        estado: r.estado,
        last_seen_location: r.last_seen_location,
        photo_url: r.photo_url,
        status: 'missing' as const,
        notes: r.notes,
        source: 'web' as const,
        verified: false,
        created_at: '',
        updated_at: '',
        _source: 'vigil' as const,
      })),
      dtvMatches: (dtvMatches ?? []).map(mapDTVPersonaToFederated),
    })
  } catch {
    return NextResponse.json({
      matches: [],
      dtvMatches: [],
      description: null,
      error: 'analysis_failed',
    })
  }
}
