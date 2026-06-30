import { NextRequest, NextResponse } from 'next/server'
import { isAdminUser } from '@/lib/supabase/auth'
import { updateSession } from '@/lib/supabase/middleware'

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/api/missing-persons/submit': { max: 5, windowMs: 60 * 60 * 1000 },
  '/api/map-markers/submit': { max: 10, windowMs: 60 * 60 * 1000 },
  '/api/missing-persons/search': { max: 60, windowMs: 60 * 60 * 1000 },
  '/api/contact-request': { max: 3, windowMs: 60 * 60 * 1000 },
  '/api/resource-exchange/submit': { max: 5, windowMs: 60 * 60 * 1000 },
  '/api/resource-exchange/contact': { max: 3, windowMs: 60 * 60 * 1000 },
  '/api/volunteers/submit': { max: 5, windowMs: 60 * 60 * 1000 },
  '/api/volunteers/contact': { max: 3, windowMs: 60 * 60 * 1000 },
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

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)')
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Refresh Supabase auth session on every matched request
  const { response: sessionResponse, user } = await updateSession(request)
  const response = sessionResponse

  // Protect /admin routes — redirect unauthenticated or non-admin users
  if (pathname.startsWith('/admin')) {
    if (!user || !isAdminUser(user)) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/auth/login'
      loginUrl.searchParams.set('next', pathname)
      if (!user) {
        loginUrl.searchParams.set('reason', 'auth_required')
      } else {
        loginUrl.searchParams.set('reason', 'admin_required')
      }
      return NextResponse.redirect(loginUrl)
    }
  }

  // API rate limiting
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

  return applySecurityHeaders(response)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
