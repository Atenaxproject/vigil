import { describe, expect, it } from 'vitest'
import { getContentDisposition, isPastDate } from '@/lib/content-expiry'

describe('isPastDate', () => {
  it('detects past end dates', () => {
    expect(isPastDate('2020-01-01', new Date('2026-07-25'))).toBe(true)
    expect(isPastDate('2099-01-01', new Date('2026-07-25'))).toBe(false)
  })
})

describe('getContentDisposition', () => {
  it('marks expired content when expiresAt is past', () => {
    const r = getContentDisposition(
      { expiresAt: '2020-01-01' },
      new Date('2026-07-25')
    )
    expect(r.disposition).toBe('expired')
  })

  it('suppresses when suppressWhenStale is set', () => {
    const r = getContentDisposition(
      { expiresAt: '2020-01-01', suppressWhenStale: true },
      new Date('2026-07-25')
    )
    expect(r.disposition).toBe('suppressed')
  })

  it('shows content without expiry', () => {
    const r = getContentDisposition({}, new Date('2026-07-25'))
    expect(r.disposition).toBe('show')
  })
})
