import { describe, expect, it } from 'vitest'
import {
  MAX_INPUT_BYTES,
  needsReencode,
  REENCODE_BYTES,
  shouldAttemptCompress,
} from '@/lib/images/compress-client'

describe('shouldAttemptCompress', () => {
  it('rejects non-images', () => {
    expect(shouldAttemptCompress({ type: 'application/pdf', size: 1000 })).toBe(false)
    expect(shouldAttemptCompress({ type: '', size: 1000 })).toBe(false)
  })

  it('rejects empty or oversized files', () => {
    expect(shouldAttemptCompress({ type: 'image/jpeg', size: 0 })).toBe(false)
    expect(shouldAttemptCompress({ type: 'image/jpeg', size: MAX_INPUT_BYTES + 1 })).toBe(false)
  })

  it('accepts jpeg/png/webp within budget', () => {
    expect(shouldAttemptCompress({ type: 'image/jpeg', size: 1024 })).toBe(true)
    expect(shouldAttemptCompress({ type: 'image/png', size: 1024 })).toBe(true)
    expect(shouldAttemptCompress({ type: 'image/webp', size: MAX_INPUT_BYTES })).toBe(true)
  })
})

describe('needsReencode', () => {
  it('is false for small jpeg within max dim', () => {
    expect(needsReencode({ type: 'image/jpeg', size: 100_000 }, 800, 600)).toBe(false)
  })

  it('is true when over REENCODE_BYTES', () => {
    expect(needsReencode({ type: 'image/jpeg', size: REENCODE_BYTES + 1 }, 800, 600)).toBe(true)
  })

  it('is true for png even when small', () => {
    expect(needsReencode({ type: 'image/png', size: 50_000 }, 400, 300)).toBe(true)
  })

  it('is true when either dimension exceeds MAX_DIM', () => {
    expect(needsReencode({ type: 'image/jpeg', size: 50_000 }, 2000, 1000)).toBe(true)
    expect(needsReencode({ type: 'image/jpeg', size: 50_000 }, 1000, 2000)).toBe(true)
  })
})
