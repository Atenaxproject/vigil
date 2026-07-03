import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/auth'
import { sanitizeText } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('property_assessments')
    .select(
      'id, estado, municipio, request_type, tag_status, status, ai_priority_flag, created_at, danger_indicators, description, assigned_to, contact_name'
    )
    .in('status', ['open', 'assigned'])
    .eq('flagged', false)
    .order('ai_priority_flag', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: 'Error al cargar' }, { status: 500 })
  }

  const { data: engineers } = await admin
    .from('volunteers')
    .select('id, full_name, skills')
    .contains('skills', ['structural_engineer'])
    .eq('active', true)
    .limit(20)

  return NextResponse.json({ queue: data ?? [], engineers: engineers ?? [] })
}

const assignSchema = z.object({
  id: z.string().uuid(),
  assigned_to: z.string().uuid().nullable(),
})

const tagSchema = z.object({
  id: z.string().uuid(),
  tag_status: z.enum(['green', 'yellow', 'red']),
  tag_note: z.string().min(5).max(1000),
  tag_assigned_by: z.string().uuid().optional(),
})

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const admin = createAdminClient()

  if (body.action === 'assign') {
    const parsed = assignSchema.parse(body)
    const { error } = await admin
      .from('property_assessments')
      .update({
        assigned_to: parsed.assigned_to,
        status: parsed.assigned_to ? 'assigned' : 'open',
      })
      .eq('id', parsed.id)

    if (error) return NextResponse.json({ error: 'Error al asignar' }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (body.action === 'tag') {
    const parsed = tagSchema.parse(body)
    const { error } = await admin
      .from('property_assessments')
      .update({
        tag_status: parsed.tag_status,
        tag_note: sanitizeText(parsed.tag_note),
        tag_assigned_at: new Date().toISOString(),
        tag_assigned_by: parsed.tag_assigned_by ?? null,
        status: 'completed',
      })
      .eq('id', parsed.id)

    if (error) return NextResponse.json({ error: 'Error al etiquetar' }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
}
