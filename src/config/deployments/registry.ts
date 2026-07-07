// Deployment registry — geo-aware deployment suggestion + manual picker.
// Coarse country/region matching only (Vercel geo headers); no GPS, no
// tracking, no cookies, nothing persisted server-side.
//
// NOTE: vigil.youthewave.org is DNS-only on Cloudflare (gray cloud) — the
// CF-IPCountry header does NOT exist here. Use Vercel's x-vercel-ip-country /
// x-vercel-ip-country-region headers (all plans, coarse by design).

export type DeploymentStatus = 'live' | 'prebuilt'

export interface VigilDeployment {
  id: string
  countryCodes: string[]
  regionCodes: string[]
  url: string | null
  label: string
  status: DeploymentStatus
}

export const CURRENT_DEPLOYMENT_ID = 'venezuela'

export const DEPLOYMENTS: VigilDeployment[] = [
  {
    id: 'venezuela',
    countryCodes: ['VE'],
    regionCodes: [],
    url: 'https://vigil.youthewave.org',
    label: 'Vigil Venezuela',
    status: 'live',
  },
  {
    id: 'florida',
    countryCodes: ['US'],
    regionCodes: ['FL'],
    url: null,
    label: 'Vigil Florida',
    status: 'prebuilt',
  },
  {
    id: 'mexico-pacific',
    countryCodes: ['MX'],
    regionCodes: [],
    url: null,
    label: 'Vigil México Pacífico',
    status: 'prebuilt',
  },
]

/** Region match beats country match; returns null when nothing matches. */
export function matchDeployment(
  country: string | null,
  region: string | null
): VigilDeployment | null {
  if (!country) return null
  const byRegion = DEPLOYMENTS.find(
    (d) => d.countryCodes.includes(country) && region !== null && d.regionCodes.includes(region)
  )
  if (byRegion) return byRegion
  return DEPLOYMENTS.find((d) => d.countryCodes.includes(country) && d.regionCodes.length === 0) ?? null
}

export function liveDeployments(): VigilDeployment[] {
  return DEPLOYMENTS.filter((d) => d.status === 'live')
}
