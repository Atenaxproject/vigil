import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getClientIp, hashIp } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

const ZONES = [
  'La Guaira',
  'Distrito Capital',
  'Miranda',
  'Yaracuy',
  'Carabobo',
  'Aragua',
  'Falcón',
  'Zulia',
] as const

const SERVICES = ['electricidad', 'agua', 'gasolina', 'gas', 'senal'] as const
const STATUSES = ['disponible', 'intermitente', 'sin_servicio'] as const

/** Aggregation: min 3 reports in 6h; decay to "sin datos" after 12h (prompt 70). */
const MIN_REPORTS = 3
const WINDOW_HOURS = 6
const STALE_HOURS = 12

const reportSchema = z.object({
  zone_id: z.enum(ZONES),
  service_type: z.enum(SERVICES),
  status: z.enum(STATUSES),
})

async function isServiciosEnabled(): Promise<boolean> {
  if (process.env.VIGIL_SERVICIOS_PUBLIC_ENABLED === 'false') return false
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'servicios_public_enabled')
      .maybeSingle()
    if (data?.value === false || data?.value === 'false') return false
    return true
  } catch {
    return true
  }
}

export async function GET() {
  if (!(await isServiciosEnabled())) {
    return NextResponse.json({ enabled: false, zones: [] })
  }

  try {
    const supabase = await createClient()
    const since = new Date(Date.now() - STALE_HOURS * 60 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('service_reports')
      .select('zone_id, service_type, status, reported_at')
      .gte('reported_at', since)

    if (error) {
      return NextResponse.json({ enabled: true, zones: [], error: error.message })
    }

    const windowMs = WINDOW_HOURS * 60 * 60 * 1000
    const now = Date.now()
    type Agg = {
      counts: Record<string, number>
      latest: string
      n: number
    }
    const map = new Map<string, Agg>()

    for (const row of data ?? []) {
      const t = Date.parse(row.reported_at)
      if (now - t > windowMs) continue
      const key = `${row.zone_id}::${row.service_type}`
      const agg = map.get(key) ?? { counts: {} as Record<string, number>, latest: row.reported_at, n: 0 }
      const statusKey = String(row.status)
      agg.counts[statusKey] = (agg.counts[statusKey] ?? 0) + 1
      agg.n++
      if (Date.parse(row.reported_at) > Date.parse(agg.latest)) agg.latest = row.reported_at
      map.set(key, agg)
    }

    const zones = ZONES.map((zone_id) => ({
      zone_id,
      services: SERVICES.map((service_type) => {
        const agg = map.get(`${zone_id}::${service_type}`)
        if (!agg || agg.n < MIN_REPORTS) {
          return {
            service_type,
            status: 'sin_datos' as const,
            report_count: agg?.n ?? 0,
            last_report: agg?.latest ?? null,
          }
        }
        let bestStatus = 'intermitente'
        let best = 0
        for (const [s, c] of Object.entries(agg.counts)) {
          if (c > best) {
            best = c
            bestStatus = s
          }
        }
        return {
          service_type,
          status: bestStatus,
          report_count: agg.n,
          last_report: agg.latest,
        }
      }),
    }))

    return NextResponse.json({
      enabled: true,
      zones,
      thresholds: { minReports: MIN_REPORTS, windowHours: WINDOW_HOURS, staleHours: STALE_HOURS },
    })
  } catch {
    return NextResponse.json({ enabled: true, zones: [] })
  }
}

export async function POST(req: NextRequest) {
  if (!(await isServiciosEnabled())) {
    return NextResponse.json({ error: 'Feature disabled' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = reportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const ip = getClientIp(req.headers)
  const reporter_hash = hashIp(ip)

  // Rate limit: max 10 reports per hash per hour
  try {
    const admin = createAdminClient()
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await admin
      .from('service_reports')
      .select('*', { count: 'exact', head: true })
      .eq('reporter_hash', reporter_hash)
      .gte('reported_at', hourAgo)

    if ((count ?? 0) >= 10) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    const { error } = await admin.from('service_reports').insert({
      zone_id: parsed.data.zone_id,
      service_type: parsed.data.service_type,
      status: parsed.data.status,
      reporter_hash,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
