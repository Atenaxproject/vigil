import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getClientIp, hashIp, isWithinBounds, sanitizePhone, sanitizeText } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

const ACCEPTS_CATEGORIES = [
  'food',
  'water',
  'clothing',
  'medicine',
  'hygiene',
  'tools',
  'other',
] as const

const schema = z.object({
  title: z.string().min(2).max(200),
  organizer_name: z.string().min(2).max(200),
  location_description: z.string().min(2).max(500),
  lat: z.number(),
  lng: z.number(),
  accepts_categories: z.array(z.enum(ACCEPTS_CATEGORIES)).min(1),
  hours_schedule: z.string().min(2).max(200),
  contact: z.string().min(3).max(100),
})

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json())

    if (!isWithinBounds(body.lat, body.lng)) {
      return NextResponse.json({ error: 'Coordenadas fuera de Venezuela' }, { status: 400 })
    }

    const supabase = await createClient()
    const ipHash = hashIp(getClientIp(request.headers))

    const { data, error } = await supabase
      .from('map_markers')
      .insert({
        type: 'collection_point',
        category: 'other',
        title: sanitizeText(body.title),
        description: sanitizeText(body.location_description),
        lat: body.lat,
        lng: body.lng,
        contact: sanitizePhone(body.contact),
        organizer_name: sanitizeText(body.organizer_name),
        hours_schedule: sanitizeText(body.hours_schedule),
        accepts_categories: body.accepts_categories,
        verified: true,
        source: 'citizen',
        reporter_ip_hash: ipHash,
      })
      .select('id, title, lat, lng, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }

    return NextResponse.json({ success: true, marker: data })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
