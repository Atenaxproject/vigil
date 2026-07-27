/**
 * Client-side image compression for weak-signal uploads (performance budget).
 * Server still strips EXIF via sharp — this only shrinks bytes before the wire.
 * Wired on `/reportar`, property assessment, and photo search.
 */

export const MAX_DIM = 1600
export const JPEG_QUALITY = 0.82
export const MAX_INPUT_BYTES = 5 * 1024 * 1024
/** Re-encode when above this size or when PNG (even if already within dim). */
export const REENCODE_BYTES = 400 * 1024

export type CompressResult = {
  file: File
  compressed: boolean
}

/** Pure gate — used by forms and unit tests (no DOM). */
export function shouldAttemptCompress(file: Pick<File, 'type' | 'size'>): boolean {
  return file.type.startsWith('image/') && file.size > 0 && file.size <= MAX_INPUT_BYTES
}

export function needsReencode(file: Pick<File, 'type' | 'size'>, width: number, height: number): boolean {
  const scale = Math.min(1, MAX_DIM / Math.max(width, height))
  return scale < 1 || file.size > REENCODE_BYTES || file.type === 'image/png'
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image_load_failed'))
    }
    img.src = url
  })
}

/**
 * Resize + re-encode to JPEG when the file is large or oversized in pixels.
 * Returns the original File unchanged when compression is unnecessary or fails.
 */
export async function compressImageForUpload(file: File): Promise<CompressResult> {
  if (!shouldAttemptCompress(file)) {
    return { file, compressed: false }
  }

  try {
    const img = await loadImage(file)
    if (!needsReencode(file, img.width, img.height)) {
      return { file, compressed: false }
    }
    const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height))

    const w = Math.max(1, Math.round(img.width * scale))
    const h = Math.max(1, Math.round(img.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return { file, compressed: false }
    ctx.drawImage(img, 0, 0, w, h)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', JPEG_QUALITY)
    )
    if (!blob || blob.size >= file.size) {
      return { file, compressed: false }
    }

    const name = file.name.replace(/\.\w+$/, '') + '.jpg'
    return {
      file: new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() }),
      compressed: true,
    }
  } catch {
    return { file, compressed: false }
  }
}
