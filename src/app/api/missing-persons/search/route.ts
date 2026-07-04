import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { searchDTVPersonas } from '@/lib/dtv-api'
import { mapDTVPersonaToFederated, tagVigilPerson } from '@/lib/dtv-mapper'
import { sanitizeText } from '@/lib/security/validate'
import type { PublicMissingPerson } from '@/types/vigil.types'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  q: z.string().trim().min(2).max(200).optional(),
  estado: z.string().trim().min(1).max(100).optional(),
  municipio: z.string().trim().min(1).max(100).optional(),
  parroquia: z.string().trim().min(1).max(100).optional(),
})

export async function GET(request: NextRequest) {
  const rawQ = request.nextUrl.searchParams.get('q')?.trim()
  const rawEstado = request.nextUrl.searchParams.get('estado')?.trim()
  const rawMunicipio = request.nextUrl.searchParams.get('municipio')?.trim()
  const rawParroquia = request.nextUrl.searchParams.get('parroquia')?.trim()

  const parsed = querySchema.safeParse({
    q: rawQ || undefined,
    estado: rawEstado || undefined,
    municipio: rawMunicipio || undefined,
    parroquia: rawParroquia || undefined,
  })
  if (
    !parsed.success ||
    (!parsed.data.q && !parsed.data.estado && !parsed.data.municipio && !parsed.data.parroquia)
  ) {
    return NextResponse.json({
      vigil: [],
      dtv: [],
      results: [],
      total: 0,
      dtvAvailable: false,
    })
  }

  const { q, estado, municipio, parroquia } = parsed.data

  try {
    const supabase = await createClient()

    const vigilPromise = (async () => {
      let query = supabase.from('public_missing_persons').select('*')

      if (q && q.length >= 2) {
        const safeQuery = sanitizeText(q)
        query = query.ilike('full_name', `%${safeQuery}%`)
      }

      if (estado) {
        const safeEstado = sanitizeText(estado === 'Caracas' ? 'Distrito Capital' : estado)
        query = query.eq('estado', safeEstado)
      }

      if (municipio) {
        query = query.eq('municipio', sanitizeText(municipio))
      }

      if (parroquia) {
        query = query.eq('parroquia', sanitizeText(parroquia))
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(50)
      if (error) return [] as PublicMissingPerson[]
      return (data ?? []) as PublicMissingPerson[]
    })()

    const dtvPromise = q && q.length >= 2 ? searchDTVPersonas(q) : Promise.resolve(null)

    const [vigilResult, dtvResult] = await Promise.allSettled([vigilPromise, dtvPromise])

    const vigilData =
      vigilResult.status === 'fulfilled'
        ? vigilResult.value.map(tagVigilPerson)
        : []

    const dtvRaw =
      dtvResult.status === 'fulfilled' && dtvResult.value ? dtvResult.value.data : []

    const dtvData = dtvRaw.map(mapDTVPersonaToFederated)
    const dtvAvailable = dtvResult.status === 'fulfilled' && dtvResult.value !== null

    return NextResponse.json({
      vigil: vigilData,
      dtv: dtvData,
      results: [...vigilData, ...dtvData],
      total: vigilData.length + dtvData.length,
      dtvAvailable,
    })
  } catch {
    return NextResponse.json({
      vigil: [],
      dtv: [],
      results: [],
      total: 0,
      dtvAvailable: false,
    })
  }
}
