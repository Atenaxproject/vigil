import { createClient } from '@/lib/supabase/server'
import type {
  PublicMissingPerson,
  MapMarker,
  Organization,
  PublicPropertyAssessment,
} from '@/types/vigil.types'

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

export async function getApprovedOrganizations(): Promise<Organization[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('organizations')
      .select(
        'id, name, type, country, description_es, description_en, website, phone, email, whatsapp, donation_link, donation_instructions, lat, lng, location_label, verified, active'
      )
      .eq('approved_by_admin', true)
      .eq('active', true)
      .order('name')

    if (error) return []
    return (data ?? []) as Organization[]
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

export async function getMapMarkers(): Promise<MapMarker[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('map_markers')
      .select(
        'id, type, category, title, description, lat, lng, urgent, status, verified, source, created_at, hours_schedule, accepts_categories, organizer_name'
      )
      .eq('status', 'active')
      .eq('flagged', false)
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
