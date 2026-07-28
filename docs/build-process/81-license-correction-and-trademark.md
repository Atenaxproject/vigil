# 81 — License Correction (Apache-2.0), Trademark Notice, and Brand-Mark Sweep

**Status:** Complete (2026-07-27)  
**Public stub** — full execution prompt is private (operator archive).

## Summary

Standardize Vigil’s code license on **Apache-2.0** (OSI, patent grant, trademark clause). Move brand protection out of a custom non-OSI license into `TRADEMARK.md` + `NOTICE`. Keep Terms/Privacy data rules (including commercial use of platform **data**) unchanged.

## Hard constraints

- Docs / license metadata (+ license self-description in press, footer i18n, ToS IP paragraph) only for alignment; no FL/MX activation.
- Do not use `®` — marks are not federally registered; use `™` only.
- Do not invent legal language beyond the specified Apache + trademark text.
- Canonical Apache-2.0 body must remain unmodified; copyright owner line is provisional pending YouTheWave Inc. incorporation.

## Deliverables (shipped)

- Root `LICENSE` (Apache-2.0), `NOTICE`, `TRADEMARK.md`
- README / CONTRIBUTING / package.json / GitHub About
- Press kit sources + regenerated PDFs; footer/press locale strings
- ToS §6 IP paragraph aligned; data §7 unchanged

See `CHANGELOG.md` (2026-07-27 spec 81 entry) and restore tag `restore/pre-license-correction-20260727`.
