# Deployment activation gates — nothing here launches until ALL boxes tick

Per VIGIL-DEPLOYMENT-PLAYBOOK: no deployment goes live without a named local
admin. These configs are pre-builds so activation is a same-day task, not an
overnight build.

## Florida (hurricane + flood) — `florida.config.ts`

- [ ] **Local admin named** (Florida VOAD / Volunteer Florida conversation — in outreach)
- [ ] Privacy policy REWRITTEN for Florida: county EM offices are legitimate
      resources here — the Venezuela government-exclusion clause does NOT copy
      over. Own reasoned stance, human-reviewed.
- [ ] FDACS registration check (Florida charitable-solicitation rules) before
      any donation-adjacent feature is exposed
- [ ] Haitian Creole (ht) locale: generate + native-speaker review of ALL
      safety-critical strings — never ship machine-only
- [ ] New Supabase project + all migrations applied + RLS verified
- [ ] Vercel project + DNS (subdomain TBD) — gray-cloud Cloudflare, same as VE
- [ ] Emergency numbers verified (911 + county EM contacts per covered county)
- [ ] Flood-relevant USGS gauge site list chosen (~15 sites, not statewide dump)
- [ ] NWS storm-surge products: US coastline only — OK for Florida, keep enabled

## Mexico Pacific (hurricane) — `mexico-pacific.config.ts`

- [ ] **Local admin named** (no Mexico contact confirmed yet — hard gate)
- [ ] Privacy policy: Mexico-specific stance written (see config notes) —
      civil-protection agencies ARE listed as legitimate partners; personal
      contact data still never shared with anyone without owner consent.
      Human review required before launch.
- [ ] Emergency numbers verified current (911 national; Protección Civil per
      state) — do not trust memory-sourced values
- [ ] SMN/Conagua + CENAPRED feed verification re-checked at launch time
      (HTML-only as of 2026-07: omitted; NHC EP-basin coverage suffices)
- [ ] NHC storm-surge layer DISABLED or clearly US-only-labeled (NHC surge
      products do not cover Mexican shores)
- [ ] Bounds tightened to the deploy's actual coverage (config ships with the
      full Pacific coast as a starting envelope)
- [ ] New Supabase project + migrations + RLS verified
- [ ] Vercel project + DNS

## Both

- [ ] Preparedness hub content for hurricane/flood human-reviewed in every
      shipped locale (critical:true strings are the review gate)
- [ ] Deployment registry (`registry.ts`) status flipped to `live` + URL set —
      this is what turns on the geo suggestion banner
