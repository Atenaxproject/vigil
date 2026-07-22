# 64 — Emergency Directory, Psychosocial Lines, and Network Additions
## REVISION 2 — supersedes the original. The verification gate is now RESOLVED; see Part A.

**Priority:** P1 — directly serves the arriving DTV user.
**Depends on:** 60 merged. **63 REV2 Part A merged** — this prompt requires the provenance system, since every number here carries a source and date.
**Routing:** Normal PR. Ships `critical: true` strings; PR description lists every number with its source.

---

## Part 0 — The gate is resolved. Nothing here is blocked.

Orlando is US-based and cannot dial Venezuelan numbers. Phone verification was never workable for a solo operator abroad. The standing standard, now applied and resolved:

1. A number ships when **two independent sources agree and none contradicts**.
2. On conflict, **the issuing organization's own published channel wins**.
3. Every number displays source and verification date.
4. Every number carries a user-reportable "didn't work" affordance.

---

## Part A — Final directory. Ship exactly this list.

### SHIP

| Line | Number(s) | Type | Basis |
|---|---|---|---|
| Emergencias — nacional | 911 · Movistar 911 · Digitel 112 · Movilnet \*1 · Cantv 171 | público | Live on Vigil header; carried by all six peer platforms surveyed |
| Protección Civil — nacional | 0800-7248451 (0800-PCIVIL1) | público | Organization's own published channel |
| Protección Civil — short code | 166 | público | Multiple independent sources |
| Bomberos — short code | 167 | público | Multiple independent sources |
| Cruz Roja Venezolana | 0212-578-2516 · 0212-571-2411 · socorristas 0212-571-4713 | público | Corroborated across sources spanning a decade; re-verified 2026-06-25 |
| FUNVISIS | 0800-836-2567 · 0212-257-5153 | público | Same corroboration; re-verified 2026-06-25 |
| TAP — Telemedicina de Acceso Público | 0212-822-1262 | público | Citizen directory, verified 2026-06-27. Free, 24/7 |

### REMOVE — `[former rescue-coordination label]` / [removed-hotline]

**Delete globally.** Grep the entire repo; it appears in more places than the obvious ones — `crisis.config.ts`, footer strings, the emergency directory, and possibly the AI assistant's hardcoded routing instruction.

Rationale, under the standard above: six peer platforms were surveyed — DTV, Yummy SOS, Centros de Ayuda Venezuela, Mapa de Necesidades VZLA, ayudavenezuela.app, venezuela.tiltely.com. **None of them carries this number.** It appears only on Vigil. Zero corroboration is a fail, not a tie.

### DO NOT SHIP — `[do-not-ship-PC-alt]` and alternates (0800-266-8446, 0800-262-4368)

Single-sourced to one peer platform, contradicted by Protección Civil's own channel, and identified in older Venezuelan directories as **0800-LLUVIAS**, historically a flooding line. Keep the research note; if a second independent source appears, reconsider.

---

## Part B — `service_type`, and why it is mandatory

Add a required field to every directory entry: **`público` | `privado`**, rendered visibly on the entry.

**The worked example, from DTV's own footer.** Their emergency block — carried site-wide — is headed *"Teléfonos de emergencia · Caracas"* and lists, with no distinction between them:

- 911 and the four carrier variants — **public, free**
- Aeroambulancias — 0212-993-2541 / 992-8980 / 992-8990 / 991-7940 — **private air ambulance**
- Rescarven — 0212-993-6911 / 993-6991 / 993-1310 / 993-3367 — **private healthcare company**
- Ambulancia Metropolitano (S.A.M.) — 0212-545-4545 / 545-4655 / 577-9209 — **private**

A person in crisis reading that list has no way to know that three of the four may involve cost or membership. DTV is the most careful operation in this response and this still slipped through, which is exactly why Vigil encodes it structurally rather than relying on editorial care.

Vigil may carry these private services — they are real and useful — but only labeled **servicio privado · puede tener costo**. Never unlabeled, never adjacent to 911 without visual distinction.

---

## Part C — Restructure the directory by state, not as one national list

DTV's block is Caracas-only. Vigil's worst-affected region is **La Guaira — 65% of all reported persons in the federated dataset**, followed by Distrito Capital, Miranda, Carabobo, and Aragua.

A Caracas-first directory is a coverage failure for Vigil's actual primary user.

**Structure:** national lines first (911, 166, 167, Protección Civil, FUNVISIS, Cruz Roja, TAP), then a state-selector defaulting to **La Guaira**, with Distrito Capital, Yaracuy, Carabobo, Aragua, Miranda, and Falcón surfaced above the rest.

Where a state has no verified local numbers, say so plainly and route to the national lines. Do not pad with unverified entries. `ayudavenezuela.app` runs a per-state directory with individual verification dates and is the reference model for this.

---

## Part D — Psychosocial support (link-out only)

**Scope boundary, hard.** Vigil links. Vigil does not operate, staff, moderate, triage, or intermediate psychosocial support in any form. This is a directory section, not a service. Any future request to add chat, intake, follow-up, or matching is a separate initiative decision and does not get made inside a Vigil PR.

Rationale: DTV is standing up `redapoyoemocional.com` for this; competing with a federation partner is incoherent; and a support service carries duty-of-care exposure categorically unlike anything Vigil holds.

### SHIP

| Organization | Contact | Detail |
|---|---|---|
| PsicoLínea Venezuela (UCAB) | 0414-121-7882 · 0424-172-3981 | Free psychological care. **Only reachable from inside Venezuela** — state this explicitly |
| Grupo Venemergencia | via their published channels | Venezuelan medical platform; attends physical and psychological effects |

PsicoLínea is corroborated: DTV's directory and an independent source, no contradiction.

### HOLD — do not ship

LAPSI (+58 424 290 7338), Psicólogos sin Fronteras Venezuela (0424 927 0304), Cecodap (0414 269 6823).

These were in REV1 on a single source. DTV — the most thorough directory in the response — does not list them. Under the two-source rule they are held. Keep the research note. This is the standard applying to itself.

**Placement:** a section on `/informacion`, plus a contextual link in the `/buscar` zero-result state. The moment a person learns their search returned nothing is when this is most relevant. Not in global nav.

**Copy constraint:** state availability plainly, including PsicoLínea's Venezuela-only limitation. A diaspora user in Madrid dialing a number that cannot connect is worse off than one who knew in advance.

---

## Part E — "This number didn't work" reporting

Every directory entry gets a one-tap report affordance.

- No form, no account. Writes to the existing `feedback` table, category `bad_number`, with the entry identifier.
- Rate-limited on the existing IP-hash pattern.
- After N independent reports on the same entry (configurable, suggest 3), the entry renders with a **"reportado como no disponible"** marker automatically. Marked, not removed — removal stays a human decision.
- Surface the report count in the admin view.

This turns referral traffic into the verification layer. It is the only mechanism here that scales past one person who cannot dial Caracas.

---

## Part F — Network additions to `/red`

Person-search platforms currently in DTV's directory and absent from Vigil's:

- **Encuentrame VZLA** — encuentramevzla.com — locates people found and taken to hospitals
- **CIVIS Venezuela** — civisvenezuela.com — person search, damage reports, risk map, supply points, aftershocks, WhatsApp attention with AI agents

Emergency-directory platforms worth listing:

- **ayudavenezuela.app** — per-state directory with per-entry verification dates
- **venezuela.tiltely.com** — search and aid coordination with safety guidance

Link-only. **No data scraped from any of them.** Federation happens by invitation and agreement, as with DTV, or not at all.

**Do not replicate one thing from tiltely:** it directs users to report through VenApp. VenApp is permanently excluded from Vigil over its documented repurposing for surveillance. Listing a platform does not mean adopting its recommendations — simply do not carry it, and do not explain the omission to users.

---

## Part G — `/conectividad` addition

**Movistar / O2 / MasOrange are running free international calls between Spain and Venezuela for the duration of the emergency.** Spain holds one of the largest Venezuelan diaspora populations and Vigil already has a connectivity page. Direct fit, add it with source and date.

---

## Acceptance criteria

- `grep -ri "[former rescue-coordination label]\|[removed-hotline]"` returns zero results
- `[do-not-ship-PC-alt]` appears nowhere
- Every entry renders `service_type` visibly; no private service unlabeled beside 911
- Directory is state-structured, defaulting to La Guaira
- Every number carries source and verification date per 63 REV2 Part A
- Psychosocial section live on `/informacion` and linked from the `/buscar` empty state, with PsicoLínea's Venezuela-only limitation stated
- Report-a-bad-number works end to end and writes to `feedback`; auto-marking threshold functions and is configurable
- Four platforms added to `/red`, link-only
- Movistar/O2/MasOrange on `/conectividad`
- All 8 locales; ES and EN handcrafted
- `scripts/visual-check.mjs` proof for `/informacion`, `/buscar` empty state, `/red`, `/conectividad`

---

## Constraints

- Add no number not listed in Part A. If you find others, report them — do not ship them.
- Build no psychosocial functionality beyond links.
- Scrape nothing from any listed platform.
- Design system unchanged.

---

## Report back

Confirm each Part A number against a live source at implementation time and record what you found. If any has changed, **stop and report rather than substituting** — a wrong emergency number is the worst possible failure on this platform.
