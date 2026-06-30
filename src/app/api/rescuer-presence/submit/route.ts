import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isWithinBounds, sanitizePhone, sanitizeText } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

const schema = z.object({
  display_name: z.string().min(2).max(100),
  team_or_org: z.string().max(100).optional(),
  presence_type: z.enum(['rescue_team', 'volunteer', 'medical', 'individual']),
  lat: z.number(),
  lng: z.number(),
  notes: z.string().max(500).optional(),
  contact_phone: z.string().max(25).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json())

    if (!isWithinBounds(body.lat, body.lng)) {
      return NextResponse.json({ error: 'Coordenadas fuera de Venezuela' }, { status: 400 })
    }

    const supabase = await createClient()
    const expireAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('rescuer_presence')
      .insert({
        display_name: sanitizeText(body.display_name),
        team_or_org: body.team_or_org ? sanitizeText(body.team_or_org) : null,
        presence_type: body.presence_type,
        lat: body.lat,
        lng: body.lng,
        notes: body.notes ? sanitizeText(body.notes) : null,
        contact_phone: body.contact_phone ? sanitizePhone(body.contact_phone) : null,
        status: 'checked_in',
        last_checkin: new Date().toISOString(),
        auto_expire_at: expireAt,
      })
      .select('id, display_name, status, last_checkin, auto_expire_at')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error al registrar' }, { status: 500 })
    }

    return NextResponse.json({ success: true, presence: data })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
