#!/usr/bin/env node
/**
 * Press-kit PDF builder — build-time, not runtime (75 §2).
 *
 * Renders each markdown file in docs/press/ to styled HTML using the Vigil
 * design tokens, then prints it to PDF with Playwright Chromium (real font
 * embedding — accents render correctly, unlike the retired hand-rolled
 * PDF writer in src/lib/press-kit-archive.ts).
 *
 * Output is committed to public/press-kit/ as static assets;
 * /api/press-kit/download zips those static files only.
 *
 * Usage: node scripts/build-press-kit.mjs
 */

import { readFile, writeFile, mkdir, readdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC_DIR = path.join(root, 'docs', 'press')
const OUT_DIR = path.join(root, 'public', 'press-kit')

// Design tokens — docs/architecture/DESIGN-SYSTEM.md
const TOKENS = {
  ink: '#0F172A',
  body: '#1E293B',
  muted: '#64748B',
  blue: '#1D4ED8',
  cloud: '#F1F5F9',
  border: '#E2E8F0',
}

async function geistFontCss() {
  const load = async (rel) => {
    const buf = await readFile(path.join(root, 'node_modules', 'geist', 'dist', 'fonts', rel))
    return buf.toString('base64')
  }
  try {
    const [regular, bold] = await Promise.all([
      load('geist-sans/Geist-Regular.woff2'),
      load('geist-sans/Geist-SemiBold.woff2'),
    ])
    return `
      @font-face { font-family: 'Geist'; font-weight: 400; src: url(data:font/woff2;base64,${regular}) format('woff2'); }
      @font-face { font-family: 'Geist'; font-weight: 600; src: url(data:font/woff2;base64,${bold}) format('woff2'); }
    `
  } catch {
    return '' // Segoe UI fallback still renders every accent correctly
  }
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function inline(s) {
  return escapeHtml(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
}

/** Small markdown renderer — covers exactly what the press docs use. */
function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out = []
  let list = null // 'ul' | 'ol'
  let table = null // { header: string[], rows: string[][] }

  const closeList = () => {
    if (list) {
      out.push(`</${list}>`)
      list = null
    }
  }
  const closeTable = () => {
    if (table) {
      out.push('<table><thead><tr>')
      out.push(...table.header.map((c) => `<th>${inline(c)}</th>`))
      out.push('</tr></thead><tbody>')
      for (const row of table.rows) {
        out.push('<tr>' + row.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>')
      }
      out.push('</tbody></table>')
      table = null
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    const tableRow = line.match(/^\|(.+)\|$/)
    if (tableRow) {
      const cells = tableRow[1].split('|').map((c) => c.trim())
      if (cells.every((c) => /^:?-{3,}:?$/.test(c))) continue // separator row
      if (!table) table = { header: cells, rows: [] }
      else table.rows.push(cells)
      continue
    }
    closeTable()

    const heading = line.match(/^(#{1,4})\s+(.*)$/)
    if (heading) {
      closeList()
      out.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`)
      continue
    }
    const bullet = line.match(/^\s*[-*]\s+(.*)$/)
    if (bullet) {
      if (list !== 'ul') {
        closeList()
        out.push('<ul>')
        list = 'ul'
      }
      out.push(`<li>${inline(bullet[1])}</li>`)
      continue
    }
    const ordered = line.match(/^\s*\d+\.\s+(.*)$/)
    if (ordered) {
      if (list !== 'ol') {
        closeList()
        out.push('<ol>')
        list = 'ol'
      }
      out.push(`<li>${inline(ordered[1])}</li>`)
      continue
    }
    closeList()

    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line)) {
      out.push('<hr>')
      continue
    }
    const quote = line.match(/^>\s?(.*)$/)
    if (quote) {
      out.push(`<blockquote>${inline(quote[1])}</blockquote>`)
      continue
    }
    if (line.trim() === '') continue
    out.push(`<p>${inline(line)}</p>`)
  }
  closeList()
  closeTable()
  return out.join('\n')
}

function pageHtml(title, bodyHtml, fontCss, generatedDate) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
${fontCss}
@page { size: Letter; margin: 22mm 19mm 24mm 19mm; }
* { box-sizing: border-box; }
body {
  font-family: 'Geist', 'Segoe UI', system-ui, sans-serif;
  color: ${TOKENS.body};
  font-size: 11pt;
  line-height: 1.55;
  margin: 0;
}
h1 { color: ${TOKENS.ink}; font-size: 21pt; font-weight: 600; line-height: 1.2; margin: 0 0 4pt;
     padding-bottom: 8pt; border-bottom: 2.5pt solid ${TOKENS.blue}; }
h2 { color: ${TOKENS.ink}; font-size: 14pt; font-weight: 600; margin: 18pt 0 6pt; }
h3 { color: ${TOKENS.ink}; font-size: 12pt; font-weight: 600; margin: 14pt 0 4pt; }
h4 { color: ${TOKENS.muted}; font-size: 10pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin: 12pt 0 4pt; }
p { margin: 0 0 7pt; }
ul, ol { margin: 0 0 8pt; padding-left: 18pt; }
li { margin-bottom: 3pt; }
a { color: ${TOKENS.blue}; text-decoration: none; }
code { font-family: 'Consolas', monospace; font-size: 9.5pt; background: ${TOKENS.cloud}; padding: 1pt 3pt; border-radius: 2pt; }
blockquote { margin: 0 0 8pt; padding: 6pt 10pt; border-left: 3pt solid ${TOKENS.blue}; background: ${TOKENS.cloud}; color: ${TOKENS.ink}; }
hr { border: 0; border-top: 1pt solid ${TOKENS.border}; margin: 14pt 0; }
table { border-collapse: collapse; width: 100%; margin: 6pt 0 10pt; font-size: 10pt; }
th { text-align: left; color: ${TOKENS.ink}; font-weight: 600; border-bottom: 1.5pt solid ${TOKENS.ink}; padding: 4pt 8pt 4pt 0; }
td { border-bottom: 0.75pt solid ${TOKENS.border}; padding: 4pt 8pt 4pt 0; vertical-align: top; }
thead { display: table-header-group; }
tr { page-break-inside: avoid; }
.kit-footer {
  position: fixed; bottom: -14mm; left: 0; right: 0;
  font-size: 8pt; color: ${TOKENS.muted};
  display: flex; justify-content: space-between;
  border-top: 0.75pt solid ${TOKENS.border}; padding-top: 4pt;
}
</style>
</head>
<body>
${bodyHtml}
<div class="kit-footer"><span>vigil.youthewave.org · Licencia MIT</span><span>${escapeHtml(generatedDate)}</span></div>
</body>
</html>`
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const fontCss = await geistFontCss()
  const generatedDate = new Date().toISOString().slice(0, 10)

  const sources = (await readdir(SRC_DIR)).filter((f) => f.endsWith('.md')).sort()
  if (sources.length === 0) {
    console.error(`No markdown sources in ${SRC_DIR}`)
    process.exit(1)
  }

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    for (const file of sources) {
      const md = await readFile(path.join(SRC_DIR, file), 'utf8')
      const title = md.match(/^#\s+(.*)$/m)?.[1] ?? file.replace(/\.md$/, '')
      const html = pageHtml(title, mdToHtml(md), fontCss, generatedDate)
      await page.setContent(html, { waitUntil: 'networkidle' })
      const pdfName = file.replace(/\.md$/, '.pdf')
      await page.pdf({
        path: path.join(OUT_DIR, pdfName),
        format: 'Letter',
        printBackground: true,
        margin: { top: '22mm', right: '19mm', bottom: '24mm', left: '19mm' },
      })
      console.log(`✓ ${pdfName}`)
    }
  } finally {
    await browser.close()
  }

  await writeFile(
    path.join(OUT_DIR, 'README.txt'),
    `Generated by scripts/build-press-kit.mjs on ${generatedDate}.\nDo not edit PDFs by hand — edit docs/press/*.md and re-run the script.\n`,
    'utf8'
  )
  console.log(`Done → ${OUT_DIR}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
