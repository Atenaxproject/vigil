export type MissingPersonStatus = 'missing' | 'found_alive' | 'found_deceased' | 'unverified'
export type DataSource = 'web' | 'whatsapp' | 'telegram' | 'partner' | 'pfif_import'
export type MarkerType =
  | 'need'
  | 'resource'
  | 'shelter'
  | 'hospital'
  | 'danger'
  | 'rescue_zone'
  | 'collection_point'
export type MarkerCategory =
  | 'food'
  | 'water'
  | 'medical'
  | 'rescue'
  | 'shelter'
  | 'clothing'
  | 'comms'
  | 'power'
  | 'transport'
  | 'other'
export type MarkerStatus = 'active' | 'resolved' | 'unverified'
export type OrgType =
  | 'rescue'
  | 'medical'
  | 'food'
  | 'shelter'
  | 'translation'
  | 'tech'
  | 'government'
  | 'diaspora'
  | 'donation'
  | 'legal'
export type VolunteerSkill =
  | 'medical'
  | 'rescue'
  | 'logistics'
  | 'translation'
  | 'tech'
  | 'construction'
  | 'drone'
  | 'legal'
  | 'psych'
  | 'communications'
export type Availability = 'immediate' | 'this_week' | 'remote_only' | 'on_request'
export type NeedOfferType = 'need' | 'offer'
export type NeedCategory =
  | 'food'
  | 'water'
  | 'medical_supplies'
  | 'medicine'
  | 'blood'
  | 'shelter'
  | 'clothing'
  | 'transport'
  | 'money'
  | 'equipment'
  | 'manpower'
  | 'other'

export interface PublicMissingPerson {
  id: string
  full_name: string
  age: number | null
  gender: string | null
  photo_url: string | null
  last_seen_location: string
  last_seen_at: string | null
  status: MissingPersonStatus
  notes: string | null
  source: DataSource
  verified: boolean
  created_at: string
  updated_at: string
}

export interface MissingPerson extends PublicMissingPerson {
  last_seen_lat: number | null
  last_seen_lng: number | null
  contact_name: string
  contact_phone: string | null
  contact_whatsapp: string | null
  flagged: boolean
  flag_count: number
  duplicate_of: string | null
}

export interface MissingPersonSubmission {
  full_name: string
  age?: number
  gender?: string
  photo?: File
  last_seen_location: string
  last_seen_lat?: number
  last_seen_lng?: number
  last_seen_at?: string
  contact_name: string
  contact_phone?: string
  contact_whatsapp?: string
  notes?: string
  consent_given: boolean
  data_accuracy_confirmed: boolean
}

export interface MapMarker {
  id: string
  type: MarkerType
  category: MarkerCategory | null
  title: string
  description: string | null
  lat: number
  lng: number
  contact: string | null
  urgent: boolean
  status: MarkerStatus
  verified: boolean
  source: string
  created_at: string
}

export interface Organization {
  id: string
  name: string
  type: OrgType | null
  country: string | null
  description_es: string | null
  description_en: string | null
  website: string | null
  phone: string | null
  email: string | null
  whatsapp: string | null
  donation_link: string | null
  donation_instructions: string | null
  lat: number | null
  lng: number | null
  location_label: string | null
  verified: boolean
  active: boolean
}

export interface Volunteer {
  id: string
  full_name: string
  skills: VolunteerSkill[]
  languages: string[]
  location: string | null
  availability: Availability | null
  created_at: string
}

export interface SeismicEvent {
  id: string
  magnitude: number
  place: string
  time: number
  lat: number
  lng: number
  depth: number
  url: string
}

export interface ContactRequest {
  missing_person_id: string
  requester_name: string
  requester_phone: string
  requester_relationship: string
  message: string
  created_at: string
}

export interface PFIFPerson {
  personRecordId: string
  sourceDate: string
  fullName: string
  sex?: string
  age?: string
  photoUrl?: string
  lastKnownLocation?: string
  status: 'information_sought' | 'is_note_author' | 'believed_alive' | 'believed_dead' | 'believed_missing'
}
