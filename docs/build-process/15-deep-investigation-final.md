# Vigil — Deep Investigation & Proof-Required Mobile Fix
## Paste into Cursor Composer (Agent mode)
## If Cursor stalls or claims success without proof, hand this exact file to Claude Code CLI instead.

---

## READ THIS FIRST

Previous fix attempts have been reported as complete but did not visually 
resolve when tested on a real device. This means: do not report anything as 
"fixed" without attached proof (terminal output, file contents, or 
screenshots). Investigate root causes fully before changing code. If you are 
not certain something is fixed, say so explicitly rather than claiming success.

---

## PHASE 1 — Root Cause Investigation (do this BEFORE fixing anything)

### 1.1 Check the viewport meta tag — most likely root cause

```bash
grep -rn "viewport" src/app/layout.tsx
```

Next.js 14 App Router requires an explicit `viewport` export (separate from 
`metadata` as of recent Next versions). Check if `src/app/layout.tsx` has:

```typescript
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}
```

If this is MISSING, or if viewport is incorrectly bundled inside the old 
`metadata` export instead of its own `viewport` export, THIS is very likely 
the root cause of the entire "looks like shrunk desktop" problem — without 
it, mobile browsers render the page assuming a ~980px desktop viewport and 
scale everything down, which breaks every responsive breakpoint regardless 
of how correct the underlying CSS is.

Show me the exact current content of the metadata/viewport exports in 
`layout.tsx` before changing anything.

### 1.2 Verify previous fixes were actually applied and deployed

```bash
git log --oneline -20
grep -n "darkMode" tailwind.config.js tailwind.config.ts 2>/dev/null
grep -rn "md:flex\|md:hidden" src/components/layout/ src/app/ 2>/dev/null | grep -i "sidebar\|nav"
```

Report exactly what these show. Confirm whether the dark mode config fix and 
breakpoint fix from previous sessions actually exist in the current code, or 
whether they were lost/reverted/never committed properly.

### 1.3 Check what's actually deployed live vs. local

```bash
git status
git log -1 --format="%H %s"
```

Compare against what Vercel shows as the latest production deployment. If 
local commits exist that were never pushed, or pushed but Vercel deployment 
failed silently, THAT explains why fixes don't appear live even if the code 
is correct locally.

```bash
vercel ls
```

Report the latest deployment status and timestamp.

---

## PHASE 2 — Fix Based on Actual Findings

### 2.1 Fix viewport (if Phase 1.1 found it missing/wrong)

```typescript
// src/app/layout.tsx
import type { Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allow some user zoom for accessibility, but set a sane default
  userScalable: true,
}
```

### 2.2 Re-verify and re-apply dark mode fix if Phase 1.2 shows it's missing

```javascript
// tailwind.config.js / tailwind.config.ts
darkMode: 'class',
```

Confirm zero `dark:` utility classes remain:
```bash
grep -rln "dark:" --include="*.tsx" src/ | xargs -I{} echo "FOUND IN: {}"
```

### 2.3 Re-verify and re-apply breakpoint fix if Phase 1.2 shows it's missing

The mobile/desktop layout switch must use `lg:` (1024px), not `md:` (768px). 
Find every instance and confirm the fix is actually present in current code:

```bash
grep -rn "md:flex\|md:hidden\|md:block\|md:grid" src/ --include="*.tsx" | grep -iv "node_modules"
```

For any result controlling the sidebar-vs-bottomnav layout decision 
specifically, change `md:` to `lg:`.

### 2.4 Make the Map Layer Panel Collapsible by Default on Mobile

This is a NEW fix — the layer toggle panel (Réplicas, Necesidades, Refugios, 
etc.) should NOT be open/visible by default on mobile, taking up map space. 
Standard mobile pattern:

- On viewports below `lg:` (1024px), the layer panel starts CLOSED
- Show a small floating button (e.g., a layers/filter icon, bottom-right or 
  top-right corner of the map, NOT overlapping zoom controls) to open it
- When opened, it should appear as a bottom sheet (slides up from bottom, 
  takes appropriate height, has a visible close button or backdrop tap-to-close) 
  rather than a floating box that can overlap/cover the map
- On desktop (`lg:` and above), it can remain as the current always-visible 
  side panel since there's adequate screen space

This applies the same "retractable menu" pattern Orlando expects from normal 
mobile apps — nothing should stay permanently open and blocking content on 
a small screen.

---

## PHASE 3 — Automated Visual Proof (do not skip this)

Set up Playwright to capture actual screenshots as evidence, rather than 
relying on text claims:

```bash
npm install -D playwright
npx playwright install chromium
```

Create `scripts/visual-check.mjs`:

```javascript
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
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.screenshot({ path: `screenshots/${vp.name}.png`, fullPage: false })
  console.log(`Captured: screenshots/${vp.name}.png`)
  await page.close()
}
await browser.close()
```

Run it against the LIVE production site to get real proof:

```bash
CHECK_URL=https://vigil.youthewave.org node scripts/visual-check.mjs
```

This produces actual PNG screenshots in a `screenshots/` folder. List the 
files created and their sizes (confirms they're not blank/broken captures):

```bash
ls -la screenshots/
```

Do this AFTER deploying your fixes (push first, wait for Vercel deployment 
to complete, then run this against the live URL) — not against localhost, 
since the goal is proof of what Orlando will actually see.

---

## PHASE 4 — Repo & README Alignment (accurate, verified status)

Do not assume what's built — verify by checking actual files/routes/tables 
before categorizing anything.

```bash
find src/app -name "page.tsx" | sort
```

For each route found, briefly confirm it has real implementation (not a 
stub/placeholder) by checking file size and skimming content.

```bash
grep -rn "CREATE TABLE" supabase/migrations/ | grep -o "CREATE TABLE [a-z_]*"
```

This gives the real list of tables that exist.

Update `README.md` with an honest, verified status section:

```markdown
## Project Status

### ✅ Live Now
[List only features you directly verified exist as working code/routes/tables]

### 🔧 In Progress
[Features with code present but missing a config/API key/manual step — be specific]

### 🔜 Coming Soon
[Features discussed but not yet built]
```

---

## PHASE 5 — Final README Visual Polish

Confirm the banner SVG and badges from the previous session actually exist 
and render:

```bash
ls -la docs/assets/vigil-banner.svg
head -30 README.md
```

If the banner is missing or the README header section wasn't actually 
updated, complete it now per the earlier spec (dark background matching 
DESIGN-SYSTEM.md, Vigil wordmark, tagline, badges, live URL link).

---

## PHASE 6 — Commit Everything

```bash
git add -A
git commit -m "fix: viewport meta tag, mobile layer panel collapsibility, verified dark mode and breakpoint fixes with automated visual proof

- Added/fixed Next.js viewport export (likely root cause of desktop-scaled 
  mobile rendering)
- Re-verified and confirmed dark mode and breakpoint fixes are actually 
  present in code (were previously claimed but unverified)
- Made map layer panel collapsible/bottom-sheet pattern on mobile, closed by default
- Added Playwright-based automated screenshot capture for visual regression proof
- Updated README with verified (not assumed) feature status

Co-authored-by: Claude <noreply@anthropic.com>"
git push
```

Wait for Vercel deployment to complete, then re-run the Playwright screenshot 
script against the live URL as final proof.

---

## FINAL REPORT TO ORLANDO — Required Format

1. **Root cause found**: was the viewport meta tag missing? Show the exact 
   before/after of layout.tsx
2. **Previous fixes status**: were dark mode config and breakpoint fixes 
   actually present before this session, or had they been lost? Show proof
3. **Screenshots**: list every file in `screenshots/` with file size, 
   confirming real captures exist
4. **Honest verdict**: describe specifically what the screenshots show — 
   does mobile portrait/landscape now look correct? If anything still looks 
   wrong in the screenshots themselves, say so explicitly — do not claim 
   success if the screenshot shows otherwise

---

*Archived from root `CURSOR-DEEP-INVESTIGATION-FINAL.md` on 2026-06-30.*
