# CLAUDE.md — Claude Code operational notes

**Read [`AGENTS.md`](./AGENTS.md) first.** That file is the authoritative operating contract for every agent on this repository.

This file does not restate constraints. All constraints live in `AGENTS.md`. If this file ever appears to contradict `AGENTS.md`, `AGENTS.md` wins.

## Numbered prompts

Work is specified in `docs/build-process/NN-*.md` (public stubs or full prompts). Execute only the scope in the prompt you were given. Do not expand into adjacent cleanup. Root `NN-*.md` drafts are gitignored — relocate finished prompts in the same session (archive under `docs/evaluations/` when private; short stub in `docs/build-process/` when public).

## Restore tags

Before substantive work, create a restore tag on the current tip (example: `restore/pre-<short-slug>-YYYYMMDD`). Do not delete existing restore tags.

## Branch and PR

Never commit directly to `main`. Create a feature branch, make the smallest change that satisfies the prompt, update `CHANGELOG.md` and relevant docs, then open a pull request. Security-sensitive paths and schema changes always go through a PR.

## Companions

Product surface and schema truth live in `docs/reference/` and the live code — not in this file.
