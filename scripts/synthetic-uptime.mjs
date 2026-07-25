#!/usr/bin/env node
/**
 * Synthetic uptime probe — hits public routes (no secrets required).
 * Optional CRON_SECRET: if set, also probes /api/cron/retention with Bearer.
 * Does not fail production when secret is missing — authenticated probes are skipped.
 *
 * Usage:
 *   BASE_URL=https://vigil.youthewave.org node scripts/synthetic-uptime.mjs
 *   BASE_URL=http://127.0.0.1:3000 CRON_SECRET=... node scripts/synthetic-uptime.mjs
 */
const BASE = (process.env.BASE_URL || process.env.SYNTHETIC_BASE_URL || 'https://vigil.youthewave.org').replace(
  /\/$/,
  ''
)
const PUBLIC_PATHS = ['/', '/buscar', '/reportar', '/informacion']
const secret = process.env.CRON_SECRET

let failed = 0

async function probe(path, init) {
  const url = `${BASE}${path}`
  try {
    const res = await fetch(url, { ...init, redirect: 'follow' })
    const ok = res.status >= 200 && res.status < 400
    console.log(`  ${ok ? 'ok' : 'FAIL'}  ${res.status} ${path}`)
    if (!ok) failed += 1
  } catch (err) {
    console.log(`  FAIL  ${path} — ${err instanceof Error ? err.message : err}`)
    failed += 1
  }
}

console.log(`synthetic-uptime → ${BASE}`)
for (const p of PUBLIC_PATHS) {
  await probe(p)
}

if (secret) {
  await probe('/api/cron/retention', {
    headers: { Authorization: `Bearer ${secret}` },
  })
} else {
  console.log('  skip  /api/cron/retention (CRON_SECRET unset)')
}

if (failed) {
  console.error(`\n${failed} probe(s) failed`)
  process.exit(1)
}
console.log('\nAll probes OK')
