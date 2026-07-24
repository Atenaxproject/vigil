import { getDataFeed } from '@/config/crisis.config'
import { recordFeedHealth } from '@/lib/feed-health-server'

// ReliefWeb API v2 (75C). The public v1 API was decommissioned 2026 and returns
// HTTP 410. v2 additionally requires a PRE-APPROVED appname (enforced by
// ReliefWeb from 1 Nov 2025): an unapproved appname returns HTTP 403. Until
// Orlando registers an approved appname with ReliefWeb (OCHA) and sets
// RELIEFWEB_APPNAME, every ReliefWeb call fails soft and the consuming surface
// suppresses itself — see the empty-state handling in InformacionLive and the
// hazards adapter. This is a single shared client so /estadisticas, the info
// hub, and the hazard relay never disagree about the source.
//
// Request one here: https://apidoc.reliefweb.int/parameters#appname
export const RELIEFWEB_API_BASE = 'https://api.reliefweb.int/v2'

/** Approved appname, or the unapproved default that 403s until registered. */
export const RELIEFWEB_APPNAME = process.env.RELIEFWEB_APPNAME ?? 'vigil-crisis'

/** True once an approved appname is configured. Consumers can gate on this. */
export const RELIEFWEB_ENABLED = Boolean(process.env.RELIEFWEB_APPNAME)

const RELIEFWEB_FEED = getDataFeed('reliefweb')
const RELIEFWEB_REVALIDATE = RELIEFWEB_FEED?.cacheSeconds ?? 3600

/** Build a v2 URL with the appname always attached. `params` excludes appname. */
export function reliefwebUrl(resource: 'reports' | 'disasters', params: string): string {
  const base = `${RELIEFWEB_API_BASE}/${resource}?appname=${encodeURIComponent(RELIEFWEB_APPNAME)}`
  return params ? `${base}&${params}` : base
}

export interface ReliefWebReport {
  id: string
  title: string
  date: string
  url: string
  source: string
}

// v2 reports envelope: { data: [{ id, fields: { title, date:{created}, url,
// source:[{name}] } }], count, totalCount, links }. The reports field shape is
// stable across v1→v2 (it is driven by fields[include][], not the API version);
// the breaking changes are the version prefix and the appname requirement.
interface ReliefWebResponse {
  data?: Array<{
    id: string
    fields: {
      title?: string
      date?: { created?: string }
      url?: string
      url_alias?: string
      source?: Array<{ name?: string }>
    }
  }>
}

export async function getVenezuelaUpdates(limit = 10): Promise<ReliefWebReport[]> {
  const params =
    `filter[field]=country.iso3&filter[value]=VEN&limit=${limit}&sort[]=date:desc` +
    `&fields[include][]=title&fields[include][]=date&fields[include][]=url` +
    `&fields[include][]=url_alias&fields[include][]=source`

  try {
    const res = await fetch(reliefwebUrl('reports', params), {
      next: { revalidate: RELIEFWEB_REVALIDATE, tags: ['reliefweb'] },
    })

    if (!res.ok) {
      await recordFeedHealth({
        feedId: 'reliefweb',
        label: 'ReliefWeb reports',
        ok: false,
        error: res.status === 403 ? 'HTTP 403 — appname not approved' : `HTTP ${res.status}`,
      })
      return []
    }

    const data = (await res.json()) as ReliefWebResponse
    const reports = (data.data ?? []).map((item) => ({
      id: item.id,
      title: item.fields.title ?? 'Sin título',
      date: item.fields.date?.created ?? '',
      // url_alias is a RELATIVE path (e.g. /report/...) — absolutize it so it
      // never resolves against vigil.youthewave.org as a broken link.
      url:
        item.fields.url ??
        (item.fields.url_alias ? `https://reliefweb.int${item.fields.url_alias}` : '#'),
      source: item.fields.source?.[0]?.name ?? 'ReliefWeb',
    }))

    await recordFeedHealth({
      feedId: 'reliefweb',
      label: 'ReliefWeb reports',
      ok: true,
      itemCount: reports.length,
      meta: { newest: reports[0]?.date ?? null },
    })
    return reports
  } catch (err) {
    await recordFeedHealth({
      feedId: 'reliefweb',
      label: 'ReliefWeb reports',
      ok: false,
      error: err instanceof Error ? err.message : 'unknown',
    })
    return []
  }
}
