import type { PublicMissingPerson } from '@/types/vigil.types'
import type { DTVPersona } from '@/lib/dtv-api'

export interface FederatedPerson extends PublicMissingPerson {
  _source: 'vigil' | 'dtv'
  dtvUrl?: string
}

const DTV_PLATFORM_URL = 'https://desaparecidosterremotovenezuela.com'

export function mapDTVPersonaToFederated(person: DTVPersona): FederatedPerson {
  return {
    id: person.id,
    full_name: person.nombre,
    age: person.edad ?? null,
    gender: person.sexo ?? null,
    photo_url: person.foto_url ?? null,
    last_seen_location: person.ubicacion ?? person.estado ?? 'Venezuela',
    estado: person.estado ?? null,
    municipio: null,
    parroquia: null,
    approx_last_seen_lat: null,
    approx_last_seen_lng: null,
    last_seen_at: person.created_at,
    status: person.localizado ? 'found_alive' : 'missing',
    notes: null,
    source: 'partner',
    verified: true,
    created_at: person.created_at,
    updated_at: person.created_at,
    _source: 'dtv',
    dtvUrl: DTV_PLATFORM_URL,
  }
}

export function tagVigilPerson(person: PublicMissingPerson): FederatedPerson {
  return { ...person, _source: 'vigil' }
}
