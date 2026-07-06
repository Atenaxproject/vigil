# 49 — CodeQL setup

**Date:** 2026-07-06  
**Scope:** Static analysis for JavaScript/TypeScript on `Atenaxproject/vigil`.

## Files added

- `.github/workflows/codeql.yml` — push/PR to `main`, weekly Monday 05:00 UTC, `javascript-typescript` matrix, CodeQL init/autobuild/analyze v3

## Default setup API

```
POST /repos/Atenaxproject/vigil/code-scanning/default-setup
```

**Result:** HTTP **404** (not available on this repo/plan or endpoint deprecated). Analysis relies on the committed workflow after merge to `main`.

## Orlando follow-up (optional)

In GitHub → **Settings → Code security and analysis**, confirm **Code scanning** is enabled for the repository if the first workflow run does not appear.
