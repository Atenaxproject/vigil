import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { buildZip } from '@/lib/press-kit-archive'

// Static assets only (75 §2). PDFs are generated at build time by
// scripts/build-press-kit.mjs from docs/press/*.md and committed to
// public/press-kit/ — no runtime PDF generation. Live figures live on
// /estadisticas and /prensa, where they carry provenance and can't go stale
// inside a downloaded file.

export const dynamic = 'force-dynamic'

const KIT_DOCS = [
  '01-one-pager',
  '02-mission-vision-values',
  '03-history-and-context',
  '04-fact-sheet',
] as const

export async function GET() {
  const files: { name: string; data: Buffer }[] = []

  for (const doc of KIT_DOCS) {
    try {
      const [md, pdf] = await Promise.all([
        readFile(path.join(process.cwd(), 'docs', 'press', `${doc}.md`)),
        readFile(path.join(process.cwd(), 'public', 'press-kit', `${doc}.pdf`)),
      ])
      files.push({ name: `${doc}.md`, data: md })
      files.push({ name: `${doc}.pdf`, data: pdf })
    } catch (err) {
      console.error(`press-kit: missing asset for ${doc}`, err)
    }
  }

  // Distribute the full kit or none — a silently partial press kit is worse than
  // an honest 503. Each doc contributes 2 files (.md + .pdf).
  if (files.length < KIT_DOCS.length * 2) {
    return NextResponse.json({ error: 'Press kit assets incomplete' }, { status: 503 })
  }

  const zip = buildZip(files)
  return new NextResponse(new Uint8Array(zip), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="vigil-press-kit.zip"',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
