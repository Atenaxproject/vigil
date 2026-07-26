import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sanitizeText } from '@/lib/security/validate'
import { notifyNewFeedback } from '@/lib/email/notify'
import { REMOVAL_REQUEST_MARKER } from '@/lib/removal-request'

export const dynamic = 'force-dynamic'

const schema = z.object({
  missing_person_id: z.string().uuid(),
  requester_name: z.string().min(2).max(200),
  requester_contact: z.string().min(3).max(200),
  requester_relationship: z.string().min(2).max(100),
  message: z.string().min(5).max(2000),
  is_minor_record: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json())
    const supabase = await createClient()

    const { data: person } = await supabase
      .from('public_missing_persons')
      .select('id, full_name, age')
      .eq('id', body.missing_person_id)
      .single()

    if (!person) {
      return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 })
    }

    const name = sanitizeText(body.requester_name)
    const contact = sanitizeText(body.requester_contact)
    const relationship = sanitizeText(body.requester_relationship)
    const detail = sanitizeText(body.message)
    const minorHint =
      body.is_minor_record === true ||
      (typeof person.age === 'number' && person.age < 18)

    const composed = [
      REMOVAL_REQUEST_MARKER,
      minorHint ? 'record_class: minor_or_likely_minor' : 'record_class: general',
      `person_id: ${person.id}`,
      `person_name: ${sanitizeText(person.full_name)}`,
      `requester_name: ${name}`,
      `requester_relationship: ${relationship}`,
      `requester_contact: ${contact}`,
      '',
      detail,
    ].join('\n')

    let writer
    try {
      writer = createAdminClient()
    } catch {
      writer = supabase
    }

    // Reuse the existing privacy-preserving feedback admin queue (same path as
    // general feedback / bad_number). Distinct type = marker + entry_id; no
    // schema change. contact_requests has no request_type column.
    const { error } = await writer.from('feedback').insert({
      category: 'other',
      message: composed,
      contact_email: contact.includes('@') ? contact.slice(0, 200) : null,
      page_context: `/buscar/${person.id}`,
      entry_id: person.id,
    })

    if (error) {
      console.error('removal_request insert failed:', error.message)
      return NextResponse.json({ error: 'Error al enviar solicitud' }, { status: 500 })
    }

    try {
      await notifyNewFeedback({
        category: 'removal_request',
        message: composed,
        contact_email: contact.includes('@') ? contact : undefined,
        page_context: `/buscar/${person.id}`,
      })
    } catch (emailError) {
      console.error('Removal request email notification failed:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
