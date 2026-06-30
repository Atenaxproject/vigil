const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#0F172A"/>
  <circle cx="256" cy="256" r="100" fill="none" stroke="#DC2626" stroke-width="10" opacity="0.85"/>
  <text x="256" y="295" text-anchor="middle" font-family="Arial,sans-serif" font-size="160" font-weight="700" fill="#FFFFFF">V</text>
</svg>`

const dir = path.join(__dirname, '..', 'public', 'icons')
fs.mkdirSync(dir, { recursive: true })

Promise.all(
  [72, 192, 512].map((size) =>
    sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(path.join(dir, `icon-${size}x${size}.png`))
  )
).then(() => console.log('icons generated'))
