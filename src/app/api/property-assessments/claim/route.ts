import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('property_assessments')
    .select(
      'id, estado, municipio, request_type, tag_status, status, description, created_at, tag_assigned_at, relocation_exchange_id, claim_token'
    )
    .eq('claim_token', token)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    assessment: {
      id: data.id,
      estado: data.estado,
      municipio: data.municipio,
      request_type: data.request_type,
      tag_status: data.tag_status,
      status: data.status,
      description: data.description,
      created_at: data.created_at,
      tag_assigned_at: data.tag_assigned_at,
      has_relocation_link: Boolean(data.relocation_exchange_id),
    },
  })
}
