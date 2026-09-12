import { readFileSync } from 'fs'
import { join } from 'path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getNwsAlertsByState, getNwsAlertsByPoint } from '@/lib/feeds/nws'

const FIXTURES = join(__dirname, '__fixtures__')
const nwsFixture = JSON.parse(readFileSync(join(FIXTURES, 'nws-alerts-fl.json'), 'utf8'))

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, statusText: ok ? 'OK' : 'Error', json: async () => body } as Response
}

describe('getNwsAlertsByState', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('maps recorded FL alerts to the NwsAlert shape', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(nwsFixture)))

    const alerts = await getNwsAlertsByState('FL')

    expect(alerts).toHaveLength(nwsFixture.features.length)
    const [first] = alerts
    expect(first).toMatchObject({
      id: nwsFixture.features[0].id,
      event: 'Rip Current Statement',
      severity: 'Moderate',
      urgency: 'Expected',
      certainty: 'Likely',
    })
    expect(typeof first.headline).toBe('string')
    expect(typeof first.expires).toBe('string')
  })

  it('mirrors only official NWS severity tiers, mapping anything else to Unknown', async () => {
    const fixture = {
      features: [
        {
          id: 'a',
          geometry: null,
          properties: { event: 'Test Event', severity: 'Catastrophic' },
        },
      ],
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(fixture)))

    const [alert] = await getNwsAlertsByState('FL')

    expect(alert.severity).toBe('Unknown')
  })

  it('sends the required identifying User-Agent header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ features: [] }))
    vi.stubGlobal('fetch', fetchMock)

    await getNwsAlertsByState('FL')

    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers['User-Agent']).toContain('vigil.youthewave.org')
  })

  it('builds a point query with fixed-precision coordinates', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ features: [] }))
    vi.stubGlobal('fetch', fetchMock)

    await getNwsAlertsByPoint(27.9944, -81.7603)

    const [url] = fetchMock.mock.calls[0]
    expect(url).toContain('point=27.9944,-81.7603')
  })

  it('degrades to an empty array on a non-OK response rather than throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(null, false, 503)))

    await expect(getNwsAlertsByState('FL')).resolves.toEqual([])
  })

  it('degrades to an empty array when the fetch itself rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    await expect(getNwsAlertsByState('FL')).resolves.toEqual([])
  })
})
