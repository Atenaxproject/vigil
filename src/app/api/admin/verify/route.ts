import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminCookieValue } from '@/lib/admin-gate'

export const dynamic = 'force-dynamic'

const schema = z.object({ secret: z.string().min(1) })

export async function POST(request: NextRequest) {
  try {
    const { secret } = schema.parse(await request.json())
    const expected = process.env.VIGIL_ADMIN_SECRET

    if (!expected || secret !== expected) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set('vigil_admin_gate', createAdminCookieValue(expected), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
