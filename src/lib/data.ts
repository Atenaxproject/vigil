import { createClient } from '@/lib/supabase/server'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import type { RegionScope } from '@/types/vigil.types'
import type {
  PublicMissingPerson,
  MapMarker,
  Organization,
  PublicPropertyAssessment,
} from '@/types/vigil.types'

const DEFAULT_REGION: RegionScope = 'venezuela'

function orgPriority(name: string): number {
  const priorities = CRISIS_CONFIG.orgDisplayPriority
  for (const [key, value] of Object.entries(priorities)) {
    if (name.includes(key)) return value
  }
  return 50
}

function sortOrganizations(orgs: Organization[]): Organization[] {
  return [...orgs].sort((a, b) => {
    const diff = orgPriority(a.name) - orgPriority(b.name)
    if (diff !== 0) return diff
    return a.name.localeCompare(b.name)
  })
}

export async function getMissingPersonsForMap(limit = 300): Promise<PublicMissingPerson[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('public_missing_persons')
      .select('*')
      .not('approx_last_seen_lat', 'is', null)
      .not('approx_last_seen_lng', 'is', null)
      .eq('status', 'missing')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return []
    return (data ?? []).map((row) => ({
      ...row,
      approx_last_seen_lat:
        row.approx_last_seen_lat != null ? Number(row.approx_last_seen_lat) : null,
      approx_last_seen_lng:
        row.approx_last_seen_lng != null ? Number(row.approx_last_seen_lng) : null,
    })) as PublicMissingPerson[]
  } catch {
    return []
  }
}

export async function getRecentMissingPersons(limit = 10): Promise<PublicMissingPerson[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('public_missing_persons')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return []
    return (data ?? []) as PublicMissingPerson[]
  } catch {
    return []
  }
}

export async function getApprovedOrganizations(
  regionScope: RegionScope = DEFAULT_REGION
): Promise<Organization[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('organizations')
      .select(
        'id, name, type, country, description_es, description_en, website, phone, email, whatsapp, donation_link, donation_instructions, lat, lng, location_label, verified, active, region_scope'
      )
      .eq('approved_by_admin', true)
      .eq('active', true)
      .eq('region_scope', regionScope)

    if (error) return []
    return sortOrganizations((data ?? []) as Organization[])
  } catch {
    return []
  }
}

export async function getDonationOrganizations(): Promise<Organization[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('organizations')
      .select(
        'id, name, type, country, description_es, description_en, website, donation_link, donation_instructions, verified, active'
      )
      .eq('approved_by_admin', true)
      .eq('active', true)
      .or('type.eq.donation,donation_link.not.is.null')
      .order('name')

    if (error) return []
    return (data ?? []) as Organization[]
  } catch {
    return []
  }
}

export async function getPublicPropertyAssessments(): Promise<PublicPropertyAssessment[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('public_property_assessments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) return []
    return (data ?? []).map((row) => ({
      ...row,
      approx_location_lat:
        row.approx_location_lat != null ? Number(row.approx_location_lat) : null,
      approx_location_lng:
        row.approx_location_lng != null ? Number(row.approx_location_lng) : null,
    })) as PublicPropertyAssessment[]
  } catch {
    return []
  }
}

export async function getPropertyAssessmentStats(): Promise<{
  assessedThisWeek: number
  activeProfessionals: number
}> {
  try {
    const supabase = await createClient()
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { count: assessed } = await supabase
      .from('public_property_assessments')
      .select('id', { count: 'exact', head: true })
      .neq('tag_status', 'unassessed')
      .gte('created_at', weekAgo)

    const skillQueries = await Promise.all(
      (['structural_engineer', 'architect', 'surveyor'] as const).map((skill) =>
        supabase
          .from('public_volunteers')
          .select('id', { count: 'exact', head: true })
          .contains('skills', [skill])
      )
    )

    const activeProfessionals = skillQueries.reduce((sum, r) => sum + (r.count ?? 0), 0)

    return {
      assessedThisWeek: assessed ?? 0,
      activeProfessionals,
    }
  } catch {
    return { assessedThisWeek: 0, activeProfessionals: 0 }
  }
}

export async function getMapMarkers(regionScope: RegionScope = DEFAULT_REGION): Promise<MapMarker[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('map_markers')
      .select(
        'id, type, category, title, description, lat, lng, estado, municipio, urgent, status, verified, source, created_at, hours_schedule, accepts_categories, organizer_name, region_scope'
      )
      .eq('status', 'active')
      .eq('flagged', false)
      .eq('region_scope', regionScope)
      .limit(200)

    if (error) return []
    return (data ?? []).map((m) => ({
      ...m,
      lat: Number(m.lat),
      lng: Number(m.lng),
      contact: null,
    })) as MapMarker[]
  } catch {
    return []
  }
}
