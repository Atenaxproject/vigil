import { afterEach, describe, expect, it } from 'vitest'
import { buildBasemapUrl } from '@/lib/basemap'

const TILE = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

describe('buildBasemapUrl', () => {
  const prev = process.env.NEXT_PUBLIC_CARTO_API_KEY

  afterEach(() => {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_CARTO_API_KEY
    else process.env.NEXT_PUBLIC_CARTO_API_KEY = prev
  })

  it('omits the query when the key is unset or blank', () => {
    expect(buildBasemapUrl(undefined)).toBe(TILE)
    expect(buildBasemapUrl('')).toBe(TILE)
    expect(buildBasemapUrl('   ')).toBe(TILE)
  })

  it('appends ?key= from the provided value', () => {
    expect(buildBasemapUrl('test-carto-key')).toBe(`${TILE}?key=test-carto-key`)
  })

  it('URL-encodes reserved characters in the key', () => {
    expect(buildBasemapUrl('a+b/c')).toBe(`${TILE}?key=a%2Bb%2Fc`)
  })
})
