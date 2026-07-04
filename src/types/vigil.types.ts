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
  | 'child_protection'
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
  | 'structural_engineer'
  | 'architect'
  | 'surveyor'
  | 'logistics_shipping'
  | 'translation_local'
  | 'warehouse_sorting'
  | 'local_driver'
  | 'fundraising_event'

export type RegionScope = 'venezuela' | 'usa_diaspora'
export type SeismicSource = 'USGS' | 'FUNVISIS'
export type PropertyRequestType = 'inspection' | 'relocation_assistance' | 'both'
export type PropertyTagStatus = 'unassessed' | 'green' | 'yellow' | 'red'
export type PropertyAssessmentStatus = 'open' | 'assigned' | 'completed' | 'closed'

export interface PublicPropertyAssessment {
  id: string
  estado: string | null
  municipio: string | null
  approx_location_lat: number | null
  approx_location_lng: number | null
  request_type: PropertyRequestType
  tag_status: PropertyTagStatus
  created_at: string
}
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
  estado: string | null
  municipio: string | null
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
  estado: string
  municipio?: string
  parroquia?: string
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
  estado: string | null
  municipio: string | null
  contact: string | null
  urgent: boolean
  status: MarkerStatus
  verified: boolean
  source: string
  created_at: string
  hours_schedule?: string | null
  accepts_categories?: string[]
  organizer_name?: string | null
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
  region_scope?: RegionScope
}

export type ResourceExchangeType = 'offering' | 'requesting'
export type ResourceExchangeCategory =
  | 'goods'
  | 'shelter'
  | 'transport'
  | 'skills'
  | 'volunteer'
  | 'equipment'
  | 'money'
export type ResourceExchangeStatus = 'active' | 'matched' | 'fulfilled' | 'expired'
export type ContactMethod = 'whatsapp' | 'phone' | 'email' | 'vigil'

export interface PublicResourceExchange {
  id: string
  entry_type: ResourceExchangeType
  category: ResourceExchangeCategory
  title: string
  description: string
  quantity: string | null
  location: string
  languages: string[]
  available_until: string | null
  urgent: boolean
  status: ResourceExchangeStatus
  verified: boolean
  created_at: string
  updated_at: string
}

export interface ResourceExchange extends PublicResourceExchange {
  lat: number | null
  lng: number | null
  contact_method: ContactMethod
  contact_value: string | null
  flagged: boolean
  flag_count: number
  matched_with: string | null
}

export type VolunteerEquipment =
  | 'vehicle'
  | 'tools'
  | 'generator'
  | 'medical_kit'
  | 'drones'
  | 'comms'

export interface PublicVolunteer {
  id: string
  display_name: string
  skills: VolunteerSkill[]
  languages: string[]
  location_city: string | null
  availability: Availability | null
  specialization: string | null
  equipment: VolunteerEquipment[]
  remote_available: boolean
  created_at: string
}

export interface Volunteer {
  id: string
  full_name: string
  skills: VolunteerSkill[]
  languages: string[]
  location: string | null
  availability: Availability | null
  specialization: string | null
  equipment: VolunteerEquipment[]
  remote_available: boolean
  verification_url: string | null
  credential_note: string | null
  public_display: boolean
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
  source: SeismicSource
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

export type InfrastructureMetric =
  | 'electricity'
  | 'water'
  | 'roads'
  | 'airport'
  | 'telecom'
  | 'fuel'

export interface InfrastructureStatus {
  id: string
  region: string
  metric: InfrastructureMetric
  status_percent: number | null
  status_label: string | null
  notes: string | null
  updated_by: string | null
  updated_at: string
}

export type RescuerPresenceType = 'rescue_team' | 'volunteer' | 'medical' | 'individual'
export type RescuerPresenceStatus = 'active' | 'checked_in' | 'needs_assistance' | 'signed_off'

export interface PublicRescuerPresence {
  id: string
  display_name: string
  team_or_org: string | null
  presence_type: RescuerPresenceType
  lat: number
  lng: number
  status: RescuerPresenceStatus
  last_checkin: string
  notes: string | null
  auto_expire_at: string
  created_at: string
}

export type FeedbackCategory = 'bug' | 'feature_request' | 'missing_info' | 'question' | 'other'
export type FeedbackStatus = 'new' | 'reviewing' | 'resolved' | 'wont_fix'

export interface FeedbackItem {
  id: string
  category: FeedbackCategory
  message: string
  contact_email: string | null
  page_context: string | null
  status: FeedbackStatus
  admin_notes: string | null
  created_at: string
}

export type EventCategory =
  | 'donation_drive'
  | 'volunteer_meetup'
  | 'distribution'
  | 'info_session'
  | 'memorial'
  | 'other'

export interface VigilEvent {
  id: string
  title: string
  description: string | null
  category: EventCategory | null
  starts_at: string
  ends_at: string | null
  location_label: string
  lat: number | null
  lng: number | null
  organizer_name: string | null
  verified: boolean
  created_at: string
}

export type MissingPersonNoteType = 'sighting' | 'status_update' | 'encouragement' | 'correction'

export interface MissingPersonNote {
  id: string
  missing_person_id: string
  author_name: string
  note_type: MissingPersonNoteType
  message: string
  created_at: string
}

export type CommunityWallCategory = 'general' | 'aviso' | 'solidaridad' | 'pregunta'

export interface CommunityWallMessage {
  id: string
  author_name: string
  message: string
  category: CommunityWallCategory
  location_label: string | null
  created_at: string
}
