import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * CSP violation report sink. Logs to console (visible in Vercel logs) — no
 * storage, no PII retention. Referenced by the report-uri CSP directive in
 * next.config.js.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const report = (body['csp-report'] ?? body) as Record<string, unknown>
    console.warn('[csp-report]', {
      documentUri: report['document-uri'] ?? report.documentURL,
      violatedDirective: report['violated-directive'] ?? report.effectiveDirective,
      blockedUri: report['blocked-uri'] ?? report.blockedURL,
    })
  } catch {
    // malformed report — ignore
  }
  return new NextResponse(null, { status: 204 })
}
