# 75D — Loose Ends

Four independent items. Ship as one PR or four; §2 is the only one with urgency.

---

## §1 — Delete the orphaned `ReliefWebFeed` component

Flagged as out-of-scope in 75C and left in place. This is the second component to survive a prompt that way — `DtvNetworkWidget` was the first, and it was deleted.

The info hub renders official updates through `/api/live-info`, so the component is redundant whether or not the ReliefWeb feed comes back.

- Delete `ReliefWebFeed`
- Remove its i18n keys across all 8 locales
- `grep` to confirm zero remaining references

**Standing rule from here:** a component that is unmounted and unreferenced gets deleted in the prompt that finds it. Do not carry it forward as a flag.

---

## §2 — WCAG 1.4.1 audit and VPAT verification 🔴

**Verify before building anything.** SC 1.4.1 (Use of Color) is a pass/fail AA criterion: information must not be conveyed by color alone. It is the first thing an accessibility reviewer checks.

### §2a — Audit

Find every place in the app where meaning is carried by color. Known candidates, not exhaustive:

- Utility / service status indicators (red / amber / green)
- Structural assessment tags on `/evaluacion-estructural` — ATC-20 green/yellow/red
- Map markers distinguished only by color
- Needs coverage states, wherever they already exist
- Form validation states
- Data freshness and staleness indicators from prompt 63
- The Status Pulse

For each, report: does a non-color differentiator exist — a shape, an icon variant, a text label, a pattern? Screenshot each in grayscale as proof.

### §2b — The VPAT question, and this is the important part

A VPAT summary and manual accessibility audit were published on 2026-07-22.

**If any color-only indicator is live and the VPAT claims AA conformance for 1.4.1, the VPAT overstates.** For county emergency-management procurement, a VPAT that overclaims is materially worse than no VPAT — it is the document their accessibility officer reads and holds you to, and an overstatement discovered during evaluation costs more credibility than an honest "partially supports."

Report plainly: what does the VPAT claim for 1.4.1, and does the live app meet it? Do not amend the VPAT — that is Orlando's decision. Report the discrepancy if there is one.

### §2c — Fix

Every state that carries meaning needs a differentiator beyond hue:

- **Filled** — full/operational/covered
- **Slashed or hollow** — unavailable/critical
- **Half-filled or partial** — degraded/partial

Text labels alone satisfy 1.4.1 and are the cheapest fix where space allows. Use them where the layout permits; use shape variants where it does not.

This is implementable on the current icon library today. It does not wait on §3.

---

## §3 — Icon system contract

Two decisions already made, plus the state contract from §2.

### §3a — No emoji anywhere

Strike the emoji concession in prompt 72, including the utility row. Emoji read as prototype, render inconsistently across platforms, and are announced unpredictably by screen readers. Replace every emoji used as UI with an icon component. Emoji in prose content is a separate question and out of scope here.

### §3b — The gas icon is a cylinder, not a flame

Venezuelan domestic gas is a **bombona** — a cylinder you carry and refill, not piped service. A flame glyph is semantically wrong for what people are actually asking, which is *"¿llegó la bombona?"*

Use a cylinder. This holds regardless of which icon library ends up in use.

### §3c — Three states per status icon

Every icon that carries a status needs three variants, per §2c. Establish this as the contract now so consumers do not have to change when a bespoke set replaces the current one:

```
icon-{name}-{full|partial|none}
```

Document the naming and the state contract in `DESIGN-SYSTEM.md`.

### §3d — Not in scope

A bespoke drawn icon set is deferred. The contract above is library-agnostic on purpose — swapping in custom glyphs later touches the icon module only, not any consumer. Do not attempt custom drawing in this prompt.

---

## §4 — Add a build workflow

There is currently no CI build gate. `codeql.yml` and `db-backup.yml` are the only workflows; `db-backup` is cron-only and never runs on a PR. Nothing in GitHub would stop a PR that breaks the build from merging.

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
jobs:
  build:
    name: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint
      - run: npm run build
```

**Constraints:**

- **No path filters.** A filtered workflow does not report on PRs it skips, and a required check that never reports blocks the PR permanently. This must run on every PR to `main`, including docs-only changes.
- The i18n parity gate already runs in `prebuild`, so `npm run build` covers it. Confirm that holds in CI.
- Build must not require secrets. If it currently does, report which — the app is documented as running without a configured Supabase instance, and CI is where that claim gets tested.
- Job name stays `build` so it is addable as a required status check by that exact name.

Report the first run's status and the exact check name as GitHub reports it.

---

## Report back

1. Full 1.4.1 audit table with grayscale proof.
2. What the VPAT claims for 1.4.1 versus what is live.
3. Confirm `ReliefWebFeed` deleted, zero references.
4. Every emoji found in UI, and what replaced it.
5. CI first-run status and exact check name.
