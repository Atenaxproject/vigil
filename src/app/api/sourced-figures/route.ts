import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/** Public read of Studio-editable sourced figures (prompt 63). */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('sourced_figures')
      .select(
        'key, label_es, label_en, value, source, source_url, verified_at, is_official, category, sort_order'
      )
      .eq('active', true)
      .order('sort_order')

    if (error) {
      return NextResponse.json({ figures: [], available: false, error: error.message }, { status: 200 })
    }

    return NextResponse.json(
      { figures: data ?? [], available: true, lastUpdated: new Date().toISOString() },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  } catch {
    return NextResponse.json({ figures: [], available: false })
  }
}
