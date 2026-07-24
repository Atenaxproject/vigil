#!/usr/bin/env node
/**
 * EXIF backfill (76A §1). Strips EXIF (GPS included) from every image already
 * stored in Supabase Storage and replaces it in place, preserving the object
 * path so existing references keep resolving. Orientation is baked into pixels
 * first (see §3) so nothing renders sideways.
 *
 * Safe by construction:
 *  - Never deletes an original until its stripped replacement uploads OK.
 *  - Skips (and reports) any object that fails to process — never substitutes.
 *  - Logs what was processed; NEVER logs the GPS values it removes.
 *  - --dry-run lists and counts without writing.
 *
 * Usage:
 *   node scripts/backfill-exif-strip.mjs --dry-run
 *   node scripts/backfill-exif-strip.mjs            # process in place
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (reads
 * .env.local if present, else process.env).
 */

import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import fs from 'fs'

const DRY_RUN = process.argv.includes('--dry-run')

function loadEnv() {
  const out = { ...process.env }
  try {
    for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
      const i = line.indexOf('=')
      if (i > 0 && !line.trimStart().startsWith('#')) out[line.slice(0, i).trim()] ||= line.slice(i + 1).trim()
    }
  } catch {
    /* no .env.local — rely on process.env */
  }
  return out
}

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i
function mimeFor(path) {
  if (/\.png$/i.test(path)) return 'image/png'
  if (/\.webp$/i.test(path)) return 'image/webp'
  return 'image/jpeg'
}

async function strip(buffer, mime) {
  const p = sharp(buffer, { failOn: 'none' }).rotate()
  if (mime === 'image/png') return p.png().toBuffer()
  if (mime === 'image/webp') return p.webp({ quality: 85 }).toBuffer()
  return p.jpeg({ quality: 85 }).toBuffer()
}

async function listAll(sb, bucket) {
  const all = []
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await sb.storage.from(bucket).list('', { limit: 100, offset })
    if (error) throw new Error(`list ${bucket}: ${error.message}`)
    all.push(...data.filter((o) => o.id && IMAGE_EXT.test(o.name)))
    if (data.length < 100) break
  }
  return all
}

async function main() {
  const env = loadEnv()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  const sb = createClient(url, key)

  const { data: buckets, error } = await sb.storage.listBuckets()
  if (error) {
    console.error('listBuckets:', error.message)
    process.exit(1)
  }

  let processed = 0
  const failures = []
  for (const bucket of buckets) {
    const objects = await listAll(sb, bucket.name)
    console.log(`${bucket.name}: ${objects.length} image objects`)
    if (DRY_RUN) continue

    for (const obj of objects) {
      try {
        const { data: blob, error: dlErr } = await sb.storage.from(bucket.name).download(obj.name)
        if (dlErr || !blob) throw new Error(dlErr?.message ?? 'download failed')
        const mime = mimeFor(obj.name)
        const cleaned = await strip(Buffer.from(await blob.arrayBuffer()), mime)
        const { error: upErr } = await sb.storage
          .from(bucket.name)
          .upload(obj.name, cleaned, { contentType: mime, upsert: true })
        if (upErr) throw new Error(upErr.message)
        processed++
        console.log(`  ✓ ${bucket.name}/${obj.name}`)
      } catch (e) {
        failures.push(`${bucket.name}/${obj.name}: ${e instanceof Error ? e.message : 'unknown'}`)
        console.warn(`  ✗ ${bucket.name}/${obj.name} — left original in place`)
      }
    }
  }

  console.log(`\n${DRY_RUN ? 'Dry run — nothing written.' : `Processed ${processed} object(s).`}`)
  if (failures.length) {
    console.log(`Failed (${failures.length}, originals preserved):`)
    for (const f of failures) console.log(`  ${f}`)
    process.exit(2)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
