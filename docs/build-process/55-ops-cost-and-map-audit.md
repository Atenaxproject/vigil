# [NN+2] — Operational Hardening: Claude API Cost Controls + Map Data Pipeline Audit

**Type:** Diagnose-then-fix operational work, two workstreams, one session
**Prerequisite:** None — independent of the 5-prompt package. Safe to run in parallel or after.
**Priority:** HIGH. Workstream A is burning real money daily; Workstream B means the live platform is showing stale data to real families.

---

## WORKSTREAM A — Claude API Cost Controls

### A0. Measure first (do not skip)

Before changing anything, pull the usage breakdown from console.anthropic.com and document in the PR description: spend by model (Haiku vs Sonnet) and, as far as attributable, by workload (dedup cron / AI assistant / photo search / translation script). Every fix below must be justified against what the data shows, not assumption. Expected finding: the hourly dedup cron dominates.

### A1. Prompt caching (biggest lever)

Add Anthropic prompt caching (`cache_control: { type: 'ephemeral' }`) to every Claude call that resends stable context:

- **Dedup cron:** system prompt + instruction block cached; only the new/changed records portion uncached.
- **AI assistant:** system prompt + crisis_config context cached; the live Supabase snapshot and user question uncached. Structure the prompt so stable content is a contiguous prefix — caching only works on prefix blocks.
- **Photo search:** system/instruction prefix cached.

Cached input reads cost ~10% of normal input tokens. Verify cache hits in the API response usage fields (`cache_read_input_tokens`) and log them.

### A2. Dedup cron frequency

Change from hourly to **every 6 hours**, AND add a short-circuit: query for missing_persons records created/updated since the last run *before* calling Claude — if zero new records, exit without any API call. (If submission volume spikes during an active event, frequency can be reverted by config — make the interval an env var, not hardcoded.)

### A3. Hard limits in code

- Explicit conservative `max_tokens` on every call (assistant answers don't need more than ~1024; dedup verdicts far less).
- Confirm Haiku is used everywhere except photo vision (Sonnet). No silent model upgrades.
- Translation script: when next run, use the **Batch API** (50% discount) — translations are not latency-sensitive.

### A4. Vercel AI Gateway

Activate the pending AI Gateway integration for all Anthropic calls:
- Per-route/per-workload spend observability
- Budget alerts
- No markup on tokens

Route existing calls through it via the base-URL swap; do not restructure call sites beyond that. Keep `ANTHROPIC_API_KEY` server-side exactly as it is today.

### A5. Acceptance criteria (A)

- [ ] Usage breakdown documented pre- and post-fix in the PR.
- [ ] Cache hits confirmed via `cache_read_input_tokens` in logs.
- [ ] Dedup cron: 6h interval via env var + zero-new-records short-circuit verified.
- [ ] `max_tokens` explicit on every call site.
- [ ] Batch API used for the next translation run.
- [ ] AI Gateway live with per-workload visibility.
- [ ] Projected monthly spend at current traffic documented. Target: under $10/month idle-state.

---

## WORKSTREAM B — Map Data Pipeline Audit

### B0. The complaint, precisely

Layers and data that should appear on the crisis map are not appearing, and feeds do not appear to refresh. Treat this as a **trace, not a guess**: for every map layer, follow the full path — source (API or table) → fetch/cache → transform → render condition — and log the record count at each stage. The break is wherever the count unexpectedly drops to zero.

### B1. Layer-by-layer audit table

Produce this table in the PR description, one row per layer:

| Layer | Source | Records at source | Records after fetch/cache | Records after filters | Rendered | Verdict |
|---|---|---|---|---|---|---|
| Réplicas (USGS) | USGS API | | | | | |
| Necesidades | map_markers | | | | | |
| Recursos | map_markers | | | | | |
| Equipos Activos | rescuer_presence | | | | | |
| Puntos de Acopio | map_markers | | | | | |
| Refugios | map_markers | | | | | |
| Hospitales | map_markers | | | | | |
| GDACS alerts | GDACS API | | | | | |

### B2. Known failure candidates — check each explicitly

1. **Stale USGS query window.** If the query uses a fixed `starttime` near the June 24 crisis date with a bounded window, or a magnitude/radius filter tuned for the initial aftershock burst, it may now return little or nothing. Fix: rolling window (e.g. `starttime = now - 30 days`) with the crisis date as a floor only where historically intended.
2. **Cache never revalidating.** Verify the `revalidate` values actually apply on the deployed routes (App Router caching semantics differ between fetch cache, route segment config, and unstable_cache — confirm which is in play per feed). A 300s config that's actually being statically cached at build renders once and never again.
3. **Realtime not enabled on newer tables.** Check `supabase_realtime` publication includes every table the map subscribes to — anything added after migration 003 is suspect.
4. **Over-filtering.** Layers gated on `verified = true` or `status = 'active'` where the moderation queue hasn't approved anything recently will render empty. Distinguish "pipeline broken" from "filter starving the layer" — the second is a moderation-workflow finding, not a code fix.
5. **Auto-expiry doing its job.** `rescuer_presence` (4h) and `resource_exchange` (7d) expire by design. Empty because expired is correct behavior — mark it as such, don't "fix" it.
6. **Client subscription teardown.** Confirm Realtime channel subscriptions survive route navigation and reconnect after network loss (crisis users on 2G drop constantly).

### B3. Fix rules

- Fix root causes in the pipeline. Do NOT seed fake data to make layers look alive — Vigil is a live platform serving real families; test data must be cleaned up (standing constraint #11).
- Any fix touching cache behavior must state the intended freshness per feed and match VIGIL-BIBLE §8 cache values (USGS 300s, GDACS 600s, ReliefWeb 3600s).
- If a layer is empty because moderation gating is starving it, report it as an operator finding for Orlando — that's a daily-SOP issue, not code.

### B4. Acceptance criteria (B)

- [ ] Audit table complete, every layer traced with counts at each stage.
- [ ] USGS feed shows current aftershocks with a rolling window; verified live on production, not just locally.
- [ ] Every map-subscribed table confirmed in the Realtime publication.
- [ ] Cache revalidation verified against deployed behavior (not just config values).
- [ ] Zero fake/test records introduced.
- [ ] Findings that are operational (moderation starvation, expiry-by-design) reported separately from code fixes.

---

## Commit

Two commits, one per workstream:

```
perf(api): prompt caching, cron short-circuit, batch translations, AI Gateway routing

Co-authored-by: Claude <noreply@anthropic.com>
```

```
fix(map): data pipeline audit — rolling USGS window, realtime publication, cache revalidation

Co-authored-by: Claude <noreply@anthropic.com>
```
