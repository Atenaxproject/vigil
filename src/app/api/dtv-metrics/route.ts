import { NextResponse } from 'next/server'
import { getDTVMetrics, isDTVConfigured } from '@/lib/dtv-api'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const unavailable = () =>
  NextResponse.json({
    totalPersonas: 0,
    sinContacto: 0,
    localizados: 0,
    localizadosSinCentro: 0,
    localizadosConCentro: 0,
    totalCentros: 0,
    totalHospitales: 0,
    totalCentrosAcopio: 0,
    totalListas: 0,
    byEstado: [],
    lastUpdated: new Date().toISOString(),
    source: 'desaparecidosterremotovenezuela.com',
    available: false,
    fieldMapping: {
      totalPersonas: 'GET /personas item count',
      sinContacto: "persona.estado === 'sin-contacto'",
      localizados: "persona.estado === 'localizado'",
      estadoGeo: 'persona.ubicacion.estado',
    },
  })

export async function GET() {
  if (!isDTVConfigured()) return unavailable()

  try {
    const metrics = await getDTVMetrics()
    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    })
  } catch {
    return unavailable()
  }
}
