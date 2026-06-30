import { chromium } from 'playwright'
import fs from 'fs'

const URL = process.env.CHECK_URL || 'http://localhost:3000'
const VIEWPORTS = [
  { name: 'iphone-portrait', width: 390, height: 844 },
  { name: 'iphone-landscape', width: 844, height: 390 },
  { name: 'ipad-portrait', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

fs.mkdirSync('screenshots', { recursive: true })

const browser = await chromium.launch()
for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
  await page.screenshot({ path: `screenshots/${vp.name}.png`, fullPage: false })
  console.log(`Captured: screenshots/${vp.name}.png`)
  await page.close()
}
await browser.close()
console.log('Done.')
