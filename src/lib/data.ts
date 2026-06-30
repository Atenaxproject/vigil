import { createClient } from '@/lib/supabase/server'
import type { PublicMissingPerson, MapMarker, Organization } from '@/types/vigil.types'

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
