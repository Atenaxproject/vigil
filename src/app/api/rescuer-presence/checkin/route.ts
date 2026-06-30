import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(['checked_in', 'needs_assistance', 'signed_off']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json())
    const supabase = await createClient()
    const expireAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()

    const updates: Record<string, string> = {
      last_checkin: new Date().toISOString(),
      auto_expire_at: expireAt,
    }
    if (body.status) {
      updates.status = body.status
    } else {
      updates.status = 'checked_in'
    }

    const { data, error } = await supabase
      .from('rescuer_presence')
      .update(updates)
      .eq('id', body.id)
      .select('id, status, last_checkin, auto_expire_at')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
    }

    return NextResponse.json({ success: true, presence: data })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
