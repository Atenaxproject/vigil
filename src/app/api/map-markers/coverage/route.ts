import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { isValidAdminCookie } from '@/lib/admin-gate'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/supabase/auth'

export const dynamic = 'force-dynamic'

const COVERAGE_STATES = ['uncovered', 'partial', 'covered', 'needs_reconfirmation'] as const

const schema = z.object({
  marker_id: z.string().uuid(),
  coverage_state: z.enum(COVERAGE_STATES),
})

/**
 * Update coverage_state on a need marker.
 * Authority (MVP): Vigil admin session OR feedback admin-gate cookie.
 * Org/acopio claim-token transitions are a Phase 2 follow-on.
 */
export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json())

    const gateCookie = request.cookies.get('vigil_admin_gate')?.value
    const supabaseAuth = await createClient()
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser()

    const allowed = isValidAdminCookie(gateCookie) || (user != null && isAdminUser(user))
    if (!allowed) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const admin = createAdminClient()
    const actor = user?.email ?? 'admin_gate'

    const { data: marker, error: fetchError } = await admin
      .from('map_markers')
      .select('id, type, status')
      .eq('id', body.marker_id)
      .single()

    if (fetchError || !marker) {
      return NextResponse.json({ error: 'Marcador no encontrado' }, { status: 404 })
    }
    if (marker.type !== 'need') {
      return NextResponse.json({ error: 'Solo aplica a necesidades' }, { status: 400 })
    }

    const patch: Record<string, unknown> = {
      coverage_state: body.coverage_state,
      coverage_updated_at: new Date().toISOString(),
      coverage_updated_by: actor,
    }

    // Covered needs leave the active map (status resolved) so volunteers
    // are not sent to satisfied pins.
    if (body.coverage_state === 'covered') {
      patch.status = 'resolved'
      patch.resolved_at = new Date().toISOString()
    } else if (marker.status === 'resolved') {
      patch.status = 'active'
      patch.resolved_at = null
    }

    const { data, error } = await admin
      .from('map_markers')
      .update(patch)
      .eq('id', body.marker_id)
      .select('id, coverage_state, coverage_updated_at, status')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
    }

    return NextResponse.json({ success: true, marker: data })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
