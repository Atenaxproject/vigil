import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export const dynamic = 'force-dynamic'

const tokenSchema = z.string().uuid()

async function getByToken(token: string) {
  const admin = createAdminClient()
  const { data: entry, error } = await admin
    .from('resource_exchange')
    .select(
      'id, entry_type, category, title, description, quantity, location, contact_method, contact_value, claim_token, status, created_at'
    )
    .eq('claim_token', token)
    .single()

  if (error || !entry) return null

  const { data: contactRequests } = await admin
    .from('resource_exchange_contact_requests')
    .select('id, requester_name, requester_phone, message, viewed, created_at')
    .eq('resource_exchange_id', entry.id)
    .order('created_at', { ascending: false })

  return { entry, contactRequests: contactRequests ?? [] }
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
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
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
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 })
    }

    if (requestIds.length === 0) {
      return NextResponse.json({ success: true })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from('resource_exchange_contact_requests')
      .update({ viewed: true })
      .eq('resource_exchange_id', existing.entry.id)
      .in('id', requestIds)

    if (error) {
      return NextResponse.json({ error: 'Error al marcar como visto' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
