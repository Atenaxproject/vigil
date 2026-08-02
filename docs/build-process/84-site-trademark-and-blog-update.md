# 84 — Site Update: Trademark Notation, Footer Legal Links, New Blog Post

**Status:** Complete (2026-07-28) — shipped on the **youthewave.org** marketing site (separate repo from Vigil)  
**Public stub.** The full execution prompt is retained in the operator’s private archive (`docs/evaluations/`, gitignored) and is **not published**.  
**Numbering note:** This draft was numbered 84 for the org-site workstream. Vigil’s app prompt 84 is [`84-vigil-watch-timeout-hardening.md`](./84-vigil-watch-timeout-hardening.md).

## Summary

Content-only update on youthewave.org: first-use ™ on YouTheWave / Vigil, footer legal links (`Terms · Privacy · Trademark`), and the 2026-07-28 post *The code is open. The name isn't.* (`/blog/open-code-protected-name`).

## Verified live (2026-08-02)

- Blog index lists the post (2026-07-28); post body uses Vigil™ / YouTheWave™
- Footer includes Terms, Privacy, and Trademark (Trademark → Vigil `TRADEMARK.md`)
- Homepage HTML includes the ™ character

## Hard constraints (this prompt)

- Content/markdown (and minimal footer component) only — no Vigil app `src/`, schema, or deps
- Do not author new Terms/Privacy legal copy; interim Trademark link to the Vigil repo is acceptable
- First prominent ™ only — not every repetition, not nav/footer copyright
