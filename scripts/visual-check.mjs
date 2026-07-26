import { chromium } from 'playwright'
import fs from 'fs'

const BASE = (process.env.CHECK_URL || 'http://localhost:3000').replace(/\/$/, '')
// Comma-separated paths; prompt 80 defaults cover home/map + buscar list.
const PATHS = (process.env.CHECK_PATHS || '/,/buscar')
  .split(',')
  .map((p) => p.trim())
  .filter(Boolean)
const VIEWPORTS = [
  { name: 'iphone-portrait', width: 390, height: 844 },
  { name: 'iphone-landscape', width: 844, height: 390 },
  { name: 'ipad-portrait', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

fs.mkdirSync('screenshots', { recursive: true })
fs.mkdirSync('public/screenshots', { recursive: true })

function pathSlug(path) {
  if (!path || path === '/') return 'home'
  return path.replace(/^\//, '').replace(/[^\w.-]+/g, '-')
}

const browser = await chromium.launch()
for (const path of PATHS) {
  const url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`
  const slug = pathSlug(path)
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    // Skip first-visit mode picker so layout bars/map/FABs are visible in proof shots.
    await page.addInitScript(() => {
      try {
        localStorage.setItem('vigil_view_mode', 'ver_todo')
      } catch {
        /* ignore */
      }
    })
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
    const buffer = await page.screenshot({ fullPage: false })
    const file = `${slug}-${vp.name}.png`
    fs.writeFileSync(`screenshots/${file}`, buffer)
    fs.writeFileSync(`public/screenshots/${file}`, buffer)
    // Keep legacy names for the first path (home) for older callers.
    if (slug === 'home') {
      fs.writeFileSync(`screenshots/${vp.name}.png`, buffer)
      fs.writeFileSync(`public/screenshots/${vp.name}.png`, buffer)
    }
    console.log(`Captured: screenshots/${file}`)
    await page.close()
  }
}
await browser.close()
console.log('Done.')