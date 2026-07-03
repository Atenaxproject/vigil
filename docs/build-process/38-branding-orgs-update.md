# VIGIL BUILD PROMPT — Branding Swap + Partner Additions
### Renumber to the next sequential file in docs/build-process/ before handing to Cursor.

---

## 1. BRANDING SWAP — Atenax Project / Bbluestudios → youthewave.org

Replace visible references site-wide, everywhere they appear as contact/brand copy:
- Vigil footer
- Vigil About/Contact content
- youthewave.org site (already youthewave-branded, verify no leftover references)
- GitHub README (public-facing, part of the credibility layer — keep it current)

**Do NOT change:** the "Legal operator: Bbluestudios LLC" line in /privacidad. That's a factual legal statement about who currently operates the platform. It changes the day YouTheWave Inc. is actually incorporated and has an EIN — not before. Changing it now would be a false representation, however well-intentioned. Leave a `<!-- TODO: update legal operator line once YouTheWave Inc. is incorporated -->` comment in the source so it's not forgotten.

Email addresses referenced in visible copy: use hello@youthewave.org / vigil@youthewave.org / support@youthewave.org. Do not reference any @atenaxproject.com address anywhere going forward (see email routing note below — this is Orlando's own Cloudflare change, not a code change, but front-end copy should stop pointing at atenaxproject.com addresses regardless).

---

## 2. NEW ORGANIZATION — Hogar Bambi

Add to the Organizations directory seed data (17th verified organization), `approved_by_admin = true`:

```
name: Hogar Bambi Venezuela
type: shelter / child_protection
description: Asociación Civil sin fines de lucro (27+ years), five houses in San Bernardino, Caracas.
  Integral care for children and adolescents (0-18) removed from unsafe family environments —
  abandonment, abuse, extreme poverty. Focus on family reunification and safe family placement.
location: Caracas, Venezuela (San Bernardino)
contact_email: hogarbambi@hogarbambi.org
contact_phone: +58 212 550 5539 / +58 212 550 5714
website: https://hogarbambi.org/
donation_link: https://hogarbambi.org/donar-ahora/
verification_note: RIF J-30251707-9, listed on GlobalGiving (vetted nonprofit)
```

This is a directory add, not a sister-platform link — Hogar Bambi is an institution matching the tier of the existing 16 (IFRC, Cruz Roja, etc.), not a citizen-run data platform.

---

## 3. NEW SISTER PLATFORM — Mapa de Necesidades VZLA

Add to the Sister Platform Network (/red), 8th entry, **link only, no data integration**:

```
name: Mapa de Necesidades VZLA
url: https://mapadenecesidadesvzla.com/
description: Zone-based live need-reporting map (crítico/parcial/cubierto — red/orange/green),
  community-reported and verified by collection centers (centros de acopio). Built in response
  to the June 2026 Venezuela earthquake.
integration_status: link-only — no scraping, no federation. Functionally overlaps with Vigil's
  own map_markers 'need' type and resource_exchange; if a federation partnership is pursued later,
  their red/orange/green severity model maps directly onto Vigil's existing tier pattern.
```

Same non-negotiable rule as every other sister platform: no scraping, ever. If federation happens, it's an outreach conversation first, same as the DTV precedent.

---

*Quick bundle — pairs with VIGIL-BIBLE.md Section 10 (partner network)*
