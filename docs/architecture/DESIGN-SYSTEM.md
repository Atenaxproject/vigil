# Vigil Design System v1.0
## The visual law for every UI session. Read before touching any component.

---

## Design Philosophy

Vigil looks like a modern infrastructure product — not an emergency app.
Most crisis platforms look like they were designed by a government agency in 2009.
Vigil looks like Linear or Vercel applied to humanitarian response.

The discipline: white space and restraint everywhere, except where it matters.
Where it matters = the status system. That's where Vigil expresses itself.

**Three rules that override everything:**
1. A rescue team leader must be able to read critical info in 3 seconds under stress
2. A victim's mother must be able to submit a report on a cracked phone screen in 30 seconds
3. An international volunteer who speaks no Spanish must navigate the app by icons alone

---

## Typography

**Fonts (import via next/font — no external requests):**
- `Geist` — headings, wordmark, large display text. Tight tracking at large sizes.
- `Inter` — all body text, labels, UI chrome. The universal legibility font.
- `Geist Mono` — timestamps, coordinates, IDs, technical data.

**Scale (v1.1 — accessibility revision; minimum floor raised to 13px):**
```
Display:  34px / 700 / tracking -0.02em  → Emergency hotline, hero numbers
H1:       26px / 600 / tracking -0.01em  → Page titles
H2:       20px / 600                      → Section titles  
H3:       17px / 500                      → Card titles, names
Body:     16px / 400 / leading 1.6       → Descriptions, notes (primary reading text)
Caption:  13px / 400 / leading 1.5       → Meta, timestamps, sources (minimum floor)
Mono:     13px / 400                      → Coordinates, IDs, codes
```

---

## Color Tokens

### Brand
```css
--vigil-ink:         #0F172A   /* Headings, UI chrome, dark surfaces */
--vigil-blue:        #2563EB   /* ALL interactive elements. One blue. */
--vigil-blue-light:  #EFF6FF   /* Blue tint backgrounds */
```

### Neutral
```css
--vigil-surface:     #FFFFFF   /* Primary background */
--vigil-cloud:       #F8FAFC   /* Secondary surfaces, input backgrounds */
--vigil-border:      #E2E8F0   /* All borders — 0.5px only */
--vigil-muted:       #64748B   /* Secondary text, icons at rest — WCAG AA ~4.6:1 on white */
--vigil-body:        #334155   /* Body text */
--vigil-heading:     #0F172A   /* Heading text */
```

### Status (NEVER change, NEVER theme — these are semantic)
```css
--status-missing:        #DC2626   /* Red — searching, danger */
--status-missing-bg:     #FEF2F2
--status-alive:          #16A34A   /* Green — found, safe */
--status-alive-bg:       #F0FDF4
--status-deceased:       #475569   /* Slate — dignified, muted */
--status-deceased-bg:    #F1F5F9
--status-unverified:     #D97706   /* Amber — caution, needs review */
--status-unverified-bg:  #FFFBEB
```

### Seismic (for map — magnitude visual encoding)
```css
--seismic-minor:    #22C55E   /* < 2.5  — green */
--seismic-light:    #F59E0B   /* 2.5–4.0 — amber */
--seismic-moderate: #F97316   /* 4.0–5.5 — orange */
--seismic-strong:   #EF4444   /* 5.5–7.0 — red */
--seismic-major:    #7C3AED   /* 7.0+    — violet */
```

### Dark Mode (CSS class: .dark applied to :root)
```css
--dark-bg:       #0A0F1E   /* Primary — slight blue undertone, easier on eyes than pure black */
--dark-surface:  #111827   /* Cards, panels */
--dark-surface2: #1F2937   /* Elevated surfaces */
--dark-border:   #374151   /* Borders */
--dark-text:     #F1F5F9   /* Primary text */
--dark-muted:    #9CA3AF   /* Secondary text */
```

---

## The Status Pulse System (Signature)

This is the one design element that makes Vigil unmistakable.
Every status is communicated through a living dot with behavior encoded in its motion.

### Missing — Animated pulse
Two concentric rings expand outward and fade, like a sonar ping searching.
The animation communicates "active search" without words.
```css
@keyframes pulse-ring {
  0%   { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2.8); opacity: 0; }
}
/* Ring 1: animation 2s ease-out infinite */
/* Ring 2: animation 2s ease-out 0.6s infinite (offset) */
/* Core: 8px solid #DC2626 circle */
```

### Found Alive — Static, solid
The animation STOPS. Stillness = resolution.
```css
/* Core: 8px solid #16A34A circle */
/* Ring: 0 0 0 2px #dcfce7 box-shadow only */
```

### Found Deceased — Silent
No animation. Muted. Dignified.
```css
/* Core: 8px solid #475569 circle, opacity 0.7 */
```

### Unverified — Rotating dashed border
SVG circle with stroke-dasharray, rotating slowly via animateTransform.
Motion = uncertainty. Still needs attention.
```xml
<circle stroke-dasharray="4 2" stroke="#D97706">
  <animateTransform type="rotate" dur="3s" repeatCount="indefinite"/>
</circle>
```

**Rule:** These four states are the only animated elements in the entire app.
Everything else is static. This is what makes the animations meaningful.

---

## Component Specs

### Emergency Banner
```
Height: 44px
Background: #0F172A (never red — red causes alert fatigue)
Always visible: position: sticky, top: 0, z-index: 100
Content order: warning icon · "Emergencias Venezuela" · hotline pill · Intérpretes · Cruz Roja · [aftershock count right-aligned]
Hotline pill: background #DC2626, white text, mono font, 700 weight
Links: border #1D4ED8, text #93C5FD
Aftershock count: font-mono, color #475569 — live count, low visual weight
```

### Missing Person Card
```
Border-radius: 12px
Border: 0.5px solid #E2E8F0
Photo: 44x44 rounded-lg, initials avatar fallback with gradient background
Name: 14px / 500
Meta row: 11px muted (gender, age, location)
Time: bold contrast (text-secondary)
Notes: 11px text-secondary, 2-line max, ellipsis overflow
Footer: 0.5px top border, flex space-between
  Left: source icon (WhatsApp green / Shield check green) + verification label
  Right: "Solicitar contacto" pill button (blue bg, white text)
Status dot: top-right of content area
NEVER show phone number, WhatsApp, or GPS coordinates publicly
```

### Map Markers (custom SVG — not default Leaflet pins)
```
Shape: Circle with colored ring + icon inside
Size: 32px default, 40px for urgent
Missing: Red ring, pulsing (matches badge animation)
Resource: Green ring, static
Shelter: Blue ring, static
Hospital: Pink ring (#EC4899), cross icon
Danger: Orange ring, triangle icon
Rescue zone: Purple ring, animated opacity pulse
Cluster: Count number in circle, color of most urgent contained type
```

### Buttons
```
Primary:   bg #2563EB, white text, 8px radius, 8px 16px padding
Secondary: bg surface-2, body text, 0.5px border-strong, same padding
Ghost:     transparent, muted text, no border
Danger:    bg #DC2626, white text (urgent actions only — delete, danger zone)
All:       13px / 500, 36px min-height, icon-left 16px, gap 6px
Touch:     min 44px height on mobile (iOS guideline)
```

### Form Inputs
```
Border: 0.5px solid --border-strong
Border-radius: 8px
Padding: 9px 12px
Font: 13px
Background: --surface-1 (slightly recessed)
Focus ring: 0 0 0 2px rgba(37,99,235,0.2) — blue glow
Label: above input, 11px / 500, text-secondary
Helper text: below input, 11px, text-muted
Privacy notice (always below contact fields): amber tint, lock icon
```

### Navigation

**Desktop sidebar (240px open / 64px icon-only):**
```
Background: --surface-0 (darkest surface)
Border-right: 0.5px solid --border
Icon: 24px Lucide/Tabler outline
Label: 13px / 400
Active: blue icon + text, blue 4px left border indicator
Hover: surface-1 background
```

**Mobile bottom bar (PWA primary nav):**
```
Background: --surface-2
Border-top: 0.5px solid --border
5 tabs: Mapa | Buscar | [+ Reportar center] | Ayuda | Más
Active tab: blue icon + label + 4px dot below icon
Reportar (center): 40px blue circle button elevated above bar (floating action style)
Safe area: padding-bottom env(safe-area-inset-bottom) for iPhone notch
```

---

## Layout Grid

```
Desktop: sidebar 240px + main content max-width 1280px
  Main split: 40% list panel (missing persons/feed) + 60% map
  Sidebar: sticky, scrollable list, real-time updates
  Map: fixed viewport height, layer toggles top-right

Tablet (768px–1024px): top nav bar, full-width sections, no split

Mobile (<768px): bottom nav, full-width sections, map full-screen toggle
  Form fields: full-width, large touch targets
  Cards: full-width, comfortable padding
```

---

## Motion Rules

**Animated:** Status pulse dots (4 states, always running)
**Transitional:** Card fade-in on real-time update (200ms opacity 0→1, no translate)
**Interactive:** Button active state scale(0.98) (80ms)
**Map:** Marker bounce on new urgent need (300ms)
**Page:** No page transitions — instant load priority over aesthetics

**Always respect:** @media (prefers-reduced-motion: reduce) → disable all animations except status dots (they carry meaning, reduce to opacity-only)

---

## Icons

Library: Lucide React (tree-shakeable, consistent 1.5px stroke, all outline)
Sizes: 16px (inline text), 20px (buttons, nav), 24px (feature, map controls), 32px (empty states)
Never: emoji in functional UI, filled icons, mixing libraries
Status icons: custom SVG only (the pulse system, not from any library)

---

## PWA-Specific Design

- Splash screen: #0F172A background, Vigil wordmark white, no loading bar
- App icon: White V on #2563EB background, masked corners
- Install prompt: bottom sheet on mobile after 3rd visit
- Offline indicator: thin top bar #D97706 with "Sin conexión" — forms still work
- Loading: skeleton screens (not spinners) with shimmer animation
- Pull to refresh: custom indicator, not browser default

---

## Tailwind Config Extension (add to tailwind.config.ts)

```typescript
theme: {
  extend: {
    colors: {
      vigil: {
        ink:     '#0F172A',
        blue:    '#2563EB',
        'blue-light': '#EFF6FF',
        cloud:   '#F8FAFC',
        muted:   '#64748B',
      },
      status: {
        missing:         '#DC2626',
        'missing-bg':    '#FEF2F2',
        alive:           '#16A34A',
        'alive-bg':      '#F0FDF4',
        deceased:        '#475569',
        'deceased-bg':   '#F1F5F9',
        unverified:      '#D97706',
        'unverified-bg': '#FFFBEB',
      },
      seismic: {
        minor:    '#22C55E',
        light:    '#F59E0B',
        moderate: '#F97316',
        strong:   '#EF4444',
        major:    '#7C3AED',
      },
    },
    fontFamily: {
      sans:  ['Inter', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      display: ['Geist', 'var(--font-geist-sans)', 'sans-serif'],
      mono:  ['Geist Mono', 'var(--font-geist-mono)', 'monospace'],
    },
    borderRadius: {
      'card':  '12px',
      'input': '8px',
      'badge': '100px',
    },
  }
}
```

---

## What Never Goes In Vigil

- Gradients of any kind (no heroic blurred blob backgrounds)
- Drop shadows (except card: 0 1px 3px rgba(0,0,0,0.06))
- Decorative illustrations or stock photography
- Rounded corners > 12px (except pills/badges)
- More than one blue (--vigil-blue is the only interactive color)
- Red outside of status-missing and danger buttons
- Animations not in the approved list above
- Font sizes below 13px
- Anything that takes longer than 3 seconds to load on 3G

---

*DESIGN-SYSTEM.md — Vigil v1.0 | Bbluestudios LLC | 2026*
*This document is law. Claude reads it before every UI session.*
