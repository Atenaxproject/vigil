import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { buildSimplePdf, buildZip } from '@/lib/press-kit-archive'
import { createClient } from '@/lib/supabase/server'
import { getDTVMetrics, isDTVConfigured } from '@/lib/dtv-api'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

async function loadMarkdown(name: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'docs', 'press', name)
  try {
    return await readFile(filePath, 'utf8')
  } catch {
    return `# ${name}\n\n(Source markdown missing — see docs/press/)`
  }
}

function mdToParagraphs(md: string): string[] {
  return md
    .split(/\n{2,}/)
    .map((b) => b.replace(/^#+\s+/gm, '').replace(/[*_`]/g, '').trim())
    .filter(Boolean)
}

export async function GET() {
  const [onePager, mission, history] = await Promise.all([
    loadMarkdown('01-one-pager.md'),
    loadMarkdown('02-mission-vision-values.md'),
    loadMarkdown('03-history-and-context.md'),
  ])

  const factSheetParas: string[] = [
    'Vigil fact sheet — figures with source and verification date.',
    'Official figures are labeled cifras oficiales. DTV network figures are attributed to the federated API.',
  ]

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('sourced_figures')
      .select('label_es, value, source, verified_at, is_official')
      .eq('active', true)
      .order('sort_order')

    for (const row of data ?? []) {
      const tag = row.is_official ? 'cifra oficial' : 'analisis independiente'
      factSheetParas.push(
        `${row.label_es}: ${row.value} (${tag}) — Fuente: ${row.source} · ${row.verified_at}`
      )
    }
  } catch {
    /* keep defaults */
  }

  if (isDTVConfigured()) {
    try {
      const m = await getDTVMetrics()
      if (m.available) {
        factSheetParas.push(
          `Red DTV (GET /personas): ${m.totalPersonas} personas federadas · ${m.sinContacto} sin contacto · ${m.localizados} localizados · Fuente: ${m.source} · ${m.lastUpdated}`
        )
        factSheetParas.push(
          'Estas cifras son de la red DTV, no de Vigil. Mapeo: totalPersonas=conteo /personas; sinContacto=estado sin-contacto; localizados=estado localizado.'
        )
      }
    } catch {
      /* ignore */
    }
  }

  const files = [
    {
      name: '01-one-pager.pdf',
      data: buildSimplePdf('Vigil — One-pager', mdToParagraphs(onePager)),
    },
    {
      name: '02-mission-vision-values.pdf',
      data: buildSimplePdf('Vigil — Mision, vision, valores', mdToParagraphs(mission)),
    },
    {
      name: '03-history-and-context.pdf',
      data: buildSimplePdf('Vigil — Historia y contexto', mdToParagraphs(history)),
    },
    {
      name: '04-fact-sheet.pdf',
      data: buildSimplePdf('Vigil — Hoja de hechos', factSheetParas),
    },
    { name: '01-one-pager.md', data: Buffer.from(onePager, 'utf8') },
    { name: '02-mission-vision-values.md', data: Buffer.from(mission, 'utf8') },
    { name: '03-history-and-context.md', data: Buffer.from(history, 'utf8') },
    {
      name: '04-fact-sheet.md',
      data: Buffer.from(factSheetParas.join('\n\n'), 'utf8'),
    },
  ]

  const zip = buildZip(files)
  return new NextResponse(new Uint8Array(zip), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="vigil-press-kit.zip"',
      'Cache-Control': 'no-store',
    },
  })
}
