import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { sanitizeText } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

const tokenSchema = z.string().uuid()

const patchSchema = z.object({
  status: z.enum(['missing', 'found_alive', 'found_deceased', 'unverified']).optional(),
  notes: z.string().max(2000).optional(),
})

async function getByToken(token: string) {
  const admin = createAdminClient()
  const { data: person, error } = await admin
    .from('missing_persons')
    .select(
      'id, full_name, age, gender, photo_url, last_seen_location, last_seen_at, status, notes, contact_name, contact_phone, contact_whatsapp, contact_email, claim_token, created_at, updated_at'
    )
    .eq('claim_token', token)
    .is('archived_at', null)
    .single()

  if (error || !person) return null

  const [{ data: notes }, { data: contactRequests }] = await Promise.all([
    admin
      .from('missing_person_notes')
      .select('id, author_name, note_type, message, created_at')
      .eq('missing_person_id', person.id)
      .eq('flagged', false)
      .order('created_at', { ascending: false }),
    admin
      .from('contact_requests')
      .select('id, requester_name, requester_phone, requester_relationship, message, viewed, created_at')
      .eq('missing_person_id', person.id)
      .order('created_at', { ascending: false }),
  ])

  return { person, notes: notes ?? [], contactRequests: contactRequests ?? [] }
}

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 })
  }

  const token = request.nextUrl.searchParams.get('token')
  const parsed = tokenSchema.safeParse(token)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
  }

  try {
    const result = await getByToken(parsed.data)
    if (!result) {
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const token = tokenSchema.parse(body.token)
    const updates = patchSchema.parse(body)

    const existing = await getByToken(token)
    if (!existing) {
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 })
    }

    const admin = createAdminClient()
    const patch: Record<string, string> = {}
    if (updates.status) patch.status = updates.status
    if (updates.notes !== undefined) patch.notes = sanitizeText(updates.notes)

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
    }

    const { error } = await admin.from('missing_persons').update(patch).eq('claim_token', token)
    if (error) {
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const token = tokenSchema.parse(body.token)
    const requestIds = z.array(z.string().uuid()).parse(body.request_ids ?? [])

    const existing = await getByToken(token)
    if (!existing) {
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 })
    }

    if (requestIds.length === 0) {
      return NextResponse.json({ success: true })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from('contact_requests')
      .update({ viewed: true })
      .eq('missing_person_id', existing.person.id)
      .in('id', requestIds)

    if (error) {
      return NextResponse.json({ error: 'Error al marcar como visto' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
