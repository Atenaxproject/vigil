import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { sanitizePhone, sanitizeText } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

const schema = z.object({
  resource_exchange_id: z.string().uuid(),
  requester_name: z.string().min(2).max(200),
  requester_phone: z.string().min(6).max(25),
  message: z.string().max(1000).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json())
    const supabase = await createClient()

    const { data: entry } = await supabase
      .from('resource_exchange')
      .select('id')
      .eq('id', body.resource_exchange_id)
      .eq('flagged', false)
      .neq('status', 'expired')
      .single()

    if (!entry) {
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 })
    }

    const { error } = await supabase.from('resource_exchange_contact_requests').insert({
      resource_exchange_id: body.resource_exchange_id,
      requester_name: sanitizeText(body.requester_name),
      requester_phone: sanitizePhone(body.requester_phone),
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
