# Vigil — PWA Performance Audit + Credits Implementation
## Paste into Cursor Composer (Agent mode)

---

Read @CLAUDE.md and @DESIGN-SYSTEM.md before starting.

## PART 1 — PWA Performance Audit (mobile-first, low-bandwidth priority)

This platform must work for someone on a cracked phone screen with intermittent 
3G in La Guaira. Audit and fix the following:

### 1.1 Service Worker Strategy

Check `next-pwa` configuration in `next.config.js`. Confirm caching strategy is:
- **Static assets** (JS, CSS, fonts): cache-first — load instantly from cache, 
  update in background
- **Supabase API calls**: network-first with a short timeout (3s) falling back 
  to cached data — show "Mostrando datos guardados" indicator when serving from cache
- **USGS/ReliefWeb external APIs**: stale-while-revalidate — show cached data 
  immediately, silently update when fresh data arrives
- **Images**: cache-first with a 7-day expiration

If `next-pwa` isn't configured with `runtimeCaching` rules, add them:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api',
        networkTimeoutSeconds: 3,
        expiration: { maxEntries: 50, maxAgeSeconds: 300 },
      },
    },
    {
      urlPattern: /^https:\/\/earthquake\.usgs\.gov\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'usgs-data', expiration: { maxAgeSeconds: 300 } },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/i,
      handler: 'CacheFirst',
      options: { cacheName: 'images', expiration: { maxEntries: 100, maxAgeSeconds: 604800 } },
    },
  ],
})
```

### 1.2 Bundle Size Audit

Run `npm run build` and check the output bundle sizes per route. Flag anything 
over 200KB First Load JS. Common culprits to check:
- Is `leaflet`/`react-leaflet` dynamically imported with `next/dynamic` and 
  `ssr: false`? It should NEVER be in the main bundle — it's only needed on 
  pages with maps.
- Is `framer-motion` used minimally or at all? If barely used, consider removing 
  it in favor of CSS transitions (lighter weight).
- Are all icon imports from `lucide-react` using named imports (tree-shakeable), 
  not a default bundle import?

### 1.3 Image Optimization

Confirm every `<img>` tag uses Next.js `<Image>` component instead, with explicit 
width/height to prevent layout shift, and `loading="lazy"` for anything below the fold.

### 1.4 Offline Fallback

Create `src/app/offline/page.tsx` — a simple page shown when the service worker 
detects no connection AND no cached version of the requested page exists. Message:
"Sin conexión. Vigil funciona mejor con conexión a internet, pero los reportes 
que ya enviaste están guardados y se sincronizarán cuando vuelvas a tener señal."

### 1.5 Form Offline Queue

Confirm the missing person report form and map marker form queue submissions in 
localStorage when offline, and flush the queue automatically on reconnect (listen 
for the `online` browser event). If this isn't implemented yet, build it:

```typescript
// src/lib/offline-queue.ts
const QUEUE_KEY = 'vigil-offline-queue'

export function queueSubmission(type: string, payload: any) {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  queue.push({ type, payload, queuedAt: Date.now() })
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export async function flushQueue(submitFn: (type: string, payload: any) => Promise<void>) {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  if (queue.length === 0) return
  
  const remaining = []
  for (const item of queue) {
    try {
      await submitFn(item.type, item.payload)
    } catch {
      remaining.push(item)
    }
  }
  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining))
}

// In a top-level layout or provider, listen for reconnection:
// window.addEventListener('online', () => flushQueue(actualSubmitFunction))
```

### 1.6 Lighthouse Check

After fixes, run a Lighthouse audit (Chrome DevTools → Lighthouse → Mobile → 
PWA + Performance categories). Target scores: Performance 85+, PWA installable 
checks all passing. Report the before/after scores in your final summary.

---

## PART 2 — Credits Implementation

Add a footer credits block, visible but understated — this is a humanitarian 
tool first, not a portfolio piece, so the credit lives quietly in the footer of 
every page, never in the hero or competing with emergency actions.

### 2.1 Footer Component Update

In the footer (likely `src/components/layout/Footer.tsx` or inline in the root 
layout), add this block below the existing "Open source" / "MIT License" line:

**Spanish version:**
```
Hecho con esperanza y amor para Venezuela 🇻🇪
Un proyecto de Orlando Toro — Atenax Project
```

**English version:**
```
Made with hope and love for Venezuela 🇻🇪
A project by Orlando Toro — Atenax Project
```

"Atenax Project" must be a clickable link to `https://atenaxproject.com`, 
opening in a new tab (`target="_blank" rel="noopener noreferrer"`).

Styling per DESIGN-SYSTEM.md: 11px caption text, `--vigil-muted` color, centered 
or left-aligned consistent with the rest of the footer, the Atenax Project link 
in `--vigil-blue` on hover only (not permanently colored, keeps it understated).

Add both Spanish and English variants to the respective i18n locale files under 
a new `footer.credits` key:

```json
"footer": {
  "credits": "Hecho con esperanza y amor para Venezuela",
  "creditsBy": "Un proyecto de Orlando Toro — Atenax Project"
}
```//
(English equivalent: "Made with hope and love for Venezuela" / "A project by Orlando Toro — Atenax Project")

### 2.2 Also update the README

In the "Built By" section of `README.md`, keep the existing structure but ensure 
the Venezuela-with-love line appears there too, consistent with the in-app footer:

```markdown
## Built By

Made with hope and love for Venezuela 🇻🇪

[Orlando Toro](https://atenaxproject.com) — Founder, Bbluestudios LLC  
For the people of Venezuela. For anyone who needs it next.
```

### 2.3 Commit

```bash
git add -A
git commit -m "feat: PWA performance optimization + credits attribution

- Configured runtime caching strategy for offline-first behavior
- Audited and lazy-loaded heavy dependencies (Leaflet, Framer Motion)
- Added offline fallback page and form submission queue
- Added footer credits: Orlando Toro / Atenax Project, ES + EN
- Updated README Built By section"
git push
```

---

## Report back to Orlando

In your final summary, include:
1. Lighthouse Performance and PWA scores (before/after if measurable)
2. Total First Load JS size for the homepage and the map page
3. Confirmation that the offline queue works (test: go offline in DevTools, 
   submit a report, go back online, confirm it syncs)
4. Screenshot or description of how the footer credits look
