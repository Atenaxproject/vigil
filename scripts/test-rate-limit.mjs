// Offline guard for durable rate-limit helper — run: node scripts/test-rate-limit.mjs
// Mirrors the in-memory path of src/lib/security/rate-limit.ts (no Upstash).
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(__dirname, '../src/lib/security/rate-limit.ts'), 'utf8')

let failures = 0
const check = (name, ok, detail = '') => {
  if (ok) console.log(`  ok  ${name}`)
  else {
    console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`)
    failures++
  }
}

console.log('rate-limit source guards')
check('exports checkRateLimit', src.includes('export async function checkRateLimit'))
check('upstash REST via fetch', src.includes('UPSTASH_REDIS_REST_URL') && src.includes('fetch(url'))
check('memory fallback Map', src.includes('memoryStore') && src.includes("backend: 'memory'"))
check('fail-open to memory on Redis error', src.includes('catch') && src.includes('return memoryCheck'))
check('INCR + EXPIRE pattern', src.includes("['INCR'") && src.includes("['EXPIRE'"))
check('isDurableRateLimitConfigured exported', src.includes('export function isDurableRateLimitConfigured'))

const mw = readFileSync(join(__dirname, '../src/middleware.ts'), 'utf8')
console.log('middleware wiring')
check('middleware imports checkRateLimit', mw.includes("from '@/lib/security/rate-limit'"))
check('claim paths rate-limited', mw.includes("'/api/missing-persons/claim'") && mw.includes("'/api/admin/verify'"))
check('AI paths still listed', mw.includes("'/api/assistant'") && mw.includes("'/api/photo-search'"))

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`)
  process.exit(1)
}
console.log('\nAll rate-limit guards passed.')
