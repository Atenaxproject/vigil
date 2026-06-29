import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildPfifXml, toPfifPerson } from '@/lib/pfif'
import type { PublicMissingPerson } from '@/types/vigil.types'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('public_missing_persons')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(500)

    if (error) {
      return new NextResponse(buildPfifXml([]), {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      })
    }

    const persons = ((data ?? []) as PublicMissingPerson[]).map(toPfifPerson)
    const xml = buildPfifXml(persons)

    return new NextResponse(xml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    })
  } catch {
    return new NextResponse(buildPfifXml([]), {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    })
  }
}
