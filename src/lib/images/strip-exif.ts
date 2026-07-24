import sharp from 'sharp'

export type UploadMime = 'image/jpeg' | 'image/png' | 'image/webp'

/**
 * Re-encode an image so EXIF metadata (GPS coordinates included) is removed
 * before it is ever stored or forwarded (76A).
 *
 * The orientation trap (76A §3): `.rotate()` with no argument reads the EXIF
 * Orientation tag and bakes the rotation into the pixels — this MUST run before
 * the metadata is dropped, or portrait phone photos render sideways, which
 * degrades face recognition (the whole point of the photo). sharp drops all
 * metadata on output by default (no `.withMetadata()`/`.keepMetadata()` call),
 * so re-encoding yields an EXIF-free, correctly-oriented image.
 */
export async function stripExif(
  input: Buffer,
  mime: UploadMime,
  maxDim = 3000
): Promise<{ buffer: Buffer; mime: UploadMime }> {
  // Bound the pixel dimensions before re-encoding. Re-encoding can otherwise
  // produce a buffer LARGER than the original (PNG especially), which would
  // slip past the caller's byte-size validation on the original; capping
  // dimensions bounds the output and doubles as a display-resolution ceiling.
  const pipeline = sharp(input, { failOn: 'none' })
    .rotate()
    .resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true })
  if (mime === 'image/png') {
    return { buffer: await pipeline.png().toBuffer(), mime: 'image/png' }
  }
  if (mime === 'image/webp') {
    return { buffer: await pipeline.webp({ quality: 85 }).toBuffer(), mime: 'image/webp' }
  }
  return { buffer: await pipeline.jpeg({ quality: 85 }).toBuffer(), mime: 'image/jpeg' }
}
