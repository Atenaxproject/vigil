import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { isValidAdminCookie } from '@/lib/admin-gate'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!isValidAdminCookie(request.cookies.get('vigil_admin_gate')?.value)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      return NextResponse.json({ error: 'Error al cargar' }, { status: 500 })
    }

    return NextResponse.json({ items: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['new', 'reviewing', 'resolved', 'wont_fix']),
})

export async function PATCH(request: NextRequest) {
  if (!isValidAdminCookie(request.cookies.get('vigil_admin_gate')?.value)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = patchSchema.parse(await request.json())
    const supabase = createAdminClient()
    const { error } = await supabase.from('feedback').update({ status: body.status }).eq('id', body.id)

    if (error) {
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
