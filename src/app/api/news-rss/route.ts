import { NextResponse } from 'next/server'
import { getVenezuelaNews } from '@/lib/rss'

export const revalidate = 1800

export async function GET() {
  try {
    const items = await getVenezuelaNews(5)
    return NextResponse.json({
      lastUpdated: new Date().toISOString(),
      items,
    })
  } catch {
    return NextResponse.json({
      lastUpdated: new Date().toISOString(),
      items: [],
    })
  }
}
