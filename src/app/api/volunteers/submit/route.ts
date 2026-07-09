import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isSafeHttpUrl, isWithinBounds, sanitizePhone, sanitizeText } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

const schema = z.object({
  full_name: z.string().min(2).max(200),
  skills: z.array(z.string()).min(1).max(10),
  languages: z.array(z.string()).min(1).max(10),
  location: z.string().min(2).max(500),
  lat: z.number().optional(),
  lng: z.number().optional(),
  availability: z.enum(['immediate', 'this_week', 'remote_only', 'on_request']),
  contact_phone: z.string().max(25).optional(),
  contact_whatsapp: z.string().max(25).optional(),
  contact_email: z.string().email().max(200).optional(),
  specialization: z.string().max(200).optional(),
  equipment: z.array(z.string()).max(10).default([]),
  remote_available: z.boolean().default(false),
  verification_url: z.string().url().max(500).optional().or(z.literal('')),
  credential_note: z.string().max(300).optional(),
  public_display: z.boolean().default(true),
})

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json())

    if (body.lat !== undefined && body.lng !== undefined) {
      if (!isWithinBounds(body.lat, body.lng)) {
        return NextResponse.json({ error: 'Coordenadas fuera de Venezuela' }, { status: 400 })
      }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('volunteers')
      .insert({
        full_name: sanitizeText(body.full_name),
        skills: body.skills,
        languages: body.languages,
        location: sanitizeText(body.location),
        lat: body.lat ?? null,
        lng: body.lng ?? null,
        availability: body.availability,
        contact_phone: body.contact_phone ? sanitizePhone(body.contact_phone) : null,
        contact_whatsapp: body.contact_whatsapp ? sanitizePhone(body.contact_whatsapp) : null,
        contact_email: body.contact_email ? sanitizeText(body.contact_email) : null,
        specialization: body.specialization ? sanitizeText(body.specialization) : null,
        equipment: body.equipment,
        remote_available: body.remote_available,
        verification_url: body.verification_url ? isSafeHttpUrl(body.verification_url) : null,
        credential_note: body.credential_note ? sanitizeText(body.credential_note) : null,
        public_display: body.public_display,
        active: true,
      })
      .select('id, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }

    return NextResponse.json({ success: true, record: data })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
