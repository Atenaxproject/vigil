# Build Prompt 34 — Connectivity / Comms Layer on Crisis Map

**Status:** Completed 2026-07-02

## Objective
Surface real-time, ground-truth information about where working internet connectivity
exists — Starlink terminals, restored cell service, open WiFi — so families and rescuers
without their own connection know where to go. This is a data-and-UI feature, not a
hardware or logistics feature.

## Deadline
Live before **July 25, 2026**. That's when Starlink's free-service window for the
Venezuela earthquake response closes. This is a real deadline, not a target — the
informational value of this feature drops sharply after that date.

## Step 0 — Verify before writing any code
This may already be mostly built. Do not assume new architecture is needed.

1. Confirm `map_markers.category` already includes `comms` (per VIGIL-BIBLE section 4 —
   category list includes food/water/medical/rescue/shelter/clothing/comms/power/transport/other).
2. Check the live map: does `category: 'comms'` currently render with its own distinct
   icon, or is it visually grouped into `other`?
3. Check the map layer panel: are `comms` markers already filterable, or only visible
   when "Recursos" is toggled with no way to isolate them?

**If comms already has a distinct icon and is filterable — skip to "Content to seed"
below. This is a data population task only.**

## Step 1 — Close the icon/filter gap (only if Step 0 found a gap)
- Add a distinct icon for `category: 'comms'` markers. Suggest a WiFi/signal glyph,
  amber treatment consistent with the existing Punto de Acopio marker style so it fits
  the current icon language — don't introduce a new color outside the existing palette.
- Confirm `comms` markers surface under the existing "Recursos" map layer toggle. Add a
  standalone toggle only if user testing shows people can't find it nested — don't add
  one preemptively.
- No schema migration should be needed if `type`, `category`, `status`, and a
  description/notes field already exist on `map_markers` — they do, per the existing
  schema. Confirm the exact column name for free-text notes before building the
  submission form.

## Step 2 — Submission flow
Reuse the existing citizen self-registration pattern already built for Punto de Acopio:
low-friction, auto-approved, community-flaggable, admin-verifiable after the fact. Do
not gate this behind organization approval — the entire point is speed and crowd-sourced
ground truth during an active, fast-moving deployment.

Capture in the existing description/notes field (no new columns needed for v1):
- What kind of connectivity (Starlink terminal / restored cell signal / open WiFi)
- Hours or availability window
- Any access restriction (public / rescue teams only / NGO staff only)

## Step 3 — Phase 2 (do not build now — only revisit if Phase 1 volume justifies it)
A dedicated `connectivity_type` enum column with distinct sub-icons per type. This adds
schema surface for a benefit that's speculative until real submission volume proves it's
needed. Ship Phase 1 first.

## Step 4 — Información Hub static content block
Add a static verified-info card to `/informacion`, same pattern as the existing Emergency
Contact Directory block:
- Link to Starlink's Venezuela earthquake support page
- Link to starlink.com/activate (account creation/management)
- One line distinguishing the two paths: "ya tengo un kit" vs. "no tengo un kit"
- [former rescue-coordination label]
- Note that carrier-based free access is rolling out by provider (Movistar confirmed
  first; Digitel/Movilnet status changes — do not hardcode a claim that will go stale,
  phrase as "confirma con tu operador")

Content for this block can be pulled directly from
`starlink-connectivity-venezuela-share.md` (companion file, already drafted in Spanish).

## Explicitly out of scope
- **Do not publish a "master list" of exact terminal distribution addresses.** No such
  public list currently exists — the U.S. government/Starlink response is routing units
  through NGOs and agencies, not publishing a citizen-facing address list. Claiming
  comprehensive coverage Vigil doesn't have would be actively harmful — it could send
  someone to a location that doesn't exist. The feature's entire value is letting real
  ground-truth reports accumulate over time, not faking authority on day one.
- **Do not build kit distribution, hardware sourcing, or logistics into Vigil.** Software
  and information routing only. That work is already being done at a scale Vigil can't
  match — see Bureau of Disaster and Humanitarian Response / Starlink MOU (activated
  June 11, 2026).

## Definition of done
- `comms` markers are visually distinct and filterable on the live map.
- Citizens can submit a comms marker through the same low-friction flow as Punto de
  Acopio, with no new database migration if Step 0 confirms the schema already supports it.
- Información Hub shows the static Starlink info card.
- Live and tested before July 25, 2026.

## Step 5 — Link verification (do this last, before marking done)
Locate the Información Hub static connectivity content block (Step 4). Replace any
placeholder, TODO, or guessed link text with these confirmed URLs exactly as written —
do not modify, shorten, or substitute alternates:

- Starlink Venezuela earthquake support: https://starlink.com/support/article/28779c02-f1cb-4d77-1f75-b947ae179c91
- Starlink account activation: https://starlink.com/activate
- Starlink emergency response info: https://starlink.com/emergency-response

Search the diff/codebase for any other placeholder syntax tied to this feature (TODO,
[link], "buscar en starlink.com", etc.) and flag it instead of guessing a URL to fill
the gap. Do not invent or infer any link not explicitly listed above.

---

## Implementation notes (2026-07-02)

**Step 0 finding:** `comms` existed in schema but had no distinct map rendering or
submission flow — green `ResourceLayer` treated all resources identically.

**Shipped:**
- `CommsLayer` — amber dashed CircleMarker + WiFi glyph in popup; shown under Recursos toggle
- `/conectividad` citizen submission form + `/api/connectivity/submit` (type=resource, category=comms)
- `ConnectivityInfoCard` on `/informacion` with verified Starlink URLs + [former rescue-coordination label] + carrier disclaimer
- i18n across all 8 locales; nav link in Más menu
- No new DB migration (uses existing `map_markers.description`)
