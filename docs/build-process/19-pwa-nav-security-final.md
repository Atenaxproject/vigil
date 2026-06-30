# Vigil — PWA Install UX, Bottom Nav Definition, CRITICAL Security Gate
## Paste into Cursor Composer (Agent mode)

---

## TASK A — CRITICAL: Security Check (do this FIRST, before anything else)

This must be verified before Vigil is shared publicly. Run and report results exactly:

```bash
grep -rln "SUPABASE_SERVICE_ROLE_KEY\|ANTHROPIC_API_KEY" --include="*.tsx" --include="*.ts" src/
```

For EVERY file returned, manually confirm it is one of:
- A file under `src/app/api/` (server-side API route)
- A file with `'use server'` directive at the top
- A file in `src/lib/supabase/admin.ts` or similar server-only utility

If ANY result is a client component (no `'use server'`, not in `/api/`, 
likely has `'use client'` at the top, or is a regular component rendered 
in the browser), this is a CRITICAL security leak — secrets would be 
bundled into client-side JavaScript and visible to anyone who views page 
source. Stop and report this immediately if found, do not proceed with 
other tasks until confirmed clean.

Also check the built output directly for extra certainty:
```bash
npm run build
grep -rl "SUPABASE_SERVICE_ROLE_KEY\|sk-ant-" .next/static/ 2>/dev/null
```

This should return ZERO results. If anything is found in the static build 
output, that confirms a real leak requiring immediate fix.

Report explicitly: "Security check: CLEAN" or "Security check: LEAK FOUND in 
[file]" — no ambiguous answers.

---

## TASK B — Bottom Navigation Definition (exact spec, confirm applied)

```css
.mobile-bottom-nav {
  border-top: 1px solid var(--vigil-border); /* #E2E8F0 */
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  background: var(--vigil-surface); /* must be fully opaque #FFFFFF */
}
```

If this was already applied in a previous session, verify it's actually 
present in the compiled CSS and visually confirm via a fresh screenshot 
that it now shows clear separation from content above it. If not yet 
applied, apply it now to whatever component renders the mobile bottom nav.

---

## TASK C — PWA Install UX (iOS banner + Android trigger button)

iOS Safari does NOT support the `beforeinstallprompt` API at all — there is 
no way to programmatically trigger an install prompt on iOS, by design from 
Apple. The only path on iOS is manual: Share button → "Agregar a pantalla 
de inicio." Since this is undiscoverable, add an in-app educational banner.

### C1. Detect platform and show appropriate UI

```typescript
// src/lib/pwa-install.ts
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

export function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false
  return (window.navigator as any).standalone === true || 
    window.matchMedia('(display-mode: standalone)').matches
}
```

### C2. iOS Install Banner Component

Create `src/components/pwa/IOSInstallBanner.tsx` — a small, dismissible 
banner shown once per session (use sessionStorage to track dismissal) to 
iOS Safari users who haven't already installed:

```
📱 Instala Vigil en tu pantalla de inicio
Toca [Share icon] y luego "Agregar a pantalla de inicio"
[Entendido]
```

Show this only when `isIOS() && !isInStandaloneMode()`. Style per 
DESIGN-SYSTEM.md — small, friendly, dismissible, positioned so it doesn't 
block the bottom nav or any primary action.

### C3. Android/Chrome Install Button

```typescript
// Capture the native install prompt event
let deferredPrompt: any = null

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  // Show your custom "Instalar Vigil" button when this fires
})

// On button click:
async function triggerInstall() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
}
```

Add a small "Instalar Vigil" button (e.g., in the "Más" menu or footer) 
that only appears when this event has fired (meaning the browser supports 
native install — primarily Android Chrome/Edge), calling `triggerInstall()` 
on click.

### C4. Fix apple-touch-icon (separate from manifest.json icons)

iOS specifically requires this link tag in `<head>` — it does NOT reliably 
use manifest.json icons for the home screen icon:

```bash
grep -n "apple-touch-icon" src/app/layout.tsx
```

If missing, add to the metadata or head:
```tsx
<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
```

Confirm this icon file actually exists at that path and is a proper square 
PNG (iOS will reject/ignore malformed icons).

### C5. Verify manifest.json is linked

```bash
grep -n "manifest" src/app/layout.tsx
```

Confirm `<link rel="manifest" href="/manifest.json" />` exists (Next.js 
App Router may handle this via metadata export instead — confirm whichever 
method is used actually works by checking the rendered page source).

---

## Commit

```bash
git add -A
git commit -m "fix: critical security verification, bottom nav visual definition, 
PWA install UX for iOS and Android

- CONFIRMED clean: no service role or API keys leak into client bundle
- Applied bottom nav border/shadow for clear visual separation
- Added iOS install instruction banner (Share -> Add to Home Screen)
- Added Android/Chrome native install prompt button
- Fixed apple-touch-icon link tag for proper iOS home screen icon

Co-authored-by: Claude <noreply@anthropic.com>"
git push
```

Save this file as the next numbered doc in docs/build-process/.

---

## Final Report — Required

1. **Security check result** — explicit CLEAN or LEAK FOUND, with file names if found
2. Confirm bottom nav now shows visible border/shadow separation
3. Confirm iOS banner appears correctly when testing in iOS Safari (not standalone mode)
4. Confirm apple-touch-icon file exists and is properly linked
5. **Overall launch readiness verdict**: with security confirmed clean and 
   these fixes applied, is Vigil ready to be shared publicly? State this 
   explicitly, yes or no, with reasoning.
