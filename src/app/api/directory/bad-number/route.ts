import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createHash } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const schema = z.object({
  entry_id: z.string().min(1).max(80),
})

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 32)
}

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json())
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const ipHash = hashIp(ip)

    // Prefer admin client so insert succeeds even if anon RLS is insert-only without entry_id
    let supabase
    try {
      supabase = createAdminClient()
    } catch {
      supabase = await createClient()
    }

    const { error } = await supabase.from('feedback').insert({
      category: 'bad_number',
      message: `Número no funcionó: ${body.entry_id}`,
      entry_id: body.entry_id,
      ip_hash: ipHash,
      page_context: '/informacion#emergency-contacts',
    })

    if (error) {
      console.error('bad_number insert failed:', error.message)
      return NextResponse.json({ error: 'Error al enviar' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
