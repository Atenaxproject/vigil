import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAllDTVCentros, inferCentroMarkerType, isDTVConfigured } from '@/lib/dtv-api'

export const dynamic = 'force-dynamic'

const DTV_SOURCE = 'desaparecidosterremotovenezuela.com'

function isAuthorized(request: NextRequest): boolean {
  const adminSecret = process.env.VIGIL_ADMIN_SECRET
  const cronSecret = process.env.CRON_SECRET

  const adminHeader = request.headers.get('x-admin-secret')
  if (adminSecret && adminHeader === adminSecret) return true

  const auth = request.headers.get('authorization')
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true

  return process.env.NODE_ENV === 'development'
}

async function syncCentros() {
  if (!isDTVConfigured()) {
    return NextResponse.json({ imported: 0, total: 0, skipped: 'dtv_not_configured' })
  }

  const centros = await getAllDTVCentros()
  if (!centros.length) {
    return NextResponse.json({ imported: 0, total: 0, skipped: true })
  }

  const supabase = createAdminClient()
  let imported = 0

  for (const centro of centros) {
    const title = centro.nombre || centro.name
    const lat = centro.lat ?? centro.latitud
    const lng = centro.lng ?? centro.longitud

    if (!title || lat == null || lng == null) continue

    const markerType = inferCentroMarkerType(centro)

    const { data: existing } = await supabase
      .from('map_markers')
      .select('id')
      .eq('title', title)
      .eq('lat', lat)
      .eq('lng', lng)
      .eq('source', DTV_SOURCE)
      .maybeSingle()

    const payload = {
      type: markerType,
      title,
      description: centro.descripcion ?? '',
      lat,
      lng,
      source: DTV_SOURCE,
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
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    return await syncCentros()
  } catch {
    return NextResponse.json({ error: 'sync_failed', imported: 0 }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    return await syncCentros()
  } catch {
    return NextResponse.json({ error: 'sync_failed', imported: 0 }, { status: 500 })
  }
}
