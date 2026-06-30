'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronUp, Cloud, CloudLightning, CloudRain, Sun } from 'lucide-react'
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
  error?: boolean
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
  const [data, setData] = useState<WeatherResponse | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/weather')
        const json = (await res.json()) as WeatherResponse
        setData(json)
      } catch {
        setData(null)
      }
    }

    void load()
    const interval = setInterval(load, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const time = data?.venezuelaTime ?? '—'

  return (
    <div
      className="border-b border-slate-200 bg-white px-4 py-1 text-[11px] text-vigil-muted"
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 lg:cursor-default lg:pointer-events-none"
        aria-expanded={expanded}
      >
        <span className="truncate">
          🕐 {t('venezuela')}: {time}
          <span className={cn('lg:inline', expanded ? 'inline' : 'hidden')}>
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
