import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Condiciones de lluvia y ladera — Vigil',
  description:
    'Lluvia observada y pronóstico. Vigil no emite alertas — consulta INAMEH y Protección Civil.',
}

async function isAmenazasEnabled(): Promise<boolean> {
  if (process.env.VIGIL_AMENAZAS_PUBLIC_ENABLED === 'false') return false
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'amenazas_public_enabled')
      .maybeSingle()
    if (data?.value === false || data?.value === 'false') return false
    return true
  } catch {
    return true
  }
}

/** Open-Meteo rainfall for priority slope states — conditions only, no Vigil risk score. */
async function fetchRain(lat: number, lng: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum&past_days=3&forecast_days=1&timezone=America%2FCaracas`
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } })
    if (!res.ok) return null
    const data = (await res.json()) as {
      daily?: { time?: string[]; precipitation_sum?: number[] }
    }
    const times = data.daily?.time ?? []
    const precip = data.daily?.precipitation_sum ?? []
    return times.map((t, i) => ({ date: t, mm: precip[i] ?? 0 }))
  } catch {
    return null
  }
}

const PRIORITY = [
  { id: 'la-guaira', name: 'La Guaira', lat: 10.6, lng: -66.93 },
  { id: 'distrito', name: 'Distrito Capital', lat: 10.48, lng: -66.9 },
  { id: 'miranda', name: 'Miranda', lat: 10.25, lng: -66.5 },
] as const

export default async function AmenazasPage() {
  const t = await getTranslations('amenazas')
  const enabled = await isAmenazasEnabled()

  if (!enabled) {
    return (
      <main className="mx-auto max-w-2xl p-4 pb-24">
        <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
        <p className="mt-4 text-[16px] text-vigil-muted">{t('disabled')}</p>
      </main>
    )
  }

  const rainByZone = await Promise.all(
    PRIORITY.map(async (z) => ({ ...z, rain: await fetchRain(z.lat, z.lng) }))
  )

  return (
    <main className="mx-auto max-w-2xl p-4 pb-24">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-2 text-[16px] text-vigil-body">{t('subtitle')}</p>

      <div className="mt-4 rounded-card border border-status-unverified bg-status-unverified-bg p-4 text-[16px] text-amber-900">
        <p className="font-medium">{t('boundary')}</p>
        <p className="mt-2">{t('boundaryDetail')}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href="https://www.inameh.gob.ve/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white"
        >
          {t('inameh')}
        </a>
        <a
          href="https://www.proteccioncivil.gob.ve/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center rounded-input border border-slate-300 bg-white px-4 text-[16px] font-medium text-vigil-ink"
        >
          {t('proteccionCivil')}
        </a>
      </div>

      <section className="mt-8">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('rainfallTitle')}</h2>
        <p className="mt-1 text-[13px] text-vigil-muted">{t('rainfallSource')}</p>
        <ul className="mt-4 space-y-4">
          {rainByZone.map((z) => (
            <li key={z.id} className="rounded-card border border-slate-200 bg-white p-4">
              <p className="text-[16px] font-medium text-vigil-ink">{z.name}</p>
              {!z.rain ? (
                <p className="mt-2 text-[13px] text-vigil-muted">{t('unavailable')}</p>
              ) : (
                <ul className="mt-2 space-y-1 font-mono text-[13px] text-vigil-body">
                  {z.rain.map((r) => (
                    <li key={r.date}>
                      {r.date}: {r.mm.toFixed(1)} mm
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[16px] text-vigil-body">{t('slopeNote')}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-[16px]">
        <Link href="/preparacion" className="text-vigil-blue hover:underline">
          {t('prepLink')}
        </Link>
      </p>
    </main>
  )
}
