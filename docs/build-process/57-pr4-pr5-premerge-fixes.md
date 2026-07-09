# 57 — Pre-merge fixes for PR #4 and PR #5

> **Status:** ✅ Executed and merged 2026-07-09. Both PRs squash-merged to `main`
> and branches deleted. Execution outcome recorded at the bottom of this file.

## Context

Two open PRs on Atenaxproject/vigil each received Copilot review comments that must be
resolved before merge. Both fixes are small and scoped. Merge order after fixes:
**PR #5 first** (kills the 12 open Next.js security advisories on the live app),
**then PR #4**. Orlando merges manually after his own smoke test — do NOT merge
either PR yourself.

Working-tree caution still applies: another Cursor session may be mid-migration on
`security/next-15-react-19`. Verify `git status` is clean on each branch before
committing, and never run `git checkout main` with uncommitted migration work present.

---

## Task 1 — PR #4 branch: replace the backup-issue dedupe lookup with the Search API

**File:** `.github/workflows/db-backup.yml`

**Problem (Copilot finding, confirmed valid):** the current dedupe uses
`github.rest.issues.listForRepo({ state: 'open', per_page: 100 })`, which
(a) includes pull requests in its results — a PR titled "Backup failed…" would
false-match — and (b) only reads the first page, so in a repo with >100 open items
the existing issue can be missed and duplicates return.

**Fix:** replace the `listForRepo` call and the `.find()` line with a Search API
query scoped to open issues with a title match:

```javascript
const { data: result } = await github.rest.search.issuesAndPullRequests({
  q: `repo:${owner}/${repo} is:issue is:open in:title "Backup failed"`,
  per_page: 1,
})
const existing = result.items[0]
```

Notes:
- `is:issue` excludes PRs; `in:title` restricts the match to the title. No pagination needed.
- Search-index lag of a few seconds is irrelevant for a nightly cron. Search rate
  limits (30 req/min) are a non-issue at this frequency.
- Downstream code that referenced `existing.number` / `existing` truthiness should
  work unchanged — verify the variable shape matches what the rest of the step expects
  (search items expose `.number` the same way).
- Keep the workflow's existing behavior otherwise: comment on the existing issue if
  found, create a new one only if not.

**Verify:** `actionlint` (or at minimum a YAML parse) passes; the github-script block
is syntactically valid JavaScript. Commit to the PR #4 branch and push.

---

## Task 2 — PR #5 branch (`security/next-15-react-19`): resolve the three Copilot comments

### 2a. Semicolon consistency (style, two occurrences)

**File:** `src/app/preparacion/[archetype]/page.tsx`

Both new `const params = await props.params;` lines (in `generateMetadata` and in
`GuidePage`) end with a semicolon while the file's style omits them. Remove both
semicolons. Scan the rest of the diff on this branch for any other stray semicolons
introduced by the migration and normalize to the file-local style.

### 2b. Node engines declaration (the real one)

**File:** `package.json`

**Problem:** the `serialize-javascript` override resolves to 7.0.7, which declares
`engines.node: ">=20.0.0"`. Next 15.5 nominally supports Node 18.18+, so installs on
Node 18 would warn or fail.

**Decision (made — do not pin an older serialize-javascript):** declare the project's
runtime floor explicitly instead. Node 18 is EOL and there is no Node 18 contributor
base to protect. Add:

```json
"engines": {
  "node": ">=20"
}
```

### 2c. Verification after both changes

1. `npm install` completes with no engine warnings on the local Node (confirm local
   Node is ≥20 first; if not, stop and report — do not work around it).
2. `npm run build` — expect the same green result as before (36/36 pages).
3. `npm audit` — expect 0 vulnerabilities, unchanged.
4. Confirm the Vercel preview redeploys green on push.

Commit both changes to `security/next-15-react-19` and push. Reply to each Copilot
comment thread on the PR marking it resolved with a one-line note of what was done.

---

## Task 3 — Report back

After pushing both branches, report:
- Commit SHAs on each branch
- Build/audit results for PR #5
- Confirmation that Vercel previews are green on both PRs
- Anything unexpected (engine warnings, merge conflicts with the other Cursor session's
  work, workflow lint failures)

Do not merge. Do not touch `main`. Do not modify any file outside the two scopes above.

---

## Execution outcome (2026-07-09)

The pre-merge fixes were applied under the original constraints (no merge, no
`main`, scoped edits only). Orlando subsequently authorized the merge in a
follow-up, which superseded the "do not merge" instruction.

### PR #5 — `security/next-15-react-19`

- **`c2e1d36`** `fix(pr5): normalize semicolons + declare Node >=20 engine floor`
  — removed the two migration-added trailing semicolons in
  `src/app/preparacion/[archetype]/page.tsx`; added `engines.node >=20`.
- Verification: `npm install` no engine warnings (local Node v22), `npm run
  build` **36/36 pages**, `npm audit` **0 vulnerabilities**.
- Checks: Analyze, CodeQL, Vercel preview — all green.

### PR #4 — `ci/backup-hardening`

- **`cde789b`** `ci(pr4): dedupe backup-failure issues via Search API, not
  listForRepo` — replaced the unpaginated `issues.listForRepo` scan (which
  matched PRs and missed issues past page 1) with
  `search.issuesAndPullRequests` scoped `is:issue is:open in:title "Backup
  failed"`, `per_page: 1`. Downstream `existing.number` / truthiness unchanged.
- Verification: workflow YAML parsed (js-yaml) and the github-script block
  validated as JS via an async-function wrapper (matching how
  `actions/github-script` executes it).
- Checks: Analyze, CodeQL, Vercel — all green.

### Copilot review threads

All four threads (3 on PR #5, 1 on PR #4) were replied to and marked resolved
with a one-line note of the fix.

### Merge

Merge order honored: **PR #5 first**, then PR #4. Both **squash-merged** to
`main` (consistent with the repo's linear conventional-commit history) with
their branches deleted:

- PR #5 → `security(deps): migrate to Next 15.5.20 + React 19 (#5)` — merged
  2026-07-09 04:02 UTC.
- PR #4 → `ci: harden nightly backup + dependabot guard (#4)` — merged
  2026-07-09 04:04 UTC (mergeability re-confirmed CLEAN after `main` advanced;
  no file overlap, no conflict).

### Result

**Dependabot open alerts: 0** — the Next 15 migration cleared every remaining
Next.js advisory on the live app. Nothing unexpected: no engine warnings, no
merge conflicts with the concurrent migration session, no workflow lint
failures.
