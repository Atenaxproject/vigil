#!/usr/bin/env node
/**
 * Config CI / deployment pack smoke — validates crisis.config + florida/mexico
 * packs + registry for required fields. No network, no secrets.
 * Run: node scripts/validate-deployments.mjs
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function fail(msg) {
  console.error(`  FAIL  ${msg}`)
  process.exitCode = 1
}

function ok(msg) {
  console.log(`  ok  ${msg}`)
}

function loadTsExport(relPath, exportName) {
  // Lightweight structural check — read source and assert key shapes exist.
  const src = readFileSync(join(root, relPath), 'utf8')
  if (!src.includes(exportName)) {
    fail(`${relPath}: missing export ${exportName}`)
    return null
  }
  ok(`${relPath}: exports ${exportName}`)
  return src
}

console.log('validate-deployments')

const crisis = loadTsExport('src/config/crisis.config.ts', 'CRISIS_CONFIG')
if (crisis) {
  for (const key of ['country', 'mapBounds', 'emergency', 'siteUrl', 'supportedLangs']) {
    if (!crisis.includes(key)) fail(`crisis.config missing ${key}`)
    else ok(`crisis.config has ${key}`)
  }
}

const fl = loadTsExport('src/config/deployments/florida.config.ts', 'FLORIDA_DEPLOYMENT')
if (fl) {
  for (const key of ['country', 'mapBounds', 'emergency', 'siteUrl', 'TODO']) {
    // TODO may live in sibling file — mapBounds + emergency required
    if (key === 'TODO') continue
    if (!fl.includes(key)) fail(`florida.config missing ${key}`)
    else ok(`florida.config has ${key}`)
  }
}

const mx = loadTsExport(
  'src/config/deployments/mexico-pacific.config.ts',
  'MEXICO_PACIFIC_DEPLOYMENT'
)
if (mx) {
  for (const key of ['country', 'mapBounds', 'emergency', 'siteUrl']) {
    if (!mx.includes(key)) fail(`mexico-pacific.config missing ${key}`)
    else ok(`mexico-pacific.config has ${key}`)
  }
}

const registry = loadTsExport('src/config/deployments/registry.ts', 'DEPLOYMENTS')
if (registry) {
  if (!registry.includes("id: 'venezuela'")) fail('registry missing venezuela')
  else ok('registry has venezuela')
  if (!registry.includes("id: 'florida'")) fail('registry missing florida')
  else ok('registry has florida')
  if (!registry.includes("id: 'mexico-pacific'")) fail('registry missing mexico-pacific')
  else ok('registry has mexico-pacific')
  // Live activation must not silently enable FL/MX
  if (/id:\s*'florida'[\s\S]*?status:\s*'live'/.test(registry)) {
    fail('florida must remain prebuilt (not live)')
  } else {
    ok('florida is not live')
  }
  if (/id:\s*'mexico-pacific'[\s\S]*?status:\s*'live'/.test(registry)) {
    fail('mexico-pacific must remain prebuilt (not live)')
  } else {
    ok('mexico-pacific is not live')
  }
}

if (process.exitCode) {
  console.error('\nDeployment pack validation FAILED')
  process.exit(1)
}
console.log('\nDeployment pack validation OK')
