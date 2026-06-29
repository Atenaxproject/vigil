import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/security/validate'
import type { PublicMissingPerson } from '@/types/vigil.types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] as PublicMissingPerson[] })
  }

  try {
    const supabase = await createClient()
    const safeQuery = sanitizeText(q)

    const { data, error } = await supabase
      .from('public_missing_persons')
      .select('*')
      .ilike('full_name', `%${safeQuery}%`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ results: [] as PublicMissingPerson[] })
    }

    return NextResponse.json({ results: data ?? [] })
  } catch {
    return NextResponse.json({ results: [] as PublicMissingPerson[] })
  }
}
