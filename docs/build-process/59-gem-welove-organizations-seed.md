# Prompt 59 — Add GEM + We Love Foundation to Vigil (verified organizations + permanent facility markers)

> Place this file in docs/build-process/ as the next sequential number (rename if 59 is taken).
> Execution: Cursor Agent / Fable. Read completely before executing. This is a data-seed
> and content task — no schema changes, no security-sensitive paths, direct commit to main
> is acceptable per the PR routing rule (does not touch src/lib/security/, auth, RLS,
> contact-info handling, or sanitization).

## Context — why this change

Global Empowerment Mission (GEM) is the U.S. State Department's official private
partner for the Venezuela earthquake response: 11+ consecutive large-scale
distributions, 55,000+ survivors served with full kits, a permanent GEM LATAM
headquarters in La Guaira, daily cargo flights from Doral FL, and a stated $50M
aid commitment over 6 months. We Love Foundation (operating publicly as
"I Love Venezuela") is GEM's operating partner on every Venezuela distribution.

Vigil outreach to both organizations was sent on 2026-07-11 offering free
coordination tooling. This prompt makes Vigil's side of that offer real and
visible BEFORE they respond: both orgs appear in the verified directory, GEM's
permanent facilities appear on the map, and the /como-ayudar page reflects
their role. If either org checks Vigil after reading the email, they should
find themselves already represented accurately and respectfully.

## Explicit non-goals (do not build)

- Do NOT add past distribution sites (Iglesia Santo Domingo de Guzmán,
  Catedral San Pedro Apóstol, Nuestra Señora del Carmen, Inmaculado Corazón
  de María, Capilla Estrella Del Mar, Mare Abajo, Macuto) as map markers.
  Those were one-day events. A stale "distribution here" marker sends a
  survivor walking to a site where nothing exists — this is the physical-
  safety class of error. Distribution sites only go live when GEM provides
  a current schedule (that flow is Phase 2, after they respond).
- Do NOT create any new table, column, or component. Everything below uses
  the existing organizations and map_markers structures.
- Do NOT mark anything as a GEM "partnership." Outreach was sent; nothing
  is agreed. Directory listing and facility markers are sourced from their
  own public communications, same standard as every other verified org.

## Task 1 — organizations seed (both orgs)

Add to the organizations data (same pattern as the existing 16 verified orgs,
approved_by_admin = true):

**Global Empowerment Mission (GEM)**
- type: donation / rescue-adjacent logistics (use existing org type taxonomy;
  'donation' if one value must be chosen)
- description (ES primary, EN secondary, match existing seed style):
  ES: "Socio privado oficial del Departamento de Estado de EE.UU. para la
  respuesta al terremoto. Distribuciones diarias de ayuda en los estados más
  afectados, sede permanente GEM LATAM en La Guaira, y centro logístico en
  Doral, Florida. Más de 55.000 sobrevivientes atendidos con kits completos."
  EN: "Official U.S. State Department private partner for the earthquake
  response. Daily aid distributions across the hardest-hit states, permanent
  GEM LATAM headquarters in La Guaira, and logistics hub in Doral, Florida.
  55,000+ survivors served with full kits."
- website: https://www.globalempowermentmission.org
- donation_link: https://www.globalempowermentmission.org/donate
- Standard fraud warning applies as with all donation links (existing pattern).

**We Love Foundation (I Love Venezuela)**
- type: donation / diaspora
- description:
  ES: "Fundación de la diáspora venezolana, socio operativo de GEM en cada
  distribución de ayuda en Venezuela. Canaliza el apoyo de la comunidad
  venezolana en EE.UU. hacia las familias afectadas."
  EN: "Venezuelan diaspora foundation and GEM's operating partner on every
  aid distribution in Venezuela. Channels U.S. Venezuelan community support
  to affected families."
- website: https://www.welove.foundation

## Task 2 — map markers (permanent facilities ONLY)

Two markers, type 'collection_point' (or 'resource' if collection_point
semantics don't fit — pick whichever the map legend renders more accurately
for a logistics facility):

1. **GEM Headquarters / Aid Intake — Doral, FL (USA)**
   - Address: 1850 NW 84th Ave, Suite 100, Doral, FL 33126
   - NOTE: this is OUTSIDE Venezuela map bounds. Verify how the diaspora/USA
     hub section handles US-side markers (the USA diaspora hub work from the
     earlier prompt round). If US markers render on a separate view, place it
     there. If there is no US-side map surface yet, list GEM's Doral facility
     as a text entry in the /como-ayudar USA section instead of forcing a
     marker outside bounds — bounds rejection is a standing security rule,
     do not weaken it to fit this marker.
   - Description: aid intake point for supplies donated from the U.S.
     ("Donate Supplies" form link: their Google Form is linked from their
     site nav — link to their /donate page rather than hardcoding the form URL,
     which can rot).

2. **GEM LATAM Headquarters — La Guaira, Venezuela**
   - Their public communications state a permanent HQ in La Guaira but do NOT
     publish a street address. Do NOT guess coordinates. Geocode only to
     La Guaira city-center with a description stating "Sede permanente GEM
     LATAM — ubicación exacta vía globalempowermentmission.org" — an
     intentionally approximate, honestly-labeled marker. If the map UX can't
     represent an approximate location honestly, skip the marker and keep
     GEM LATAM as directory-entry-only until they provide the address.
   - verified: true (existence is verified from their own communications;
     the approximation note covers the location uncertainty)

## Task 3 — /como-ayudar page update

In the "organizations on the ground" / donation section, ensure GEM appears
with the same donation-card treatment as existing orgs, and add one line to
the USA/diaspora section: GEM's Doral warehouse accepts supply donations
(link to their donate/supplies page). We Love Foundation gets a standard
org card, no special treatment.

## Task 4 — i18n

All new user-facing strings go through the normal locale flow: hand-write
ES and EN in es.json / en.json, regenerate the other 6 locales via
scripts/generate-translations.mjs ONLY if that script run is already part
of the current workflow — otherwise leave the 6 auto locales untouched and
flag for the next translation batch. Do not ship machine-translated strings
for these entries without the normal review pass.

## Acceptance criteria

- [ ] GEM and We Love Foundation appear in /organizaciones with
      approved_by_admin = true, correct links, fraud warning intact
- [ ] GEM Doral facility represented in the USA/diaspora surface (marker or
      text entry per Task 2 logic) — Venezuela map bounds validation untouched
- [ ] GEM LATAM La Guaira marker present ONLY if honestly representable as
      approximate; otherwise directory-only
- [ ] Zero past-distribution-site markers created
- [ ] No schema changes, no new dependencies
- [ ] ES + EN strings hand-written; auto-locales not shipped unreviewed
- [ ] Visual check (scripts/visual-check.mjs) passes on /organizaciones and
      /como-ayudar

## Commit

Single commit, message:
"seed: add GEM + We Love Foundation to verified orgs and diaspora hub

Co-authored-by: Claude <noreply@anthropic.com>"
