#!/usr/bin/env node
/**
 * i18n key-parity check (75 §5). Fails the build when any locale is missing a
 * key present in es.json (the source of truth) or carries a key es.json lacks.
 * Runs in prebuild so drift can never ship again — the 53fc70b seed commit
 * left 6 locales missing 7 keys and nothing caught it.
 */

import { readFile, readdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const LOCALES_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'i18n',
  'locales'
)

function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [`${prefix}${key}`]
  )
}

const files = (await readdir(LOCALES_DIR)).filter((f) => f.endsWith('.json'))
const base = 'es.json'
if (!files.includes(base)) {
  console.error(`i18n parity: ${base} not found in ${LOCALES_DIR}`)
  process.exit(1)
}

const load = async (f) => JSON.parse(await readFile(path.join(LOCALES_DIR, f), 'utf8'))
const esKeys = new Set(flatten(await load(base)))

let failed = false
for (const file of files) {
  if (file === base) continue
  const keys = new Set(flatten(await load(file)))
  const missing = [...esKeys].filter((k) => !keys.has(k))
  const extra = [...keys].filter((k) => !esKeys.has(k))
  if (missing.length || extra.length) {
    failed = true
    console.error(`✗ ${file}`)
    for (const k of missing) console.error(`    missing: ${k}`)
    for (const k of extra) console.error(`    extra:   ${k}`)
  }
}

if (failed) {
  console.error('\ni18n parity check failed — every locale must match es.json key-for-key.')
  process.exit(1)
}
console.log(`✓ i18n parity: ${files.length} locales aligned with ${base} (${esKeys.size} keys)`)
