import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isWithinBounds, sanitizePhone, sanitizeText } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

const postSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  category: z.enum([
    'donation_drive',
    'volunteer_meetup',
    'distribution',
    'info_session',
    'memorial',
    'other',
  ]),
  starts_at: z.string().min(1),
  ends_at: z.string().optional(),
  location_label: z.string().min(2).max(500),
  lat: z.number().optional(),
  lng: z.number().optional(),
  organizer_name: z.string().min(2).max(200).optional(),
  organizer_contact: z.string().max(100).optional(),
})

export async function GET(request: NextRequest) {
  const upcoming = request.nextUrl.searchParams.get('upcoming') !== 'false'
  const category = request.nextUrl.searchParams.get('category')

  try {
    const supabase = await createClient()
    let query = supabase
      .from('events')
      .select(
        'id, title, description, category, starts_at, ends_at, location_label, lat, lng, organizer_name, verified, created_at'
      )
      .eq('flagged', false)
      .order('starts_at', { ascending: true })
      .limit(100)

    if (upcoming) {
      query = query.gte('starts_at', new Date().toISOString())
    }

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: 'Error al cargar eventos' }, { status: 500 })
    }

    return NextResponse.json({ events: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Error al cargar eventos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = postSchema.parse(await request.json())

    if (body.lat !== undefined && body.lng !== undefined) {
      if (!isWithinBounds(body.lat, body.lng)) {
        return NextResponse.json({ error: 'Coordenadas fuera de Venezuela' }, { status: 400 })
      }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: sanitizeText(body.title),
        description: body.description ? sanitizeText(body.description) : null,
        category: body.category,
        starts_at: body.starts_at,
        ends_at: body.ends_at ?? null,
        location_label: sanitizeText(body.location_label),
        lat: body.lat ?? null,
        lng: body.lng ?? null,
        organizer_name: body.organizer_name ? sanitizeText(body.organizer_name) : null,
        organizer_contact: body.organizer_contact ? sanitizePhone(body.organizer_contact) : null,
      })
      .select('id, title, category, starts_at, location_label, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error al guardar evento' }, { status: 500 })
    }

    return NextResponse.json({ success: true, event: data })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
