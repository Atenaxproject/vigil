/**
 * Client-side image compression for weak-signal uploads (performance budget).
 * Server still strips EXIF via sharp — this only shrinks bytes before the wire.
 */

const MAX_DIM = 1600
const JPEG_QUALITY = 0.82
const MAX_INPUT_BYTES = 5 * 1024 * 1024

export type CompressResult = {
  file: File
  compressed: boolean
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
  if (!file.type.startsWith('image/')) {
    return { file, compressed: false }
  }
  if (file.size > MAX_INPUT_BYTES) {
    return { file, compressed: false }
  }

  try {
    const img = await loadImage(file)
    const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height))
    const needsResize = scale < 1
    const needsReencode = file.size > 400 * 1024 || file.type === 'image/png'

    if (!needsResize && !needsReencode) {
      return { file, compressed: false }
    }

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
