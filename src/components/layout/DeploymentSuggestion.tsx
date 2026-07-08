import { headers } from 'next/headers'
import {
  CURRENT_DEPLOYMENT_ID,
  matchDeployment,
} from '@/config/deployments/registry'
import { DeploymentSuggestionBanner } from '@/components/layout/DeploymentSuggestionBanner'

/**
 * Geo-aware deployment suggestion (server side of the pair).
 * Reads Vercel's coarse geo headers — never stored, no cookies, no consent
 * banner needed because nothing persists server-side. Renders nothing unless
 * the visitor matches a DIFFERENT deployment that is actually live (no
 * vaporware banners for prebuilt configs).
 */
export async function DeploymentSuggestion() {
  const h = await headers()
  const country = h.get('x-vercel-ip-country')
  const region = h.get('x-vercel-ip-country-region')

  const matched = matchDeployment(country, region)
  if (!matched || matched.id === CURRENT_DEPLOYMENT_ID) return null
  if (matched.status !== 'live' || !matched.url) return null

  return (
    <DeploymentSuggestionBanner
      deploymentId={matched.id}
      label={matched.label}
      url={matched.url}
    />
  )
}
