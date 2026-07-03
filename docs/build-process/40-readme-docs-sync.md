# VIGIL BUILD PROMPT #40 — README + Docs Index Sync
### Housekeeping only, no schema/feature changes. Verified against live repo state 2026-07-03.

---

## WHY

README.md has drifted behind shipped state after #38 (branding/orgs) and #39 (property assessment) merged. This is a documentation-accuracy pass — the repo is the credibility layer for partner outreach (NetHope, IFRC, Google.org), it needs to say what's actually true.

---

## 1. README.md — "What's live now" table (Core crisis tools section)

Add a new row:

```
| **Property safety assessment** | `/evaluacion-estructural` | ATC-20-style green/yellow/red tagging; volunteer-assigned only (structural_engineer/architect/surveyor roles), never AI-assigned; claim link at `/mi-evaluacion/[token]` |
```

## 2. Fix organization count (two locations, both currently wrong)

- "How to help" row: change "18 verified donation orgs" → "17 verified donation orgs"
- Project Status "Live Now" bullet: change "Organization directory — 16 verified NGOs seeded" → "Organization directory — 17 verified NGOs seeded (including Hogar Bambi Venezuela, child protection)"

Confirm against `supabase/seeds/003_hogar_bambi.sql` — its own header comment says "17th verified organization," that's the source of truth.

## 3. Official contact line

Current:
```
📬 **Official contact** — `vigil@youthewave.org` and `vigil.support@youthewave.org` via Cloudflare Email Routing.
```
Update to:
```
📬 **Official contact** — `vigil@youthewave.org`, `vigil.support@youthewave.org`, and `support@youthewave.org` via Cloudflare Email Routing.
```

## 4. Project Status "Live Now" — add property assessment bullet

```
- **Property safety assessment** — `/evaluacion-estructural`, ATC-20 green/yellow/red tagging, volunteer-assigned (structural_engineer/architect/surveyor), never AI-assigned, ToS §4 liability language
```

## 5. Volunteer marketplace row — reflect new skill categories

Current row in the table just says "Skills registration and directory." Add a parenthetical: "(now includes structural_engineer, architect, surveyor for post-disaster property assessment)."

---

## 6. docs/README.md — build-process index

Append entries for #34–39, matching the existing one-line format. Use these five directly (confirmed against CHANGELOG.md):

```
- `34-connectivity-comms-layer.md` — WiFi/Starlink/cell signal citizen reports, `/conectividad` map layer
- `35-crisis-statistics-update.md` — manual crisis statistics refresh across all 8 locales
- `37-sister-platforms-fix-and-pwa-closeout.md` — CIVIS Venezuela, SOS Venezuela 2026, Red Venezuela Activa added to config; PWA Phase 2 closed
- `38-branding-orgs-update.md` — youthewave.org branding swap, Hogar Bambi (17th org), Mapa de Necesidades VZLA (8th sister platform)
- `39-property-safety-assessment.md` — Evaluación de Seguridad Estructural: ATC-20 tagging, volunteer taxonomy extension, ToS §4
```

For `36-repo-audit-pwa-cleanup.md` — read the actual file content and write its one-line summary yourself; it wasn't in the context available for this prompt and I'm not going to guess at what it covered.

---

## 7. package.json — description field

Current:
```
"Vigil — Open-source humanitarian crisis platform. Real-time missing persons, Claude AI assistant, photo search, geo breakdown, crisis map. Live at vigil.youthewave.org."
```
Update to:
```
"Vigil — Open-source humanitarian crisis platform. Real-time missing persons, Claude AI assistant, photo search, crisis map, and post-disaster property safety assessment. Live at vigil.youthewave.org."
```

---

## NOT INCLUDED — Orlando does this one himself

The GitHub repo's "About" description (the text on the repo homepage, separate from any file — Settings → pencil icon next to "About") isn't editable by Cursor or Claude. Recommended text to paste in directly:

```
Open-source humanitarian crisis platform — missing persons, crisis mapping, AI coordination, and post-disaster structural safety assessment, in 8 languages. Live at vigil.youthewave.org. Built for Venezuela 2026, redeployable for any disaster.
```

---

*Verified against live repo (github.com/Atenaxproject/vigil) 2026-07-03. No schema, RLS, or feature changes in this prompt — docs only.*
