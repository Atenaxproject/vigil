import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  flagPropertyPhotoPriority,
  structurePropertyDescription,
} from '@/lib/ai/property-triage'
import { jitterCoordinates } from '@/lib/property-assessment'
import { stripExif, type UploadMime } from '@/lib/images/strip-exif'
import { getClientIp, hashIp, isWithinBounds, sanitizePhone, sanitizeText } from '@/lib/security/validate'
import { CRISIS_CONFIG } from '@/config/crisis.config'

export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
const MAX_BYTES = 5 * 1024 * 1024

const bodySchema = z.object({
  estado: z.string().min(2).max(100),
  municipio: z.string().max(100).optional(),
  exact_address: z.string().min(2).max(500),
  exact_lat: z.number(),
  exact_lng: z.number(),
  request_type: z.enum(['inspection', 'relocation_assistance', 'both']),
  danger_indicators: z.array(z.string()).max(10).default([]),
  description: z.string().min(10).max(2000),
  contact_name: z.string().min(2).max(200),
  contact_phone: z.string().max(25).optional(),
  contact_whatsapp: z.string().max(25).optional(),
  consent_given: z.literal(true),
  data_accuracy_confirmed: z.literal(true),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const raw = formData.get('payload')
    if (typeof raw !== 'string') {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const body = bodySchema.parse(JSON.parse(raw))

    if (!isWithinBounds(body.exact_lat, body.exact_lng)) {
      return NextResponse.json({ error: 'Coordenadas fuera de Venezuela' }, { status: 400 })
    }

    const approx = jitterCoordinates(body.exact_lat, body.exact_lng)
    const structured = await structurePropertyDescription(body.description)
    const structuredDescription = structured.text

    let photoUrl: string | null = null
    let aiPriorityFlag = false
    const photo = formData.get('photo')
    if (photo instanceof File && photo.size > 0) {
      if (!ALLOWED_TYPES.includes(photo.type as (typeof ALLOWED_TYPES)[number])) {
        return NextResponse.json({ error: 'Tipo de archivo no válido' }, { status: 400 })
      }
      if (photo.size > MAX_BYTES) {
        return NextResponse.json({ error: 'Archivo demasiado grande' }, { status: 400 })
      }

      // Strip EXIF (GPS included) before the bytes touch storage OR the AI —
      // a property photo is taken at the property, so its EXIF is the address
      // (76A). Orientation is baked into pixels first, see stripExif.
      const rawBytes = Buffer.from(await photo.arrayBuffer())
      const { buffer: cleanBytes, mime: cleanMime } = await stripExif(
        rawBytes,
        photo.type as UploadMime
      )
      const base64 = cleanBytes.toString('base64')
      aiPriorityFlag = await flagPropertyPhotoPriority(base64, cleanMime)

      try {
        const admin = createAdminClient()
        const path = `${crypto.randomUUID()}.${cleanMime === 'image/png' ? 'png' : cleanMime === 'image/webp' ? 'webp' : 'jpg'}`
        const { error: uploadError } = await admin.storage
          .from('property-assessment-photos')
          .upload(path, cleanBytes, { contentType: cleanMime, upsert: false })
        if (!uploadError) {
          const { data: signed } = await admin.storage
            .from('property-assessment-photos')
            .createSignedUrl(path, 60 * 60 * 24 * 7)
          photoUrl = signed?.signedUrl ?? path
        }
      } catch {
        /* storage optional — assessment still saved */
      }
    }

    const supabase = await createClient()
    const ipHash = hashIp(getClientIp(request.headers))

    const { data, error } = await supabase
      .from('property_assessments')
      .insert({
        estado: sanitizeText(body.estado),
        municipio: body.municipio ? sanitizeText(body.municipio) : null,
        approx_location_lat: approx.lat,
        approx_location_lng: approx.lng,
        request_type: body.request_type,
        danger_indicators: body.danger_indicators,
        description: sanitizeText(structuredDescription),
        exact_address: sanitizeText(body.exact_address),
        exact_lat: body.exact_lat,
        exact_lng: body.exact_lng,
        contact_name: sanitizeText(body.contact_name),
        contact_phone: body.contact_phone ? sanitizePhone(body.contact_phone) : null,
        contact_whatsapp: body.contact_whatsapp ? sanitizePhone(body.contact_whatsapp) : null,
        photo_url: photoUrl,
        ai_priority_flag: aiPriorityFlag,
        consent_given: true,
        data_accuracy_confirmed: true,
        reporter_ip_hash: ipHash,
        status: 'open',
        tag_status: 'unassessed',
      })
      .select('id, claim_token, tag_status, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }

    let relocationExchangeId: string | null = null
    if (
      body.request_type === 'relocation_assistance' ||
      body.request_type === 'both'
    ) {
      const { data: exchange } = await supabase
        .from('resource_exchange')
        .insert({
          entry_type: 'requesting',
          category: 'shelter',
          title: `Reubicación — ${sanitizeText(body.estado)}`,
          description: sanitizeText(
            `Solicitud vinculada a evaluación estructural. ${structuredDescription.slice(0, 500)}`
          ),
          location: sanitizeText(body.exact_address),
          lat: body.exact_lat,
          lng: body.exact_lng,
          contact_method: 'vigil',
          contact_value: null,
          languages: ['es'],
          urgent: aiPriorityFlag,
          status: 'active',
        })
        .select('id')
        .single()

      if (exchange?.id) {
        relocationExchangeId = exchange.id
        await supabase
          .from('property_assessments')
          .update({ relocation_exchange_id: exchange.id })
          .eq('id', data.id)
      }
    }

    const claimUrl = `${CRISIS_CONFIG.siteUrl}/mi-evaluacion/${data.claim_token}`

    return NextResponse.json({
      success: true,
      record: data,
      claimUrl,
      relocationExchangeId,
      /** False when NL assist was off (halted / unconfigured) — form still accepted. */
      nlAssistUsed: structured.assisted,
    })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
