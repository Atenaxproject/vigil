import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/auth'
import { sanitizeText } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isAdminUser(user)) {
    return null
  }
  return user
}

export async function GET() {
  const user = await requireAdmin()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()

    const [queueRes, orgsRes, wallRes, mpRes] = await Promise.all([
      admin
        .from('moderation_queue')
        .select('id, table_name, record_id, reason, ai_confidence, status, notes, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(50),
      admin
        .from('organizations')
        .select('id, name, type, contact_email, contact_phone, website, created_at, region_scope')
        .eq('approved_by_admin', false)
        .eq('active', true)
        .order('created_at', { ascending: true })
        .limit(50),
      admin
        .from('community_wall')
        .select('id, author_name, message, category, flag_count, created_at')
        .eq('flagged', true)
        .order('created_at', { ascending: false })
        .limit(30),
      admin
        .from('missing_persons')
        .select('id, full_name, estado, flag_count, flagged, created_at')
        .or('flagged.eq.true,flag_count.gte.1')
        .is('archived_at', null)
        .order('flag_count', { ascending: false })
        .limit(30),
    ])

    return NextResponse.json({
      queue: queueRes.data ?? [],
      pendingOrgs: orgsRes.data ?? [],
      flaggedWall: wallRes.data ?? [],
      flaggedPersons: mpRes.data ?? [],
      errors: {
        queue: queueRes.error?.message ?? null,
        orgs: orgsRes.error?.message ?? null,
        wall: wallRes.error?.message ?? null,
        persons: mpRes.error?.message ?? null,
      },
    })
  } catch (err) {
    console.error('[admin/moderation] GET failed:', err)
    return NextResponse.json({ error: 'Error al cargar' }, { status: 500 })
  }
}

const reviewSchema = z.object({
  action: z.literal('review_queue'),
  id: z.string().uuid(),
  status: z.enum(['approved', 'rejected']),
  notes: z.string().max(1000).optional(),
})

const orgSchema = z.object({
  action: z.literal('approve_org'),
  id: z.string().uuid(),
  approved: z.boolean(),
})

const unflagSchema = z.object({
  action: z.enum(['unflag_wall', 'unflag_person', 'keep_flagged_wall', 'keep_flagged_person']),
  id: z.string().uuid(),
})

export async function PATCH(request: NextRequest) {
  const user = await requireAdmin()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const admin = createAdminClient()
    const reviewer = user.email ?? user.id

    if (body.action === 'review_queue') {
      const parsed = reviewSchema.parse(body)
      const { error } = await admin
        .from('moderation_queue')
        .update({
          status: parsed.status,
          reviewed_by: reviewer,
          reviewed_at: new Date().toISOString(),
          notes: parsed.notes ? sanitizeText(parsed.notes) : null,
        })
        .eq('id', parsed.id)
        .eq('status', 'pending')

      if (error) {
        return NextResponse.json({ error: 'Error al actualizar cola' }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    if (body.action === 'approve_org') {
      const parsed = orgSchema.parse(body)
      const { error } = await admin
        .from('organizations')
        .update({
          approved_by_admin: parsed.approved,
          active: parsed.approved,
        })
        .eq('id', parsed.id)

      if (error) {
        return NextResponse.json({ error: 'Error al actualizar organización' }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    const unflag = unflagSchema.parse(body)
    if (unflag.action === 'unflag_wall') {
      const { error } = await admin
        .from('community_wall')
        .update({ flagged: false, flag_count: 0 })
        .eq('id', unflag.id)
      if (error) return NextResponse.json({ error: 'Error al restaurar mensaje' }, { status: 500 })
      return NextResponse.json({ success: true })
    }
    if (unflag.action === 'keep_flagged_wall') {
      // Already flagged — no-op acknowledge (admin reviewed)
      return NextResponse.json({ success: true })
    }
    if (unflag.action === 'unflag_person') {
      const { error } = await admin
        .from('missing_persons')
        .update({ flagged: false, flag_count: 0 })
        .eq('id', unflag.id)
      if (error) return NextResponse.json({ error: 'Error al restaurar reporte' }, { status: 500 })
      return NextResponse.json({ success: true })
    }
    if (unflag.action === 'keep_flagged_person') {
      const { error } = await admin
        .from('missing_persons')
        .update({ flagged: true })
        .eq('id', unflag.id)
      if (error) return NextResponse.json({ error: 'Error al confirmar ocultación' }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
