import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { RegionScope } from '@/types/vigil.types'

export const dynamic = 'force-dynamic'

const PUBLIC_SELECT =
  'id, entry_type, category, title, description, quantity, location, languages, available_until, urgent, status, verified, created_at, updated_at'

export async function GET(request: NextRequest) {
  const regionScope = (request.nextUrl.searchParams.get('region_scope') ??
    'venezuela') as RegionScope

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('resource_exchange')
      .select(PUBLIC_SELECT)
      .eq('status', 'active')
      .eq('flagged', false)
      .eq('region_scope', regionScope)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: 'Error al cargar' }, { status: 500 })
    }

    return NextResponse.json({ entries: data ?? [] })
  } catch {
    return NextResponse.json({ entries: [] })
  }
}
