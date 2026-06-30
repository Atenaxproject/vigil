import { NextResponse } from 'next/server'

const LOCATIONS = [
  { name: 'Caracas', lat: 10.4806, lng: -66.9036 },
  { name: 'La Guaira', lat: 10.6014, lng: -66.9311 },
]

export const revalidate = 1800

function mapWeatherCode(code: number): 'clear' | 'cloudy' | 'rain' | 'storm' {
  if (code === 0 || code === 1) return 'clear'
  if (code >= 95) return 'storm'
  if (code >= 51 && code <= 67) return 'rain'
  if (code >= 80 && code <= 82) return 'rain'
  if (code >= 2 && code <= 48) return 'cloudy'
  return 'cloudy'
}

export async function GET() {
  try {
    const results = await Promise.all(
      LOCATIONS.map(async (loc) => {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}` +
          `&current=temperature_2m,precipitation_probability,weather_code` +
          `&timezone=America/Caracas`

        const res = await fetch(url, { next: { revalidate: 1800 } })
        if (!res.ok) throw new Error('weather fetch failed')
        const data = await res.json()
        return {
          name: loc.name,
          temp: Math.round(data.current.temperature_2m),
          precipProbability: data.current.precipitation_probability ?? 0,
          weatherCode: data.current.weather_code as number,
          condition: mapWeatherCode(data.current.weather_code as number),
        }
      })
    )

    const venezuelaTime = new Date().toLocaleString('es-VE', {
      timeZone: 'America/Caracas',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    return NextResponse.json({ locations: results, venezuelaTime })
  } catch {
    return NextResponse.json(
      {
        locations: [],
        venezuelaTime: new Date().toLocaleString('es-VE', {
          timeZone: 'America/Caracas',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        error: true,
      },
      { status: 503 }
    )
  }
}
