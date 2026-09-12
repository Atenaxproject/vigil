import { readFileSync } from 'fs'
import { join } from 'path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getNhcActiveStorms } from '@/lib/feeds/nhc'

const FIXTURES = join(__dirname, '__fixtures__')
const realFixture = JSON.parse(readFileSync(join(FIXTURES, 'nhc-current-storms.json'), 'utf8'))
const syntheticFixture = JSON.parse(
  readFileSync(join(FIXTURES, 'nhc-current-storms.synthetic.json'), 'utf8')
)

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, statusText: ok ? 'OK' : 'Error', json: async () => body } as Response
}

describe('getNhcActiveStorms', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns an empty array against the real recording (no active storms that day)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(realFixture)))

    await expect(getNhcActiveStorms()).resolves.toEqual([])
  })

  it('parses the synthetic fixture into typed NhcActiveStorm entries', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(syntheticFixture)))

    const storms = await getNhcActiveStorms()

    expect(storms).toHaveLength(2)
    expect(storms[0]).toMatchObject({
      id: 'ep022026',
      name: 'Test',
      classification: 'HU',
      intensityKt: 85,
      lat: 16.5,
      lng: -105.2,
      basin: 'EP',
    })
    expect(storms[0].movement).toBe('295° @ 10 kt')
  })

  it('never filters out the Eastern Pacific basin (Mexico-config requirement)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(syntheticFixture)))

    const storms = await getNhcActiveStorms()

    expect(storms.some((s) => s.basin === 'EP')).toBe(true)
  })

  it('skips entries missing a numeric position instead of throwing', async () => {
    const fixture = {
      activeStorms: [{ id: 'al012026', name: 'Bad', classification: 'TD', latitudeNumeric: null }],
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(fixture)))

    await expect(getNhcActiveStorms()).resolves.toEqual([])
  })

  it('degrades to an empty array on a non-OK response rather than throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(null, false, 503)))

    await expect(getNhcActiveStorms()).resolves.toEqual([])
  })

  it('degrades to an empty array when the fetch itself rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    await expect(getNhcActiveStorms()).resolves.toEqual([])
  })
})
