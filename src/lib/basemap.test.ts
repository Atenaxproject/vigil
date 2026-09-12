import { afterEach, describe, expect, it } from 'vitest'
import { buildBasemapUrl, CARTO_TILE_URL, isBasemapUrl, readCartoApiKey } from '@/lib/basemap'

const TILE = CARTO_TILE_URL

describe('buildBasemapUrl', () => {
  const prevPublic = process.env.NEXT_PUBLIC_CARTO_API_KEY
  const prevServer = process.env.CARTO_API_KEY

  afterEach(() => {
    if (prevPublic === undefined) delete process.env.NEXT_PUBLIC_CARTO_API_KEY
    else process.env.NEXT_PUBLIC_CARTO_API_KEY = prevPublic
    if (prevServer === undefined) delete process.env.CARTO_API_KEY
    else process.env.CARTO_API_KEY = prevServer
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

describe('readCartoApiKey', () => {
  const prevPublic = process.env.NEXT_PUBLIC_CARTO_API_KEY
  const prevServer = process.env.CARTO_API_KEY

  afterEach(() => {
    if (prevPublic === undefined) delete process.env.NEXT_PUBLIC_CARTO_API_KEY
    else process.env.NEXT_PUBLIC_CARTO_API_KEY = prevPublic
    if (prevServer === undefined) delete process.env.CARTO_API_KEY
    else process.env.CARTO_API_KEY = prevServer
  })

  it('prefers CARTO_API_KEY over NEXT_PUBLIC_CARTO_API_KEY', () => {
    process.env.CARTO_API_KEY = 'server-key'
    process.env.NEXT_PUBLIC_CARTO_API_KEY = 'public-key'
    expect(readCartoApiKey()).toBe('server-key')
  })
})

describe('isBasemapUrl', () => {
  it('accepts CARTO Positron templates only', () => {
    expect(isBasemapUrl(`${TILE}?key=abc`)).toBe(true)
    expect(isBasemapUrl('https://evil.example/{z}/{x}/{y}.png')).toBe(false)
  })
})
