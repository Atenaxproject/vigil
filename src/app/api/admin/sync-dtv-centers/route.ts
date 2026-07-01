import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  DTV_SOURCE,
  getAllDTVCentros,
  getCentroAddress,
  inferCentroCategory,
  inferCentroMarkerType,
  isDTVConfigured,
} from '@/lib/dtv-api'
import { geocodeVenezuela, sleep } from '@/lib/geocode-venezuela'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

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
    return NextResponse.json({ imported: 0, total: 0, geocoded: 0, skipped: 0, failed: 0 })
  }

  const supabase = createAdminClient()

  let geocoded = 0
  let skipped = 0
  let imported = 0
  let failed = 0

  for (const centro of centros) {
    const title = centro.nombre || centro.name
    const address = getCentroAddress(centro)

    if (!title || !address) {
      skipped++
      continue
    }

    let lat = centro.lat ?? centro.latitud
    let lng = centro.lng ?? centro.longitud

    if (lat == null || lng == null) {
      await sleep(1100)
      const coords = await geocodeVenezuela(address)
      if (!coords) {
        console.warn(`Could not geocode: ${address}`)
        skipped++
        continue
      }
      lat = coords.lat
      lng = coords.lng
      geocoded++
    }

    const markerType = inferCentroMarkerType(centro)
    const category = inferCentroCategory(centro)
    const externalId = centro.id ? `dtv-centro-${centro.id}` : null

    const payload = {
      type: markerType,
      category,
      title,
      description: address,
      lat,
      lng,
      source: DTV_SOURCE,
      verified: true,
      status: 'active' as const,
      ...(externalId ? { external_id: externalId } : {}),
    }

    if (externalId) {
      const { error } = await supabase.from('map_markers').upsert(payload, { onConflict: 'external_id' })
      if (error) {
        console.error('Supabase upsert failed:', error.message)
        failed++
      } else {
        imported++
      }
      continue
    }

    const { data: existing } = await supabase
      .from('map_markers')
      .select('id')
      .eq('title', title)
      .eq('lat', lat)
      .eq('lng', lng)
      .eq('source', DTV_SOURCE)
      .maybeSingle()

    if (existing?.id) {
      const { error } = await supabase.from('map_markers').update(payload).eq('id', existing.id)
      if (error) failed++
      else imported++
    } else {
      const { error } = await supabase.from('map_markers').insert(payload)
      if (error) failed++
      else imported++
    }
  }

  const result = {
    total: centros.length,
    geocoded,
    imported,
    skipped,
    failed,
    estimatedDuration: `${(centros.length * 1.1).toFixed(0)} seconds`,
  }

  console.log('DTV centro sync complete:', result)
  return NextResponse.json(result)
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
