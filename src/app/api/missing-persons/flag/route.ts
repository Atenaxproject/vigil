import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { getClientIp, hashIp } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

const schema = z.object({
  id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json())
    const ipHash = hashIp(getClientIp(request.headers))
    const limit = await checkRateLimit(`mp-flag:${ipHash}`, 10, 60 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Demasiados reportes. Intente más tarde.' }, { status: 429 })
    }

    const supabase = await createClient()
    const { error } = await supabase.rpc('flag_missing_person', { person_id: body.id })

    if (error) {
      // RPC may be missing until migration 022 is applied — fail honestly.
      console.error('[missing-persons/flag]', error.message)
      return NextResponse.json({ error: 'Error al marcar reporte' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
