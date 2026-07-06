import { NextResponse } from 'next/server'
import { getDTVMetrics, isDTVConfigured } from '@/lib/dtv-api'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET() {
  if (!isDTVConfigured()) {
    return NextResponse.json({
      totalPersonas: 0,
      totalCentros: 0,
      totalListas: 0,
      lastUpdated: new Date().toISOString(),
      source: 'desaparecidosterremotovenezuela.com',
      available: false,
    })
  }

  try {
    const metrics = await getDTVMetrics()
    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    })
  } catch {
    return NextResponse.json({
      totalPersonas: 0,
      totalCentros: 0,
      totalListas: 0,
      lastUpdated: new Date().toISOString(),
      source: 'desaparecidosterremotovenezuela.com',
      available: false,
    })
  }
}
