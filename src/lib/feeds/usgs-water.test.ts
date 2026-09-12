import { readFileSync } from 'fs'
import { join } from 'path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getWaterGaugesBySites, getWaterGaugesByState } from '@/lib/feeds/usgs-water'

const FIXTURES = join(__dirname, '__fixtures__')
const waterFixture = JSON.parse(readFileSync(join(FIXTURES, 'usgs-water-fl.json'), 'utf8'))

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, statusText: ok ? 'OK' : 'Error', json: async () => body } as Response
}

describe('getWaterGaugesBySites', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('maps the recorded FL gauges to the WaterGauge shape', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(waterFixture)))

    const gauges = await getWaterGaugesBySites(['02323500', '02358000'])

    expect(gauges).toHaveLength(2)
    expect(gauges[0]).toMatchObject({
      siteCode: '02323500',
      siteName: 'SUWANNEE RIVER NEAR WILCOX, FLA.',
      lat: 29.58968017,
      lng: -82.9365131,
      gaugeHeightFt: 3.8,
    })
    expect(gauges[0].observedAt).toBe('2026-07-07T10:30:00.000-04:00')
  })

  it('requests an explicit sites= query rather than a statewide dump', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(waterFixture))
    vi.stubGlobal('fetch', fetchMock)

    await getWaterGaugesBySites(['02323500', '02358000'])

    const [url] = fetchMock.mock.calls[0]
    expect(url).toContain('sites=02323500,02358000')
    expect(url).not.toContain('stateCd=')
  })

  it('skips an empty site list without calling fetch', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(getWaterGaugesBySites([])).resolves.toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('skips a gauge missing coordinates instead of throwing', async () => {
    const fixture = {
      value: {
        timeSeries: [{ sourceInfo: { siteName: 'No Location', siteCode: [{ value: 'x' }] }, values: [] }],
      },
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(fixture)))

    await expect(getWaterGaugesBySites(['x'])).resolves.toEqual([])
  })

  it('reports a null gaugeHeightFt when the latest value is non-numeric, rather than NaN', async () => {
    const fixture = {
      value: {
        timeSeries: [
          {
            sourceInfo: {
              siteName: 'Bad Reading',
              siteCode: [{ value: 'y' }],
              geoLocation: { geogLocation: { latitude: 1, longitude: 2 } },
            },
            values: [{ value: [{ value: 'ICE', dateTime: '2026-01-01T00:00:00Z' }] }],
          },
        ],
      },
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(fixture)))

    const [gauge] = await getWaterGaugesBySites(['y'])
    expect(gauge.gaugeHeightFt).toBeNull()
  })

  it('degrades to an empty array on a non-OK response rather than throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(null, false, 503)))

    await expect(getWaterGaugesBySites(['02323500'])).resolves.toEqual([])
  })

  it('degrades to an empty array when the fetch itself rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    await expect(getWaterGaugesBySites(['02323500'])).resolves.toEqual([])
  })
})

describe('getWaterGaugesByState', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requests a lowercase stateCd query', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(waterFixture))
    vi.stubGlobal('fetch', fetchMock)

    await getWaterGaugesByState('FL')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toContain('stateCd=fl')
  })
})
