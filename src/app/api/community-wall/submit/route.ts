import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getClientIp, hashIp, isWithinBounds, sanitizeText } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

const schema = z.object({
  author_name: z.string().min(2).max(100),
  message: z.string().min(3).max(300),
  category: z.enum(['general', 'aviso', 'solidaridad', 'pregunta']),
  location_label: z.string().max(200).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json())

    if (body.lat != null && body.lng != null && !isWithinBounds(body.lat, body.lng)) {
      return NextResponse.json({ error: 'Coordenadas fuera de Venezuela' }, { status: 400 })
    }

    const supabase = await createClient()
    const ipHash = hashIp(getClientIp(request.headers))

    const { data, error } = await supabase
      .from('community_wall')
      .insert({
        author_name: sanitizeText(body.author_name),
        message: sanitizeText(body.message),
        category: body.category,
        location_label: body.location_label ? sanitizeText(body.location_label) : null,
        lat: body.lat ?? null,
        lng: body.lng ?? null,
        reporter_ip_hash: ipHash,
      })
      .select('id, author_name, message, category, location_label, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error al guardar mensaje' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: data })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
