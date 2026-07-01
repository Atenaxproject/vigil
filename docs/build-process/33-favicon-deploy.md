# Vigil — Deploy Favicon Set
## Paste into Cursor Composer (Agent mode)

---

Orlando has created a complete Vigil favicon set. Files are in the 
project root (or wherever he places them). Move them to /public and 
wire into Next.js metadata and PWA manifest.

## TASK A — Move icon files to /public

```bash
cp vigil-favicon.ico public/favicon.ico
cp vigil-icon-16.png public/favicon-16x16.png
cp vigil-icon-32.png public/favicon-32x32.png
cp vigil-icon-48.png public/favicon-48x48.png
cp vigil-icon-192.png public/android-chrome-192x192.png
cp vigil-icon-512.png public/android-chrome-512x512.png
cp vigil-apple-touch-icon.png public/apple-touch-icon.png
```

## TASK B — Update src/app/layout.tsx metadata

Add or replace the icons section in the metadata export:

```typescript
export const metadata: Metadata = {
  // ... existing metadata fields ...
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
}
```

Also confirm this link tag is in the <head> (Next.js usually handles 
it via metadata but verify in rendered source after deploy):
```html
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

## TASK C — Update public/manifest.json

Replace the icons array:

```json
{
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## TASK D — Delete Vercel's default icon if present

```bash
# Remove any Vercel placeholder icon that may exist
ls public/ | grep -i "icon\|favicon"
# Delete any that are NOT the ones we just added
```

## TASK E — Verify after deploy

After pushing and Vercel rebuilds:
1. Open vigil.youthewave.org in Chrome
2. Check the browser tab — should show the Vigil V. icon, not Vercel's triangle
3. On mobile Safari: Add to Home Screen → confirm the apple-touch-icon 
   shows the dark Vigil mark, not a screenshot of the page
4. Run in Chrome DevTools → Application → Manifest → confirm icons listed

## Commit

```bash
git add -A
git commit -m "feat: add Vigil brand favicon — V. mark in all required sizes

- favicon.ico (16+32+48 multi-size, replaces Vercel default)
- PNG set: 16, 32, 48, 192, 512px for browsers and PWA
- apple-touch-icon.png (180x180) for iOS home screen
- Updated Next.js metadata icons config
- Updated manifest.json icons array

Brand: dark navy (#0F172A) background, white V, blue period — 
matches DESIGN-SYSTEM.md wordmark spec.

Co-authored-by: Claude <noreply@anthropic.com>"
git push
```

Save as next numbered file in docs/build-process/.
