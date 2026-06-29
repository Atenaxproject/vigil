import { NextRequest, NextResponse } from 'next/server'

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/api/missing-persons/submit': { max: 5, windowMs: 60 * 60 * 1000 },
  '/api/map-markers/submit': { max: 10, windowMs: 60 * 60 * 1000 },
  '/api/missing-persons/search': { max: 60, windowMs: 60 * 60 * 1000 },
  '/api/contact-request': { max: 3, windowMs: 60 * 60 * 1000 },
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

async function getIpHash(request: NextRequest): Promise<string> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const secret = process.env.VIGIL_ADMIN_SECRET ?? 'vigil-dev-secret'
  const data = new TextEncoder().encode(ip + secret)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return hashHex.slice(0, 16)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const limit = RATE_LIMITS[pathname]

  if (limit) {
    const ipHash = await getIpHash(request)
    const key = `${ipHash}:${pathname}`
    const now = Date.now()
    const entry = rateLimitStore.get(key)

    if (!entry || now > entry.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + limit.windowMs })
    } else {
      entry.count++
      if (entry.count > limit.max) {
        return NextResponse.json(
          {
            error:
              'Demasiadas solicitudes. Por favor intente más tarde. / Too many requests. Please try again later.',
          },
          { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.windowMs / 1000)) } }
        )
      }
    }
  }

  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)')

  return response
}

export const config = {
  matcher: ['/api/:path*'],
}
