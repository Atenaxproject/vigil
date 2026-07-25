import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/security/rate-limit'
import {
  getClientIp,
  hashIp,
  resolveGeoForRecord,
  sanitizePhone,
  sanitizeText,
} from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

/**
 * Make.com intake bridge — same Zod + sanitize seam as web missing-person submit.
 * Auth: Bearer MAKE_WEBHOOK_SECRET. When secret unset, returns 503 (no open intake).
 */
const schema = z.object({
  full_name: z.string().min(2).max(200),
  age: z.number().min(0).max(150).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  last_seen_location: z.string().min(2).max(500),
  estado: z.string().min(2).max(100),
  municipio: z.string().max(100).optional(),
  last_seen_lat: z.number().optional(),
  last_seen_lng: z.number().optional(),
  notes: z.string().max(2000).optional(),
  contact_name: z.string().min(2).max(200),
  contact_phone: z.string().max(25).optional(),
  contact_whatsapp: z.string().max(25).optional(),
  contact_email: z.string().email().max(200).optional().or(z.literal('')),
  consent_given: z.literal(true),
  data_accuracy_confirmed: z.literal(true),
})

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.MAKE_WEBHOOK_SECRET
  if (!secret) return false
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

export async function POST(request: NextRequest) {
  if (!process.env.MAKE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'make_webhook_not_configured', message: 'MAKE_WEBHOOK_SECRET is not set' },
      { status: 503 }
    )
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ipHash = hashIp(getClientIp(request.headers))
  const limit = await checkRateLimit(`make-webhook:${ipHash}`, 30, 60 * 60 * 1000)
  if (!limit.allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  try {
    const body = schema.parse(await request.json())

    if (body.last_seen_lat !== undefined && body.last_seen_lng !== undefined) {
      const geo = resolveGeoForRecord('person', body.last_seen_lat, body.last_seen_lng)
      if (!geo.ok) {
        return NextResponse.json({ error: geo.error }, { status: 400 })
      }
    }

    let supabase
    try {
      supabase = createAdminClient()
    } catch {
      supabase = await createClient()
    }

    const { data, error } = await supabase
      .from('missing_persons')
      .insert({
        full_name: sanitizeText(body.full_name),
        age: body.age ?? null,
        gender: body.gender ?? 'unknown',
        last_seen_location: sanitizeText(body.last_seen_location),
        estado: sanitizeText(body.estado),
        municipio: body.municipio ? sanitizeText(body.municipio) : null,
        last_seen_lat: body.last_seen_lat ?? null,
        last_seen_lng: body.last_seen_lng ?? null,
        notes: body.notes ? sanitizeText(body.notes) : null,
        contact_name: sanitizeText(body.contact_name),
        contact_phone: body.contact_phone ? sanitizePhone(body.contact_phone) : null,
        contact_whatsapp: body.contact_whatsapp ? sanitizePhone(body.contact_whatsapp) : null,
        contact_email: body.contact_email || null,
        consent_given: true,
        data_accuracy_confirmed: true,
        consent_timestamp: new Date().toISOString(),
        source: 'partner',
        reporter_ip_hash: ipHash,
      })
      .select('id, claim_token')
      .single()

    if (error) {
      console.error('[make/webhook] insert failed:', error.message)
      return NextResponse.json({ error: 'insert_failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      claim_token: data.claim_token,
    })
  } catch {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }
}
