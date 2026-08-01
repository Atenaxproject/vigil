# AGENTS.md — Vigil Operating Contract

**Canonical agent instruction file.** Read before every session. Every agent that touches this repository follows this file.

---

## 1. Status

Vigil is live in production, serving the Venezuela 2026 earthquake response at [vigil.youthewave.org](https://vigil.youthewave.org). This is not a greenfield build. There is no build phase to execute. Every change is an incremental change to a running system that people depend on.

---

## 2. Operating model

- **Spec before code, no exceptions** (BMAD-Nova). Work is specified in numbered prompt files in `docs/build-process/`, executed by an agent, then reviewed by a human.
- **No autonomous mode.** Agents do not self-authorize scope. If a task requires work outside the prompt that specified it, stop and flag rather than proceeding.
- No `--dangerously-skip-permissions` for work on this repository.
- Every substantive change is branched, PR'd, and reviewed. A restore tag is created before work begins.

---

## 3. Critical context

Vigil handles **sensitive personal data of disaster victims and their families** during the most vulnerable moment of their lives. Every implementation decision must account for:

1. Predators and traffickers who may attempt to exploit missing persons data
2. Political risk: the Venezuelan government must NEVER receive user data
3. Vulnerable populations: minors, elderly, people in shock submitting reports
4. Connectivity: 2G speeds, offline-first, low-bandwidth images
5. Scale: potential viral traffic if major media picks this up

**Privacy and data protection are not afterthoughts. They are architecture.**

---

## 4. Hard constraints

- Security-sensitive code (src/lib/security/, auth, RLS, contact-info handling,
  sanitization, validation) must route through a pull request so CodeQL and
  automated review run before merge. Never direct to main.
- The repository is the sole source of truth for database schema. The Supabase
  agent applies migrations; it never authors them.
- AI never assigns, suggests, or infers a structural safety tag (ATC-20
  green/yellow/red). Tags are assigned only by a qualified volunteer with the
  structural_engineer, architect, or surveyor role. This is absolute.
- Vigil stores no biometric templates. Claude Vision produces text descriptions
  of visible features for matching. Never introduce facial recognition,
  embeddings, or biometric matching.
- Partner missing-persons data is federated at query time, never copied into
  Vigil's database. No network-wide record total is published for Desaparecidos
  Terremoto Venezuela — their API exposes no count endpoint, and any figure
  derived from partial enumeration would misrepresent their data.
- Venezuelan government intake tools are excluded from links, the emergency
  banner, and partner directories. User data is never shared with the
  Venezuelan government. This is a Venezuela-specific policy, not a universal
  rule across deployments.
- Contested official figures are published with issuer attribution and
  independent counterpoints stacked beneath. Never average competing figures
  into a single number, and never silently drop the disputed one.
- Emergency numbers require two independent sources in agreement before they
  ship. Never publish an unverified emergency number.
- Name and text search must function with zero AI dependency. If every Claude
  call fails, a person must still be able to search a name and get results
  from the database.
- Contact information is never rendered on a public surface. Public listings
  read from stripped database views; contact and claim columns are not part of
  the public read surface.

---

## 5. Agent roles

- **Fable (Claude Code in Cursor)** — implementation against numbered prompt files. Deep review, QA, and complex multi-file work.
- **Codex (OpenAI, GitHub connector)** — applies Supabase schema; never authors it. PR review and CI debugging. Never merges. Never pushes directly to `main`.
- **Claude (web)** — architecture, prompt authoring, research, content, strategy. Does not execute against the repository.

---

## 6. Review expectations

Applies to any agent reviewing a PR here:

- Flag, do not fix silently.
- Never claim a change is verified, safe, or complete without evidence in the diff.
- If a root cause lies outside the repository — a platform setting, a dashboard toggle, a connector configuration — say so plainly rather than implying the PR resolves it.
- Prioritize: the hard constraints above, then privacy and data-exposure risk, then accessibility regressions, then correctness, then style.

---

## 7. Current stack

Next.js 15 · React 19 · TypeScript strict · Supabase (Postgres, Realtime, RLS) · Vercel · Cloudflare (DNS, WAF, Project Galileo Business on the `youthewave.org` zone) · Anthropic Claude API · Leaflet · Tailwind.

Model routing is defined in the code, not in this file. Do not restate which model serves which endpoint here.

---

## 8. Deployment model

One codebase. Configuration per deployment via `src/config/crisis.config.ts` and `src/lib/hazards/adapters/`. A separate Supabase project per jurisdiction. Never multi-tenant, never a fork. Venezuela must be stable and require no further fixes before Florida work begins.

---

## 9. Authoritative sources

In order of precedence:

1. The live codebase
2. `docs/architecture/DESIGN-SYSTEM.md`
3. The migrations in `supabase/migrations/`
4. `README.md`

Any document that conflicts with the live code is wrong, including this one — flag the conflict rather than acting on the document.

Encyclopedia companions (not constraints): `docs/reference/VIGIL-COMPLETE-GUIDE.md`, `docs/reference/api-reference.md`, `docs/reference/data-model.md`, `docs/architecture/DEPLOYMENT.md`, `docs/architecture/DEPLOYMENT-PLAYBOOK.md`.

---

## 10. What Vigil is not

- Not an emergency dispatcher
- Not a donations processor
- Not a government intake tool
- Not a biometric identification system

---

## 11. Licensing and brand

Code is Apache-2.0. The Vigil™ and YouTheWave™ names, logos, and brand are trademarks and are not licensed under Apache-2.0. See `TRADEMARK.md`. Forks must rebrand.

---

## Process notes (public repo)

- Numbered prompts live in `docs/build-process/` — never leave finished prompts at repo root.
- Public stubs for sensitive prompts; full copies under gitignored `docs/evaluations/` when required.
- Status markers in launch-readiness docs change only from execution reports.
- Day-one build scripts are archived at `docs/build-process/00-original-agents-build.md` and `docs/build-process/00-original-claude-spec.md` — historical only.

---

*Rewritten 2026-07-28 (prompt 83). Supersedes the day-one AGENTS.md / CLAUDE.md build specs.*
