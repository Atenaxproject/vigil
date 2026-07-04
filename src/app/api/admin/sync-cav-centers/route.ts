import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  buildCAVAddress,
  buildCAVExternalId,
  CAV_SOURCE,
  geocodeCAVAddress,
  getAllCAVCenters,
  inferCAVRegionScope,
  sleep,
} from '@/lib/cav-import'

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

async function syncCAVCenters() {
  const centers = await getAllCAVCenters()
  if (!centers.length) {
    return NextResponse.json({ imported: 0, total: 0, geocoded: 0, skipped: 0, failed: 0 })
  }

  const supabase = createAdminClient()

  let geocoded = 0
  let skipped = 0
  let imported = 0
  let failed = 0

  for (const row of centers) {
    const title = row.organizacion
    const address = buildCAVAddress(row)
    const regionScope = inferCAVRegionScope(row.pais)
    const externalId = buildCAVExternalId(row)

    await sleep(1100)
    const coords = await geocodeCAVAddress(row, regionScope)
    if (!coords) {
      console.warn(`Could not geocode CAV center: ${address}`)
      skipped++
      continue
    }
    geocoded++

    const payload = {
      type: 'collection_point' as const,
      category: 'other' as const,
      title,
      description: address,
      lat: coords.lat,
      lng: coords.lng,
      estado: row.estado || null,
      municipio: row.ciudad || null,
      organizer_name: row.organizacion,
      source: CAV_SOURCE,
      verified: false,
      status: 'active' as const,
      region_scope: regionScope,
      external_id: externalId,
    }

    const { error } = await supabase.from('map_markers').upsert(payload, { onConflict: 'external_id' })
    if (error) {
      console.error('CAV upsert failed:', error.message)
      failed++
    } else {
      imported++
    }
  }

  const result = {
    total: centers.length,
    geocoded,
    imported,
    skipped,
    failed,
    estimatedDuration: `${(centers.length * 1.1).toFixed(0)} seconds`,
  }

  console.log('CAV centro sync complete:', result)
  return NextResponse.json(result)
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    return await syncCAVCenters()
  } catch {
    return NextResponse.json({ error: 'sync_failed', imported: 0 }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    return await syncCAVCenters()
  } catch {
    return NextResponse.json({ error: 'sync_failed', imported: 0 }, { status: 500 })
  }
}
