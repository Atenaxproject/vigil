# 76A — EXIF Stripping (urgent security fix)

**Split out of 76 §5. Own branch, own PR, ahead of the full 76 build.**
**PR routing required** — touches upload paths and stored user content.

---

## The finding

EXIF metadata is never stripped from uploaded photos. `sharp` is available and unused. Two paths leak:

- `property-assessments/submit` — server-side, raw bytes stored
- **Missing-person photos, uploaded client-side directly to storage** — higher risk, higher volume

`photo-search` does not store and is clean.

**Why this is severe and not merely untidy.** Consumer phones write GPS coordinates into photo EXIF by default. A photo of a missing person is very often taken at home. Those coordinates have been publicly served since launch, readable by anyone who downloads the file and opens it in any metadata viewer. For a missing child, this is the family's home address attached to the child's face.

---

## §1 — Backfill existing photos 🔴 THE ACTUAL REMEDIATION

Fable's scope covered stripping on upload. That stops new leaks and fixes nothing already exposed.

**Every photo currently in storage still carries its EXIF.** Do this first, or at minimum in the same PR.

- Enumerate every stored image across all buckets — missing-person photos, property assessments, anything else. Report the count per bucket before changing anything.
- Strip EXIF from each and replace in place, preserving the object path so existing references keep resolving.
- **Preserve visual orientation.** See §3 — this is where naive stripping corrupts images.
- Verify by re-reading a sample of processed objects and confirming zero EXIF, GPS especially.
- Log what was processed. Do not log the coordinates found.
- If any object fails to process, leave the original and report it rather than deleting or substituting.

Run against a staging copy first if one exists. If not, process a small batch, verify, then proceed.

---

## §2 — Strip on upload, both paths

**Server-side path (`property-assessments/submit`):** straightforward — strip with `sharp` before storing.

**Client-side direct-to-storage path:** the client controls what is uploaded, so a client-side strip alone is bypassable. For this threat model — ordinary users accidentally leaking their own location, not adversaries deliberately embedding it — client-side re-encode covers effectively all real cases. But do both:

- Client-side re-encode before upload. This also delivers most of prompt 78's compression benefit, so build it as the shared path rather than duplicating later.
- Server-side verification or strip as defense in depth. If direct-to-storage makes server-side interception impossible, either route uploads through a server endpoint or add a storage trigger that post-processes. **Report which approach the current architecture allows** rather than assuming.

---

## §3 — The orientation trap

Canvas re-encode and naive `sharp` calls both strip the EXIF **Orientation** tag along with everything else. Photos that relied on it — most phone photos taken in portrait — then render rotated 90 or 180 degrees.

On a missing-persons platform, a sideways face is not a cosmetic bug. It degrades recognition, which is the entire function of the photo.

- Read Orientation, apply the rotation to the pixel data, **then** strip metadata
- `sharp`'s `.rotate()` with no argument does this correctly when called before `.toBuffer()`
- For client-side canvas work, read Orientation before drawing and transform accordingly
- Test with a portrait photo from an actual phone, not a synthetic file — synthetic test images usually lack the tag entirely and will pass a broken implementation

---

## §4 — Verify the strip is real

- Confirm zero EXIF on a processed object by reading the stored bytes, not the rendered image
- Confirm GPS specifically is absent
- Confirm the image still displays at the correct orientation and acceptable quality
- Confirm nothing else in the pipeline re-attaches metadata downstream

---

## Constraints

- Do not delete originals until replacements are verified.
- Do not log or store the GPS values discovered during the backfill. They are the thing being removed.
- No change to display behavior, layout, or the design system.
- Keep the client-side re-encode structured so prompt 78 extends it rather than replacing it.

## Report back

1. Count of stored images per bucket, before and after.
2. Which upload paths now strip, and at which layer.
3. Whether server-side interception is architecturally possible on the client-direct path.
4. Proof: raw bytes of one backfilled object showing no EXIF, plus the same image rendering upright.
5. Any object that failed processing.
