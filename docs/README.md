# Vigil Documentation

This folder contains the architecture decisions, build process, and
development prompts used to create Vigil. Kept public intentionally —
if you're deploying Vigil for a different crisis or contributing code,
this shows the reasoning behind every major decision.

## Structure

- `architecture/` — Tech stack, design system, and AI agent instructions
  that govern ongoing development (`CLAUDE.md`, `DESIGN-SYSTEM.md`)
- `build-process/` — The sequential build prompts used to construct Vigil
  from scratch, including the Venezuela 2026 data seed, privacy
  architecture decisions, and feature specs

## For Contributors

Read `architecture/CLAUDE.md` first — it governs the tech stack and
constraints for any new feature. Read `architecture/DESIGN-SYSTEM.md`
before touching any UI. The `build-process/` files are historical record,
useful for understanding why things were built the way they were, but
are not living specs — check actual code as source of truth.
