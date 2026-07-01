import { NextResponse } from 'next/server'
import { getDTVMetrics, isDTVConfigured } from '@/lib/dtv-api'

export const dynamic = 'force-dynamic'

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
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300',
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
