import { describe, expect, it } from 'vitest'
import {
  deriveBreakerState,
  isHaikuFeatureAllowed,
  isPhotoSearchAllowed,
} from '@/lib/ai/circuit-breaker'

describe('deriveBreakerState', () => {
  it('returns ok below degrade', () => {
    expect(deriveBreakerState(0, 800, 2000)).toBe('ok')
    expect(deriveBreakerState(799, 800, 2000)).toBe('ok')
  })

  it('returns degraded at degrade threshold', () => {
    expect(deriveBreakerState(800, 800, 2000)).toBe('degraded')
    expect(deriveBreakerState(1999, 800, 2000)).toBe('degraded')
  })

  it('returns halted at halt threshold', () => {
    expect(deriveBreakerState(2000, 800, 2000)).toBe('halted')
    expect(deriveBreakerState(9999, 800, 2000)).toBe('halted')
  })
})

describe('feature gates', () => {
  it('blocks photo search when degraded or halted', () => {
    expect(isPhotoSearchAllowed('ok')).toBe(true)
    expect(isPhotoSearchAllowed('degraded')).toBe(false)
    expect(isPhotoSearchAllowed('halted')).toBe(false)
  })

  it('allows haiku until halted', () => {
    expect(isHaikuFeatureAllowed('ok')).toBe(true)
    expect(isHaikuFeatureAllowed('degraded')).toBe(true)
    expect(isHaikuFeatureAllowed('halted')).toBe(false)
  })
})
