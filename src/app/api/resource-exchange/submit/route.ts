import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isWithinBounds, sanitizePhone, sanitizeText } from '@/lib/security/validate'
import { CRISIS_CONFIG } from '@/config/crisis.config'

export const dynamic = 'force-dynamic'

const schema = z.object({
  entry_type: z.enum(['offering', 'requesting']),
  category: z.enum(['goods', 'shelter', 'transport', 'skills', 'volunteer', 'equipment', 'money']),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  quantity: z.string().max(200).optional(),
  location: z.string().min(2).max(500),
  lat: z.number().optional(),
  lng: z.number().optional(),
  contact_method: z.enum(['whatsapp', 'phone', 'email', 'vigil']),
  contact_value: z.string().min(3).max(200).optional(),
  languages: z.array(z.string().max(50)).max(10).default([]),
  available_until: z.string().optional(),
  urgent: z.boolean().default(false),
})

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json())

    if (body.lat !== undefined && body.lng !== undefined) {
      if (!isWithinBounds(body.lat, body.lng)) {
        return NextResponse.json({ error: 'Coordenadas fuera de Venezuela' }, { status: 400 })
      }
    }

    if (body.contact_method !== 'vigil' && !body.contact_value) {
      return NextResponse.json({ error: 'Contacto requerido' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('resource_exchange')
      .insert({
        entry_type: body.entry_type,
        category: body.category,
        title: sanitizeText(body.title),
        description: sanitizeText(body.description),
        quantity: body.quantity ? sanitizeText(body.quantity) : null,
        location: sanitizeText(body.location),
        lat: body.lat ?? null,
        lng: body.lng ?? null,
        contact_method: body.contact_method,
        contact_value:
          body.contact_method === 'email'
            ? sanitizeText(body.contact_value ?? '')
            : body.contact_value
              ? sanitizePhone(body.contact_value)
              : null,
        languages: body.languages,
        available_until: body.available_until ?? null,
        urgent: body.urgent,
        status: 'active',
      })
      .select('id, entry_type, category, title, status, created_at, claim_token')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }

    let matchCount = 0
    if (body.entry_type === 'requesting') {
      const oppositeType = 'offering'
      const { count } = await supabase
        .from('resource_exchange')
        .select('id', { count: 'exact', head: true })
        .eq('entry_type', oppositeType)
        .eq('category', body.category)
        .eq('status', 'active')
        .eq('flagged', false)

      matchCount = count ?? 0
    }

    const claimUrl = `${CRISIS_CONFIG.siteUrl}/mi-intercambio/${data.claim_token}`

    return NextResponse.json({ success: true, record: data, matchCount, claimUrl })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
