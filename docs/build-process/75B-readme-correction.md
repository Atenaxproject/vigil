# 75B — README Correction

**Small, surgical, runs before 76.** `README.md` only, plus the two files named in §1. Every item below is a specific defect found by reading the current file, not a general audit instruction.

**Context:** the README is the public front door — the file DTV, journalists, Cloudflare Galileo reviewers, and any prospective deployer read first. It has drifted the same way `CLAUDE.md` did. Two items are serious; the rest are accuracy.

---

## §1 — LICENSE CONTRADICTION 🔴 SERIOUS

Current text:

> **MIT License** — Free to use, modify, and deploy for humanitarian purposes. Commercial use of the data is prohibited.

**This is incoherent.** MIT permits commercial use — that is constitutive of the license. As written, Vigil is either not actually MIT-licensed, or the added restriction is unenforceable. Both readings are damaging: the Galileo application, the OCHA/HDX positioning, the county-adoption argument, and the entire press narrative rest on Vigil being genuinely open source. A licensing contradiction in the README is precisely what a technical or legal reviewer at any of those organizations checks first.

The underlying intent is fine — it just conflates two distinct objects. **The code is MIT. The data is governed by the Terms of Service.** Separate them:

```markdown
## License

**Code: MIT License.** Free to use, modify, fork, and deploy — commercially or
otherwise, for any purpose. See [LICENSE](./LICENSE).

**Data: not covered by the MIT license.** Records submitted to a Vigil
deployment by the people it serves are governed by that deployment's Terms of
Service and Privacy Policy. Nothing in the MIT license grants rights to
personal data held in any Vigil instance. See [Terms](https://vigil.youthewave.org/terminos).

**Federated data** from partner platforms remains theirs. Attribution and
usage terms follow the originating platform.
```

Then verify `LICENSE` is an unmodified MIT text with no added clauses. If a restriction was added to the license file itself, remove it — it is not MIT with a restriction bolted on; it is a different, non-standard license, and it will be treated as such by anyone evaluating the project.

Confirm the Terms actually contain the data-use restriction the README now points to. If they don't, say so in the report rather than inventing it.

---

## §2 — UNRESOLVED PLACEHOLDER IN PUBLIC 🔴

Under **Trust, access & resilience**:

> 🚨 **Emergency banner** — Always-visible hotline ([former rescue-coordination label]), Intérpretes, Cruz Roja.

`[former rescue-coordination label]` is an editorial placeholder that shipped. Replace it with what the banner actually renders in production today — post prompt 60, that is 911 plus the verified secondary lines, with the uncorroborated rescue number removed. Read the live component; do not guess.

Grep the whole README for any other bracketed placeholder, `TODO`, `TBD`, or `[...]` construction and resolve each.

---

## §3 — DTV FIGURES: THREE NUMBERS, ALL WRONG

The README currently states three mutually inconsistent totals:

| Location | Claim |
|---|---|
| Project Status → Live Now | "a cached DTV index (~12,000 records via their public API)" |
| Data Partnership | "Their platform reports 55,000+ total citizen reports; their public API currently exposes ~12,000 person records" |
| (site, now removed) | 25.000 personas en red DTV |

All three are stale, and prompt 75 §1 established why: the API clamps page size and exposes no count endpoint, so any total derived by walking is a truncated walk, not a count. Vigil now suppresses these figures entirely rather than publish a wrong one.

**The README must not hardcode a DTV total.** Remove every numeric claim about the size of the DTV network and replace with a description of the relationship:

```markdown
Vigil federates with **Desaparecidos Terremoto Venezuela** as a registered
integrator. Their records are searchable through Vigil alongside Vigil's own,
with full source attribution and a direct link back to their platform.

Vigil does not publish a total record count for the DTV network. Their public
API exposes no count endpoint, so any total derived by paginating would be a
partial walk rather than a count — and publishing that as a network total
would misrepresent their data. Current figures live on their platform.
```

Also correct the integration description: the "refreshed at most every 30 minutes" claim must match the caching behavior implemented in 75 §1. Read the code.

---

## §4 — TECH STACK ACCURACY

Verify each against `package.json` and the codebase, and correct:

- **Next.js version.** README badge and tech stack both say 14. Commit history shows `security(deps): migrate to Next 15.5.20 + React 19 (#5)`. The badge URL needs updating too, not just the prose.
- **React version** — not currently mentioned; add it.
- **Claude model names.** README says Sonnet 4.6 for vision and Haiku 3.5 for assistant and dedup. Confirm against the actual API calls. Stale model strings were already found in `CLAUDE.md`.
- **Supabase region, Leaflet, Tailwind, next-intl** — spot-check.

---

## §5 — ROUTE AND FEATURE TABLE DRIFT

**Missing entirely — shipped but undocumented:**

- `/prensa` — press page with boilerplate, provenance fact sheet, downloadable kit (prompt 65)
- `/monitor` — operator early-warning monitor with DB-level kill switch (prompt 68). Document it as URL-only and not in public nav, with the reason.
- Contested-figures treatment on `/estadisticas` — official figures published with attribution and public counterpoints stacked beneath (prompt 71). **This is a differentiator and it is invisible in the README.**
- Global accessibility controls — A / A+ / A++ type scale and high-contrast toggle, live in the header
- Zero-result recovery on `/buscar` and DTV referral landing (prompt 74)
- Content expiry sweep and data provenance system (prompts 63, 67)

**Wrong or unverified:**

- `/noticias` — 75 §3 required a decision: wire it or delete it. The execution report went silent on it. Whatever was decided, the README row must match. If deleted, remove the row.
- **Statistics by state** row says "Real-time missing/found-alive counts per estado." Per 75 §1 these now suppress unless the walk is provably complete. Rewrite to describe actual behavior.
- **Sister platform count.** Project Status says 8; the table lists 9; 75 §4 removed 2 dead entries (NXDOMAIN). Recount and make the number, the table, and `/red` agree.
- **Organization count.** README says 26 verified NGOs in two places. Prompt 73 seeded GEM and We Love Foundation. Recount from the live seed.
- **ReliefWeb** — noted elsewhere as returning HTTP 410. If the feed is dead, `/noticias` and the information hub rows are both wrong.
- **"Verified against source and production as of 2026-07-03"** — three weeks stale. Update to the date this audit is actually completed, and only after verifying.

---

## §6 — STATUS SECTION HYGIENE

- **In Progress → "DTV statistics widget on `/estadisticas` (API integration, UI in progress)"** — this is the orphaned `DtvNetworkWidget`. Decision: **delete the component and remove this line.** Do not mount it on `/informacion`. We spent prompt 75 eliminating unreachable surfaces and unreliable federated counters; adding a fourth surface for the same fragile data reverses that. If DTV ships a count endpoint and a widget is wanted, rebuild it then against a source that can be trusted.
- **Coming Soon → "PFIF bidirectional sync with DTV (partnership in validation)"** — overstates it. No sync has been agreed. Change to "proposed."
- Move anything under In Progress or Coming Soon that has actually shipped into Live Now, and anything abandoned out of the file entirely.

---

## §7 — TONE AND CLAIM DISCIPLINE

- No claim of a Vigil↔DTV partnership beyond what exists: API federation with attribution, and reciprocal directory listing.
- **No facial-recognition claim for Vigil.** The Data Partnership section says their facial recognition endpoint powers Vigil's photo search — if that is accurate, keep it, but state explicitly that no biometric data is stored by Vigil and that biometrics never cross the federation boundary. This matches the `/red` chip corrected in 74 D.
- Verify `vigil.youthewave.com` actually redirects as claimed.
- Verify every screenshot in `screenshots/` still reflects the current UI. The nav, menu sheet, and header changed in 74 and 75.

---

## REPORT BACK

1. Confirm `LICENSE` is unmodified MIT, and quote the data-use clause from the Terms that §1 now points to.
2. What did `[former rescue-coordination label]` become, and what does the live banner render?
3. Actual Next.js and React versions from `package.json`.
4. Final counts: sister platforms, verified organizations.
5. `/noticias` — wired or deleted? This is the second time it has been asked.
6. Confirm `DtvNetworkWidget` is deleted, not relocated.
