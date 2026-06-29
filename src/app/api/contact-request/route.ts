import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { sanitizePhone, sanitizeText } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

const schema = z.object({
  missing_person_id: z.string().uuid(),
  requester_name: z.string().min(2).max(200),
  requester_phone: z.string().min(6).max(25),
  requester_relationship: z.string().min(2).max(100),
  message: z.string().max(1000).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json())
    const supabase = await createClient()

    const { data: person } = await supabase
      .from('public_missing_persons')
      .select('id')
      .eq('id', body.missing_person_id)
      .single()

    if (!person) {
      return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 })
    }

    const { error } = await supabase.from('contact_requests').insert({
      missing_person_id: body.missing_person_id,
      requester_name: sanitizeText(body.requester_name),
      requester_phone: sanitizePhone(body.requester_phone),
      requester_relationship: sanitizeText(body.requester_relationship),
      message: body.message ? sanitizeText(body.message) : null,
    })

    if (error) {
      return NextResponse.json({ error: 'Error al enviar solicitud' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
