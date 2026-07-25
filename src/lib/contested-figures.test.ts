import { describe, expect, it } from 'vitest'
import { assertContestedHasDisputes } from '@/lib/contested-figures'

describe('assertContestedHasDisputes', () => {
  it('passes non-contested figures', () => {
    expect(assertContestedHasDisputes({})).toBe(true)
    expect(assertContestedHasDisputes({ is_contested: false })).toBe(true)
  })

  it('rejects contested figures without disputes', () => {
    expect(assertContestedHasDisputes({ is_contested: true })).toBe(false)
    expect(assertContestedHasDisputes({ is_contested: true, disputes: [] })).toBe(false)
  })

  it('accepts contested figures with at least one dispute', () => {
    expect(
      assertContestedHasDisputes({
        is_contested: true,
        disputes: [
          {
            party: 'A',
            claim: 'B',
            source_url: 'https://example.com',
            dated: '2026-07-01',
          },
        ],
      })
    ).toBe(true)
  })
})
