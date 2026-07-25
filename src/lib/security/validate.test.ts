import { describe, expect, it } from 'vitest'
import {
  isSafeHttpUrl,
  resolveGeoForRecord,
  sanitizeText,
} from '@/lib/security/validate'

describe('sanitizeText (real module)', () => {
  it('strips angle brackets and script schemes', () => {
    expect(sanitizeText('<script>alert(1)</script>')).not.toContain('<')
    expect(sanitizeText('javascript:alert(1)')).not.toMatch(/javascript:/i)
  })

  it('collapses whitespace and bounds length', () => {
    expect(sanitizeText('  a   b  ')).toBe('a b')
    expect(sanitizeText('x'.repeat(5000)).length).toBeLessThanOrEqual(2000)
  })
})

describe('isSafeHttpUrl', () => {
  it('allows http(s)/mailto/tel only', () => {
    expect(isSafeHttpUrl('https://example.com')).toBe('https://example.com')
    expect(isSafeHttpUrl('javascript:alert(1)')).toBeNull()
  })
})

describe('resolveGeoForRecord', () => {
  it('keeps persons inside Venezuela bounds', () => {
    const caracas = resolveGeoForRecord('person', 10.48, -66.9)
    expect(caracas.ok).toBe(true)
    if (caracas.ok) expect(caracas.regionScope).toBe('venezuela')

    const miami = resolveGeoForRecord('person', 25.76, -80.19)
    expect(miami.ok).toBe(false)
  })

  it('allows collection points in diaspora hub', () => {
    const miami = resolveGeoForRecord('collection_point', 25.76, -80.19)
    expect(miami.ok).toBe(true)
    if (miami.ok) expect(miami.regionScope).toBe('usa_diaspora')
  })
})
