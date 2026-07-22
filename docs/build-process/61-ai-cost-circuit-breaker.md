# 61 — AI Cost Circuit Breaker and Graceful Degradation

> **Status:** ✅ Executed 2026-07-21. Per-IP AI limits (photo 3/h, assistant 15/h), ai_usage_log + circuit breaker, honest degraded UX, admin `/api/admin/ai-breaker`.

# 61 â€” AI Cost Circuit Breaker and Graceful Degradation

**Priority:** P0 â€” highest-probability failure mode under the incoming traffic event.
**Depends on:** PR #6 and PR #7 merged. Prompt 60 merged (avoids conflicting edits to emergency-routing strings).
**Routing:** **Mandatory PR.** This touches rate limiting and server-side API handlers. CodeQL and Copilot review must run before merge. No direct-to-main under any circumstance.

---

## Context

Vigil is being added to DTV's `/plataformas` directory. Every user arriving from that referral has already searched DTV and not found their person. Their next action on Vigil is a search â€” and specifically, a meaningful share of them will use **photo search**, which invokes Claude Sonnet Vision.

That is the most expensive endpoint on the platform, hit by the highest-intent traffic, against a **$50 hard cap** in the Anthropic console.

The current failure mode when that cap is reached is not degradation. It is failure â€” silently, for every user, during the exact traffic window that was supposed to prove Vigil works. A family gets an error instead of an answer, and Vigil looks broken to an audience arriving from a partner platform.

This prompt does not reduce cost. It makes the failure survivable and honest.

---

## Non-negotiable design principle

**Name and text search must work with zero AI dependency.** If every Claude call on the platform returns an error, a person must still be able to type a name into `/buscar` and get results from Supabase.

Verify this is already true before building anything else. If any part of the core name-search path routes through the Anthropic API, that is a latent single point of failure and it gets reported before this prompt proceeds.

---

## Scope

### Part A â€” Per-identity rate limiting on AI endpoints

The existing rate limiter (5 submissions/IP-hash/hour on high-sensitivity endpoints, `rate_limit_log` table) is the pattern. Extend it, do not reinvent it.

Apply distinct, tighter limits to:

- **Photo search** (Sonnet Vision) â€” most expensive per call. Suggested starting point: 3 per IP-hash per hour.
- **AI assistant** (`/api/assistant`, Haiku) â€” cheaper per call, higher volume. Suggested: 15 per IP-hash per hour.
- **Natural-language intake structuring** on the report form (Haiku) â€” this one is on a path a real family needs. Set it generously (suggested 10/hour) and make sure the fallback is the structured form, not a hard block.

Limits go in `crisis.config.ts` as named constants, not inline magic numbers, so they can be tuned during a live event without a code change.

Continue using SHA-256 IP hashes. Never store raw IPs. This is an existing architectural commitment.

### Part B â€” Spend-aware circuit breaker

Rate limiting caps individual abuse. It does not stop 4,000 legitimate users from collectively exhausting the cap. That needs a global breaker.

Anthropic's API does not expose a live spend figure to the application, so **approximate with a request counter, and be honest in the code comments that it is an approximation.**

1. Add a rolling counter of AI calls, bucketed by model tier (Haiku vs Sonnet), persisted in Supabase so it survives serverless cold starts. Reuse the `rate_limit_log` pattern or add a small `ai_usage_log` table â€” your call, but justify it in the PR.
2. Define two thresholds in `crisis.config.ts`:
   - **`AI_DEGRADE_THRESHOLD`** â€” at this point, disable photo search (the expensive path) while keeping the assistant alive
   - **`AI_HALT_THRESHOLD`** â€” at this point, disable all AI features and serve the degraded state everywhere
3. Thresholds are configurable without redeploy where possible (env var read at request time, not build time).
4. Breaker state must be readable by an admin endpoint so Orlando can see it from Supabase Studio without reading logs.

### Part C â€” Honest degraded states

When a feature is unavailable, the UI must say so plainly, in the user's language, and immediately route to the alternative. It must never show a generic error, a spinner that never resolves, or a silent no-op.

Required states, ES copy (translate to all 8 locales):

**Photo search unavailable:**
> La bÃºsqueda por foto no estÃ¡ disponible en este momento. Puedes buscar por nombre, o reportar a la persona para que aparezca en los registros.

With a direct link to `/buscar` and `/reportar` in the same block.

**AI assistant unavailable:**
> El asistente no estÃ¡ disponible en este momento. Para emergencias llama al 911. Puedes seguir usando el mapa, la bÃºsqueda y los directorios con normalidad.

The assistant widget should render in a visibly disabled state rather than disappearing â€” a missing widget reads as a broken page; a disabled widget with an explanation reads as an honest system.

**Natural-language intake unavailable:**
Silently fall back to the structured form with a brief note that the assisted-entry option is temporarily off. A family filing a missing-persons report must never be blocked by this.

### Part D â€” Preserve the honesty constraint

The existing hardcoded constraints on every Claude call stay exactly as they are: never invent information, answer only from loaded context, say so explicitly when data does not exist, respond in the user's language, always surface the emergency number.

Prompt 60 may have changed the emergency-number string. Read the current value from config rather than hardcoding it here, so the two never drift apart again.

---

## Acceptance criteria

- Name/text search returns results with the Anthropic API fully unreachable (test by pointing `ANTHROPIC_API_KEY` at an invalid value in a preview deploy)
- Exceeding a per-IP limit returns the degraded state, not a 500
- Crossing `AI_DEGRADE_THRESHOLD` disables photo search and leaves the assistant functional
- Crossing `AI_HALT_THRESHOLD` disables all AI paths with correct copy in ES and EN, and non-broken copy in the other 6
- No raw IP is written anywhere
- Breaker state visible via admin endpoint
- CodeQL clean, zero new code-scanning alerts
- Load reasoning documented in the PR: at what concurrent-user estimate does each threshold trip, and how was that estimated

---

## Constraints

- Do not add a paid observability service. Cost visibility comes from the Vercel AI Gateway, which is a separate configuration task on Orlando's list, not a dependency of this PR.
- Do not silently retry failed Claude calls. Retries multiply spend during exactly the event this is meant to survive.
- Do not cache AI responses across users. Missing-persons context is per-query and cross-user caching is a privacy problem, not an optimization.
- Design system unchanged. Degraded states use existing status colors and components.

---

## Report back

State the chosen thresholds and the reasoning. Flag any code path found where a user-facing function fails hard on an Anthropic error rather than degrading â€” those are the real findings of this prompt and there may be more than the three listed above.

