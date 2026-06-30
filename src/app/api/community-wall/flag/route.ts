import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const schema = z.object({
  id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json())
    const supabase = await createClient()

    const { error } = await supabase.rpc('flag_community_wall_message', { msg_id: body.id })

    if (error) {
      return NextResponse.json({ error: 'Error al marcar mensaje' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
