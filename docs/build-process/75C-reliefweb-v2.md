# 75C — ReliefWeb v2 Migration

**Small and self-contained.** No auth, no RLS, no schema change. Normal review.
**Found during 75B.** `src/lib/reliefweb.ts` calls the ReliefWeb v1 API, which has been decommissioned and returns HTTP 410 directing callers to v2. The feed currently reads empty everywhere it appears.

---

## §1 — Suppress before you migrate

Do this first, and ship it even if the migration takes longer than expected.

`/noticias` now redirects to `/informacion`, so the information hub is the only surface carrying ReliefWeb. A dead source there currently renders as an empty section.

**"Degrades gracefully, no crash" is not the same as "renders acceptably."** An empty container under a heading on a crisis information page is the same defect class as the `0` counters removed in 62 and 74 — it reads as *this platform is broken*, not as *this source is unavailable*.

- When the ReliefWeb fetch fails or returns zero items, **suppress the entire section including its heading.** Do not render an empty container, a spinner that never resolves, or a bare "no results" line.
- The information hub must read as complete with USGS, GDACS, and the Venezuelan news RSS alone.
- Apply the same rule to any other surface that consumes this source — grep for all consumers before assuming there is only one.

## §2 — Migrate to v2

- Update the endpoint and adapt to the v2 response envelope. The shape differs from v1; do not assume field parity.
- Filter to Venezuela and to the 2026 earthquake response where the API supports it. A global disaster feed is noise on this platform.
- Respect whatever rate and attribution terms v2 states. ReliefWeb is OCHA — the same organization named in the outreach strategy as a correct UN entry point. Being a well-behaved consumer of their API is not a neutral act here.
- Cache server-side. Do not fetch per pageview.
- Keep the existing failure path intact so §1 still governs when v2 is unreachable.

## §3 — Verify the rest of the external sources

The v1 decommission was live for an unknown period before anyone noticed, which means there is no monitoring on external feed health. Check each one now and report status:

| Source | Expected |
|---|---|
| USGS Earthquake API | live |
| GDACS | live |
| Open-Meteo | live |
| Venezuelan news RSS | live |
| NASA FIRMS (`/monitor`) | live |
| DTV `/personas` | live, page-capped per 75 §1 |

For any source returning an error or empty set, apply the §1 suppression rule rather than leaving an empty surface.

## §4 — Correct the README

75B documented ReliefWeb as broken, which was honest at the time. Once §2 lands, update it to describe the working v2 integration. If §2 does not land in this pass, leave the README as-is — do not describe it as fixed.

---

## Report back

1. v2 endpoint and response shape, with one sample item.
2. Every surface that consumed the v1 feed.
3. Status of all six sources in §3.
4. Confirm the information hub renders cleanly with ReliefWeb suppressed — screenshot proof, mobile and desktop.
