import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getClientIp, hashIp, isWithinBounds, sanitizePhone, sanitizeText } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

const schema = z.object({
  type: z.enum(['need', 'resource', 'shelter', 'hospital', 'danger', 'rescue_zone', 'collection_point']),
  category: z
    .enum(['food', 'water', 'medical', 'rescue', 'shelter', 'clothing', 'comms', 'power', 'transport', 'other'])
    .optional(),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  lat: z.number(),
  lng: z.number(),
  contact: z.string().max(100).optional(),
  urgent: z.boolean().optional(),
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
        type: body.type,
        category: body.category ?? null,
        title: sanitizeText(body.title),
        description: body.description ? sanitizeText(body.description) : null,
        lat: body.lat,
        lng: body.lng,
        contact: body.contact ? sanitizePhone(body.contact) : null,
        urgent: body.urgent ?? false,
        reporter_ip_hash: ipHash,
        source: 'citizen',
      })
      .select('id, title, type, lat, lng, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }

    return NextResponse.json({ success: true, marker: data })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
