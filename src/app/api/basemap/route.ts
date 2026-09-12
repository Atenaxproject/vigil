import { NextResponse } from 'next/server'
import { buildBasemapUrl, readCartoApiKey } from '@/lib/basemap'

export const dynamic = 'force-dynamic'

/** Public tile-template URL (the CARTO key is visible on tile requests anyway). */
export function GET() {
  return NextResponse.json(
    { url: buildBasemapUrl(readCartoApiKey()) },
    { headers: { 'Cache-Control': 'public, max-age=300' } }
  )
}
