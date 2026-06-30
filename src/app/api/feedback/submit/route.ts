import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/security/validate'
import { notifyNewFeedback } from '@/lib/email/notify'

export const dynamic = 'force-dynamic'

const schema = z.object({
  category: z.enum(['bug', 'feature_request', 'missing_info', 'question', 'other']),
  message: z.string().min(5).max(2000),
  contact_email: z.string().email().optional().or(z.literal('')),
  page_context: z.string().max(200).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json())
    const supabase = await createClient()

    const { error } = await supabase.from('feedback').insert({
      category: body.category,
      message: sanitizeText(body.message),
      contact_email: body.contact_email || null,
      page_context: body.page_context ?? null,
    })

    if (error) {
      return NextResponse.json({ error: 'Error al enviar' }, { status: 500 })
    }

    try {
      await notifyNewFeedback({
        category: body.category,
        message: body.message,
        contact_email: body.contact_email || undefined,
        page_context: body.page_context,
      })
    } catch (emailError) {
      console.error('Feedback email notification failed:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
