# 78 — Minors Legal Grounding & Removal Mechanism

**Public stub.** The full execution prompt is retained in the operator’s private archive (`docs/evaluations/`, gitignored) and is **not published**.

## What this slice covers (safe summary)

- Add a descriptive **legal-basis** section on `/proteccion-de-menores` that cites applicable Venezuelan minors-protection and hábeas-data provisions. Describe Vigil’s existing behavior only — **no compliance claims**.
- Expose a concrete **“Solicitar baja o corrección”** path on person-record detail pages (all records; clearer standing language when `is_minor`), reusing the existing privacy-preserving request flow when possible, with `vigil@youthewave.org` as a written alternative.
- Cross-link `/terminos` (and English `/terms`) to the minors page and the removal path.
- State on-page that the text is informational and not legal advice.

## Hard constraints (public)

- Do **not** assert that Vigil “complies with” any statute.
- Do **not** change minor photo-display behavior in this slice; any photo-policy change requires Orlando + counsel.
- Do **not** invent a response-time SLA.
- All user-facing strings ship in all 8 locales.
- No schema change; normal review.

## Private material (not in this stub)

Counsel-open questions, peer-platform comparison detail, and admin triage internals are omitted from the public tree. Operators: use the private full prompt under `docs/evaluations/archive-from-public/docs/build-process/78-minors-legal-grounding.md`.

## Status

Prompt content finished 2026-07-26. Product implementation not started from this archive step.
