// Feed-adapter fixture tests — run: node scripts/test-feeds.mjs
// Validates the recorded fixtures in src/lib/feeds/__fixtures__/ against the
// shape expectations the TS adapters (nws.ts / nhc.ts / usgs-water.ts) rely
// on. No test framework dependency by design; exits non-zero on failure.

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../src/lib/feeds/__fixtures__')
let failures = 0

function check(name, condition, detail = '') {
  if (condition) {
    console.log(`  ok  ${name}`)
  } else {
    failures++
    console.error(`FAIL  ${name} ${detail}`)
  }
}

function load(file) {
  return JSON.parse(readFileSync(join(FIXTURES, file), 'utf8'))
}

// ── NWS alerts (real recording) ──────────────────────────────────────────────
console.log('nws-alerts-fl.json')
const nws = load('nws-alerts-fl.json')
check('features is array', Array.isArray(nws.features))
const VALID_SEVERITIES = ['Extreme', 'Severe', 'Moderate', 'Minor', 'Unknown']
for (const f of (nws.features ?? []).slice(0, 5)) {
  check(`alert ${f.id?.slice(-12)} has event`, typeof f.properties?.event === 'string')
  check(
    `alert severity official tier (${f.properties?.severity})`,
    VALID_SEVERITIES.includes(f.properties?.severity ?? 'Unknown')
  )
  check('alert has expires', typeof f.properties?.expires === 'string')
}

// ── NHC (real recording — may be empty — plus synthetic parser fixture) ─────
console.log('nhc-current-storms.json (real)')
const nhcReal = load('nhc-current-storms.json')
check('activeStorms is array', Array.isArray(nhcReal.activeStorms))

console.log('nhc-current-storms.synthetic.json')
const nhc = load('nhc-current-storms.synthetic.json')
check('synthetic has storms', (nhc.activeStorms ?? []).length >= 2)
for (const s of nhc.activeStorms) {
  check(`storm ${s.id} numeric position`, typeof s.latitudeNumeric === 'number' && typeof s.longitudeNumeric === 'number')
  check(`storm ${s.id} classification`, typeof s.classification === 'string')
  check(`storm ${s.id} intensity parseable`, !Number.isNaN(Number(s.intensity)))
  const basin = s.id.slice(0, 2).toUpperCase()
  check(`storm ${s.id} basin known (${basin})`, ['AL', 'EP', 'CP'].includes(basin))
}
// EP-basin inclusion (the Mexico-config requirement): the adapter must not filter EP out
check(
  'EP-basin storm present in synthetic set (adapter must keep it)',
  nhc.activeStorms.some((s) => s.id.startsWith('ep'))
)

// ── USGS water (real recording) ──────────────────────────────────────────────
console.log('usgs-water-fl.json')
const water = load('usgs-water-fl.json')
const series = water.value?.timeSeries ?? []
check('timeSeries is array', Array.isArray(series))
check('has at least one gauge', series.length >= 1)
for (const ts of series.slice(0, 3)) {
  const loc = ts.sourceInfo?.geoLocation?.geogLocation
  check(`gauge ${ts.sourceInfo?.siteCode?.[0]?.value} has coordinates`, typeof loc?.latitude === 'number' && typeof loc?.longitude === 'number')
  const v = ts.values?.[0]?.value?.[0]?.value
  check('gauge has latest value', v === undefined || !Number.isNaN(parseFloat(v)))
}

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`)
process.exit(failures === 0 ? 0 : 1)
