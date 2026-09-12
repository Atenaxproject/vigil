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
- [ ] Haitian Creole (ht) locale: `en.json`/`es.json` are the live Venezuela
      strings (Caracas examples, earthquake assessment copy, DTV integration,
      Venezuelan-government privacy wording included) — do NOT run
      `node scripts/generate-translations.mjs ht` against them as-is, or the
      output is linguistically fine but operationally wrong for a Florida
      hurricane audience. Adapt/fork the Florida-relevant source strings
      first, generate from that (needs `ANTHROPIC_API_KEY`), then get
      native-speaker review of ALL strings before it ships — never ship
      machine-only
- [x] `src/lib/date-locale.ts`'s `LOCALE_MAP` now includes `ht` (date-fns
      ships a native Haitian Creole locale) — done ahead of activation, no
      remaining gate here
- [ ] `LanguageSwitcher.tsx`'s `localeLabels` is typed
      `Record<SupportedLang, string>` — this is a **compile-time** gate, not
      a runtime cosmetic one: the moment Florida's `supportedLangs` (which
      includes `'ht'`) gets wired into `crisis.config.ts`, `SupportedLang`
      widens and `tsc` fails on `LanguageSwitcher.tsx` until an `'ht'` entry
      is added there. It cannot reach runtime broken.
- [ ] `src/i18n/request.ts` dynamically imports `./locales/${locale}.json` —
      confirm `ht.json` exists and is reviewed BEFORE `supportedLangs` ever
      includes `'ht'`, or any `ht` cookie value 404s the whole request
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
