import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getClientIp, hashIp, isWithinBounds, sanitizePhone, sanitizeText } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

const schema = z.object({
  full_name: z.string().min(2).max(200),
  age: z.number().min(0).max(150).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  last_seen_location: z.string().min(2).max(500),
  last_seen_lat: z.number().optional(),
  last_seen_lng: z.number().optional(),
  last_seen_at: z.string().optional(),
  notes: z.string().max(2000).optional(),
  contact_name: z.string().min(2).max(200),
  contact_phone: z.string().max(25).optional(),
  contact_whatsapp: z.string().max(25).optional(),
  consent_given: z.literal(true),
  data_accuracy_confirmed: z.literal(true),
})

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json())

    if (body.last_seen_lat !== undefined && body.last_seen_lng !== undefined) {
      if (!isWithinBounds(body.last_seen_lat, body.last_seen_lng)) {
        return NextResponse.json({ error: 'Coordenadas fuera de Venezuela' }, { status: 400 })
      }
    }

    const supabase = await createClient()
    const ipHash = hashIp(getClientIp(request.headers))

    const { data, error } = await supabase
      .from('missing_persons')
      .insert({
        full_name: sanitizeText(body.full_name),
        age: body.age ?? null,
        gender: body.gender ?? null,
        last_seen_location: sanitizeText(body.last_seen_location),
        last_seen_lat: body.last_seen_lat ?? null,
        last_seen_lng: body.last_seen_lng ?? null,
        last_seen_at: body.last_seen_at ?? null,
        notes: body.notes ? sanitizeText(body.notes) : null,
        contact_name: sanitizeText(body.contact_name),
        contact_phone: body.contact_phone ? sanitizePhone(body.contact_phone) : null,
        contact_whatsapp: body.contact_whatsapp ? sanitizePhone(body.contact_whatsapp) : null,
        consent_given: true,
        data_accuracy_confirmed: true,
        consent_timestamp: new Date().toISOString(),
        reporter_ip_hash: ipHash,
        source: 'web',
      })
      .select('id, full_name, status, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }

    return NextResponse.json({ success: true, record: data })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
