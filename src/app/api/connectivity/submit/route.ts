import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getClientIp, hashIp, isWithinBounds, sanitizePhone, sanitizeText } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

const CONNECTIVITY_TYPES = ['starlink', 'cell', 'wifi'] as const
const ACCESS_LEVELS = ['public', 'rescue_only', 'ngo_only'] as const

const schema = z.object({
  title: z.string().min(2).max(200),
  location_description: z.string().min(2).max(500),
  connectivity_type: z.enum(CONNECTIVITY_TYPES),
  hours_schedule: z.string().min(2).max(200),
  access_level: z.enum(ACCESS_LEVELS),
  lat: z.number(),
  lng: z.number(),
  contact: z.string().min(3).max(100),
})

const TYPE_LABELS: Record<(typeof CONNECTIVITY_TYPES)[number], string> = {
  starlink: 'Starlink',
  cell: 'Señal celular restaurada',
  wifi: 'WiFi abierto',
}

const ACCESS_LABELS: Record<(typeof ACCESS_LEVELS)[number], string> = {
  public: 'Público',
  rescue_only: 'Solo equipos de rescate',
  ngo_only: 'Solo personal de ONG',
}

function buildDescription(
  connectivityType: (typeof CONNECTIVITY_TYPES)[number],
  hours: string,
  access: (typeof ACCESS_LEVELS)[number],
  location: string
): string {
  return [
    `Tipo: ${TYPE_LABELS[connectivityType]}`,
    `Horario: ${hours}`,
    `Acceso: ${ACCESS_LABELS[access]}`,
    `Ubicación: ${location}`,
  ].join(' · ')
}

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json())

    if (!isWithinBounds(body.lat, body.lng)) {
      return NextResponse.json({ error: 'Coordenadas fuera de Venezuela' }, { status: 400 })
    }

    const supabase = await createClient()
    const ipHash = hashIp(getClientIp(request.headers))

    const description = buildDescription(
      body.connectivity_type,
      sanitizeText(body.hours_schedule),
      body.access_level,
      sanitizeText(body.location_description)
    )

    const { data, error } = await supabase
      .from('map_markers')
      .insert({
        type: 'resource',
        category: 'comms',
        title: sanitizeText(body.title),
        description,
        lat: body.lat,
        lng: body.lng,
        contact: sanitizePhone(body.contact),
        verified: true,
        source: 'citizen',
        reporter_ip_hash: ipHash,
      })
      .select('id, title, lat, lng, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }

    return NextResponse.json({ success: true, marker: data })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
