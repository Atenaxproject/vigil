'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronUp, Clock, Cloud, CloudLightning, CloudRain, Sun } from 'lucide-react'

interface WeatherLocation {
  name: string
  temp: number
  precipProbability: number
  condition: 'clear' | 'cloudy' | 'rain' | 'storm'
}

interface WeatherResponse {
  locations: WeatherLocation[]
  venezuelaTime: string
  fetchedAt?: string
  error?: boolean
}

function caracasClock(): string {
  return new Date().toLocaleString('es-VE', {
    timeZone: 'America/Caracas',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function WeatherIcon({ condition }: { condition: WeatherLocation['condition'] }) {
  const className = 'inline h-3 w-3'
  switch (condition) {
    case 'clear':
      return <Sun className={className} aria-hidden />
    case 'rain':
      return <CloudRain className={className} aria-hidden />
    case 'storm':
      return <CloudLightning className={className} aria-hidden />
    default:
      return <Cloud className={className} aria-hidden />
  }
}

function LocationLine({ loc, rainLabel }: { loc: WeatherLocation; rainLabel: string }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1">
      <span>
        {loc.name} {loc.temp}°C
      </span>
      <WeatherIcon condition={loc.condition} />
      {loc.precipProbability > 0 && (
        <span className="text-vigil-muted">
          ({loc.precipProbability}% {rainLabel})
        </span>
      )}
    </span>
  )
}

export function WeatherBar() {
  const t = useTranslations('weather')
  // Local Caracas clock immediately — never ship "—" while waiting on Open-Meteo.
  const [time, setTime] = useState(caracasClock)
  const [data, setData] = useState<WeatherResponse | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setTime(caracasClock())
    const clock = setInterval(() => setTime(caracasClock()), 30_000)
    return () => clearInterval(clock)
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/weather', { cache: 'no-store' })
        const json = (await res.json()) as WeatherResponse
        setData(json)
        if (json.venezuelaTime) setTime(json.venezuelaTime)
      } catch {
        setData(null)
      }
    }

    void load()
    const interval = setInterval(load, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const hasLocations = Boolean(data?.locations?.length)
  // Collapsed: time is always fully visible; first location wraps onto a second
  // line (no truncate mid-word). Expand panel shows the full set.
  const firstLocation = hasLocations && !expanded ? data!.locations[0] : null

  return (
    <div
      className="border-b border-slate-200 bg-white px-4 py-1 text-[13px] text-vigil-muted"
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full min-h-[44px] items-center justify-between gap-2 text-left lg:min-h-0 lg:cursor-default lg:pointer-events-none"
        aria-expanded={expanded}
      >
        <span className="flex min-w-0 items-start gap-1">
          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="min-w-0">
            <span className="block whitespace-nowrap">
              {t('venezuela')}: {time}
            </span>
            {firstLocation && (
              <span className="mt-0.5 block whitespace-normal lg:hidden">
                {firstLocation.name} {firstLocation.temp}°C
              </span>
            )}
          </span>
        </span>
        <span className="shrink-0 lg:hidden" aria-hidden>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </span>
      </button>

      {/* Desktop: always show full wrapped locations */}
      <div className="hidden flex-wrap items-center gap-x-2 gap-y-1 pb-1 pl-5 lg:flex">
        {data?.error && <span className="text-status-unverified">{t('unavailable')}</span>}
        {data?.locations.map((loc) => (
          <span key={loc.name} className="inline-flex items-center gap-1">
            <span aria-hidden>·</span>
            <LocationLine loc={loc} rainLabel={t('rain')} />
          </span>
        ))}
      </div>

      {/* Mobile: expand to a full wrapped panel — no truncated single line */}
      {expanded && (
        <div className="flex flex-col gap-1 pb-2 pl-5 lg:hidden">
          {data?.error && <span className="text-status-unverified">{t('unavailable')}</span>}
          {hasLocations ? (
            data!.locations.map((loc) => (
              <LocationLine key={loc.name} loc={loc} rainLabel={t('rain')} />
            ))
          ) : (
            // Only after a completed fetch — not while `data` is still null (in flight)
            data != null && !data.error && (
              <span className="text-vigil-muted">{t('unavailable')}</span>
            )
          )}
        </div>
      )}
    </div>
  )
}
