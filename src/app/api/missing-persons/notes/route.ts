import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

const postSchema = z.object({
  missing_person_id: z.string().uuid(),
  author_name: z.string().min(2).max(100),
  note_type: z.enum(['sighting', 'status_update', 'encouragement', 'correction']),
  message: z.string().min(3).max(2000),
})

export async function GET(request: NextRequest) {
  const personId = request.nextUrl.searchParams.get('person_id')
  if (!personId) {
    return NextResponse.json({ error: 'person_id required' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('missing_person_notes')
      .select('id, missing_person_id, author_name, note_type, message, created_at')
      .eq('missing_person_id', personId)
      .eq('flagged', false)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: 'Error al cargar notas' }, { status: 500 })
    }

    return NextResponse.json({ notes: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Error al cargar notas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = postSchema.parse(await request.json())
    const supabase = await createClient()

    const { data: person } = await supabase
      .from('missing_persons')
      .select('id')
      .eq('id', body.missing_person_id)
      .eq('flagged', false)
      .single()

    if (!person) {
      return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('missing_person_notes')
      .insert({
        missing_person_id: body.missing_person_id,
        author_name: sanitizeText(body.author_name),
        note_type: body.note_type,
        message: sanitizeText(body.message),
      })
      .select('id, author_name, note_type, message, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error al guardar nota' }, { status: 500 })
    }

    return NextResponse.json({ success: true, note: data })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
