import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { getClientIp, hashIp, sanitizeText } from '@/lib/security/validate'

export const dynamic = 'force-dynamic'

/**
 * Lightweight Sentry-free client error sink.
 * Structured console log only — no third-party SaaS, no PII fields accepted.
 */
const schema = z.object({
  message: z.string().min(1).max(500),
  path: z.string().max(200).optional(),
  digest: z.string().max(100).optional(),
  component: z.string().max(100).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const ipHash = hashIp(getClientIp(request.headers))
    const limit = await checkRateLimit(`client-err:${ipHash}`, 20, 60 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json({ ok: true, rateLimited: true })
    }

    const body = schema.parse(await request.json())
    const payload = {
      type: 'client_error',
      message: sanitizeText(body.message),
      path: body.path ? sanitizeText(body.path) : undefined,
      digest: body.digest ? sanitizeText(body.digest) : undefined,
      component: body.component ? sanitizeText(body.component) : undefined,
      ipHash,
      at: new Date().toISOString(),
    }

    console.error('[client-error]', JSON.stringify(payload))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
