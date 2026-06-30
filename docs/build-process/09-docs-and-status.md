# Vigil — Documentation Organization + Commit Verification + Roadmap
## Paste into Cursor Composer (Agent mode)

---

## Production Supabase status (verified 2026-06-29)

**Project:** `macmlvybpxdnzfviimvl` (production for [vigil.youtheway.org](https://vigil.youtheway.org))

| Check | Status |
|---|---|
| Migrations `001`–`005` | Applied (`notes_claims_calendar` = 005) |
| Seed `001_real_data.sql` | Applied |
| `missing_person_notes`, `events`, `resource_exchange` tables | Present |
| Organizations (`approved_by_admin = true`) | 18 |
| `map_markers` by type | shelter 3, hospital 4, danger 4, rescue_zone 2, collection_point 2, resource 1 (16 total) |

**Still not live (config or not built):** Resend outbound email (`RESEND_API_KEY`), push notifications, WhatsApp/Telegram intake, full org directory UI on `/organizaciones`, admin moderation dashboard UI.

---

## TASK A — Verify Everything Is Actually Committed and Live

```bash
git status
git log --oneline -15
```

Show me the output. Confirm:
1. No uncommitted changes sitting locally (working tree clean)
2. The last several commits match the features we've built (seed data, 
   resource exchange, messaging/claims, calendar, weather bar, PWA fixes, 
   domain typo fix)
3. `git push` has actually been run — compare local HEAD to origin/main:

```bash
git fetch
git status -uno
```

If it says "Your branch is ahead of origin/main", push now:
```bash
git push origin main
```

Confirm the Vercel deployment triggered and succeeded after the push 
(check Vercel dashboard Deployments tab, or run `vercel ls` to see latest 
deployment status).

---

## TASK B — Organize Build Documentation (keep public, just organize)

These should stay in the public repo — they demonstrate the architecture, 
privacy decisions, and humanitarian-tech methodology to future contributors, 
grant reviewers, and anyone deploying Vigil for a future disaster. Move them 
into a clean folder structure instead of cluttering the repo root:

```bash
mkdir -p docs/build-process
mkdir -p docs/architecture

# Move the prompt/spec files used during development into docs/build-process/
git mv AGENTS.md docs/build-process/AGENTS.md
git mv CLAUDE.md docs/architecture/CLAUDE.md
git mv DESIGN-SYSTEM.md docs/architecture/DESIGN-SYSTEM.md
git mv CURSOR-SEED-PROMPT.md docs/build-process/01-seed-data.md
git mv VIGIL-GOLIVE-MASTER-PROMPT.md docs/build-process/02-golive-fixes.md
git mv CURSOR-EMAIL-INTEGRATION.md docs/build-process/03-email-integration.md
git mv CURSOR-PWA-CREDITS.md docs/build-process/04-pwa-and-credits.md
git mv CURSOR-MESSAGING-CALENDAR-WEATHER.md docs/build-process/05-messaging-calendar-weather.md
git mv CURSOR-DOMAIN-DIAGNOSTIC.md docs/build-process/06-domain-diagnostic.md
git mv CURSOR-DOMAIN-TYPO-FIX.md docs/build-process/07-domain-typo-fix.md
git mv VIGIL-OUTREACH-EMAILS.md docs/build-process/08-partner-outreach.md
```//(adjust paths/filenames to whatever actually exists in the repo root — list 
the directory first with `ls -la` and move whatever matches this pattern, 
don't fail if some filenames differ slightly)

Create `docs/README.md` as an index:

```markdown
# Vigil Documentation

This folder contains the architecture decisions, build process, and 
development prompts used to create Vigil. Kept public intentionally — 
if you're deploying Vigil for a different crisis or contributing code, 
this shows the reasoning behind every major decision.

## Structure

- `architecture/` — Tech stack, design system, and AI agent instructions 
  that govern ongoing development (CLAUDE.md, DESIGN-SYSTEM.md)
- `build-process/` — The sequential build prompts used to construct Vigil 
  from scratch, including the Venezuela 2026 data seed, privacy 
  architecture decisions, and feature specs

## For Contributors

Read `architecture/CLAUDE.md` first — it governs the tech stack and 
constraints for any new feature. Read `architecture/DESIGN-SYSTEM.md` 
before touching any UI. The `build-process/` files are historical record, 
useful for understanding why things were built the way they were, but 
are not living specs — check actual code as source of truth.
```

Update the main `README.md` to add a line pointing to this folder:
```markdown
## Documentation

Full build process and architecture decisions: [`/docs`](./docs)
```

---

## TASK C — Update README Feature List to Reflect Reality

Rewrite the feature list section of `README.md` to accurately describe what's 
actually built and working right now (not aspirational). Pull this from the 
actual codebase — check which pages/routes exist, which Supabase tables exist, 
which integrations have real working code vs. placeholder.

---

## TASK D — Produce a Clear Status Report

After completing A, B, and C, give Orlando a structured report in your response 
(not a file, just your chat response) organized exactly like this:

### ✅ LIVE NOW
Features fully built, deployed, and functional with no missing pieces.

### 🔧 IN PROGRESS — Coded, Needs Connection/Config Only
Features where the code is complete but blocked on something external: 
an API key not yet added, a service not yet connected, DNS/email not yet 
verified, a manual Supabase step not yet run, etc. Be specific about 
exactly what's missing for each one (e.g., "Telegram bot — code complete, 
needs TELEGRAM_BOT_TOKEN added to Vercel + Make.com scenario built").

### 🔜 COMING SOON — Not Yet Built
Anything discussed but not yet coded at all.

Go through every feature we've discussed across the whole project and 
place each one in the correct bucket. Be honest — if something is half-built, 
say so specifically rather than rounding up to "done" or down to "not started."

Check specifically for status on: missing persons board, real-time map, USGS 
integration, ReliefWeb feed, organizations directory (seeded data), resource 
exchange, volunteer registration + directory, rescuer presence/safety system, 
events calendar, weather/time bar, feedback widget, public notes/sightings 
system, claim-token private inbox, citizen collection point registration, 
PWA/offline support, WhatsApp intake, Telegram intake, email notifications 
(Resend), 8-language i18n, Privacy Policy/Terms pages, infrastructure status 
tracker, admin moderation tools.

---

## TASK E — Commit

```bash
git add -A
git commit -m "docs: organize build documentation into /docs folder, update README to reflect current state"
git push
```
