# Vigil — Social Share Banner (Open Graph Image)
## Paste into Cursor Composer (Agent mode)

---

This generates the image shown when the Vigil link is shared on WhatsApp, 
Twitter/X, Facebook, etc. Currently blank/black because no og:image exists. 
Next.js generates this as code (no external design tool needed) using the 
built-in ImageResponse API.

## TASK A — Create the Open Graph Image

Create `src/app/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Vigil — Plataforma humanitaria para Venezuela'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0F172A',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Eyebrow label */}
        <div
          style={{
            display: 'flex',
            color: '#2563EB',
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          Respuesta Humanitaria · Venezuela 2026
        </div>

        {/* Main wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontSize: 140,
            fontWeight: 700,
            color: '#F8FAFC',
            letterSpacing: -4,
            marginBottom: 28,
          }}
        >
          <span>Vigil</span>
          <span style={{ color: '#2563EB' }}>.</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            fontSize: 36,
            color: '#CBD5E1',
            fontWeight: 400,
            marginBottom: 36,
          }}
        >
          Estamos en vigilia cuando más importa
        </div>

        {/* Capability tags */}
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            color: '#94A3B8',
            fontWeight: 400,
            marginBottom: 56,
          }}
        >
          Personas desaparecidas · Mapa en tiempo real · Recursos verificados
        </div>

        {/* Venezuela flag bar (solid stripes, no gradient, per DESIGN-SYSTEM.md) */}
        <div style={{ display: 'flex', width: 180, height: 8, marginBottom: 32 }}>
          <div style={{ flex: 1, backgroundColor: '#FCD116' }} />
          <div style={{ flex: 1, backgroundColor: '#0033A0' }} />
          <div style={{ flex: 1, backgroundColor: '#CF142B' }} />
        </div>

        {/* URL */}
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            color: '#64748B',
            fontWeight: 500,
          }}
        >
          vigil.youthewave.org
        </div>
      </div>
    ),
    { ...size }
  )
}
```

## TASK B — Create the Twitter Card Image (same content, separate file)

Twitter/X requires its own file convention even with identical content. 
Create `src/app/twitter-image.tsx` with the exact same content as Task A 
(copy the full file — Next.js doesn't allow importing between these special 
route files reliably in all configurations, so duplicate rather than import):

```tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Vigil — Plataforma humanitaria para Venezuela'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  // Same JSX content as opengraph-image.tsx above
}
```

## TASK C — Verify Metadata Picks This Up Automatically

Next.js auto-detects `opengraph-image.tsx` and `twitter-image.tsx` and 
injects the correct meta tags — no manual `<meta>` tag needed. Confirm by 
checking the rendered page source after deploy:

```bash
curl -s https://vigil.youthewave.org | grep -i "og:image\|twitter:image"
```

Should show a URL pointing to `/opengraph-image` and `/twitter-image`.

## TASK D — Test Real Rendering

After deploying, test actual social previews using:
- https://www.opengraph.xyz/ (paste the live URL, see rendered preview)
- Or paste the URL directly into a WhatsApp/Telegram chat to yourself and 
  confirm the banner appears correctly, not blank

If text appears cut off, misaligned, or the flag bar doesn't render as 
expected, adjust font sizes/spacing — Satori (the renderer behind 
ImageResponse) supports a limited CSS subset, primarily flexbox-based 
layouts, so keep adjustments simple (font-size, margin, color) rather than 
complex positioning.

---

## Commit

```bash
git add -A
git commit -m "feat: add Open Graph and Twitter Card social share images

- Generated via Next.js ImageResponse API (code-based, no external design tool)
- Matches DESIGN-SYSTEM.md: flat dark background, no gradients, brand wordmark
- Includes Venezuela flag accent as solid color stripes (not emoji, for 
  reliable cross-platform rendering)
- Fixes blank/black preview when Vigil link is shared on social platforms

Co-authored-by: Claude <noreply@anthropic.com>"
git push
```

Save this file as the next numbered doc in docs/build-process/.

## Report back

1. Confirm both files created and build passes
2. Confirm og:image and twitter:image meta tags present in page source after deploy
3. Test result from opengraph.xyz or direct share test — does it render correctly?
