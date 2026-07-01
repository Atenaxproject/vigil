import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/security/validate'
import type { PublicMissingPerson } from '@/types/vigil.types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  const estado = request.nextUrl.searchParams.get('estado')?.trim()

  if ((!q || q.length < 2) && !estado) {
    return NextResponse.json({ results: [] as PublicMissingPerson[] })
  }

  try {
    const supabase = await createClient()

    let query = supabase.from('public_missing_persons').select('*')

    if (q && q.length >= 2) {
      const safeQuery = sanitizeText(q)
      query = query.ilike('full_name', `%${safeQuery}%`)
    }

    if (estado) {
      const safeEstado = sanitizeText(estado === 'Caracas' ? 'Distrito Capital' : estado)
      query = query.eq('estado', safeEstado)
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(50)

    if (error) {
      return NextResponse.json({ results: [] as PublicMissingPerson[] })
    }

    return NextResponse.json({ results: data ?? [] })
  } catch {
    return NextResponse.json({ results: [] as PublicMissingPerson[] })
  }
}
