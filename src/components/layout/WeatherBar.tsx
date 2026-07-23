'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronUp, Clock, Cloud, CloudLightning, CloudRain, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  return (
    <div
      className="border-b border-slate-200 bg-white px-4 py-1 text-[13px] text-vigil-muted"
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 lg:cursor-default lg:pointer-events-none"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-1 truncate">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {t('venezuela')}: {time}
          <span className={cn('lg:inline', expanded ? 'inline' : 'hidden')}>
            {data?.error && (
              <span className="text-status-unverified"> · {t('unavailable')}</span>
            )}
            {data?.locations.map((loc) => (
              <span key={loc.name}>
                {' '}
                · {loc.name} {loc.temp}°C <WeatherIcon condition={loc.condition} />
                {loc.precipProbability > 0 && (
                  <span className="text-vigil-muted"> ({loc.precipProbability}% {t('rain')})</span>
                )}
              </span>
            ))}
          </span>
        </span>
        <span className="shrink-0 lg:hidden">
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </span>
      </button>
    </div>
  )
}
