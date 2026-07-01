import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDTVCentros } from '@/lib/dtv-api'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-secret')
  if (!authHeader || authHeader !== process.env.VIGIL_ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const centros = await getDTVCentros()
    if (!centros?.length) {
      return NextResponse.json({ imported: 0, total: 0, skipped: true })
    }

    const supabase = createAdminClient()
    let imported = 0

    for (const centro of centros) {
      const title = centro.nombre || centro.name
      const lat = centro.lat ?? centro.latitud
      const lng = centro.lng ?? centro.longitud

      if (!title || lat == null || lng == null) continue

      const { data: existing } = await supabase
        .from('map_markers')
        .select('id')
        .eq('title', title)
        .eq('lat', lat)
        .eq('lng', lng)
        .eq('source', 'desaparecidosterremotovenezuela.com')
        .maybeSingle()

      const payload = {
        type: 'collection_point' as const,
        title,
        description: centro.descripcion ?? '',
        lat,
        lng,
        source: 'desaparecidosterremotovenezuela.com',
        verified: true,
        status: 'active' as const,
      }

      if (existing?.id) {
        const { error } = await supabase.from('map_markers').update(payload).eq('id', existing.id)
        if (!error) imported++
      } else {
        const { error } = await supabase.from('map_markers').insert(payload)
        if (!error) imported++
      }
    }

    return NextResponse.json({ imported, total: centros.length })
  } catch {
    return NextResponse.json({ error: 'sync_failed', imported: 0 }, { status: 500 })
  }
}
