import type { PublicMissingPerson } from '@/types/vigil.types'
import type { PFIFPerson } from '@/types/vigil.types'

function mapStatus(status: PublicMissingPerson['status']): PFIFPerson['status'] {
  switch (status) {
    case 'found_alive':
      return 'believed_alive'
    case 'found_deceased':
      return 'believed_dead'
    case 'missing':
      return 'believed_missing'
    default:
      return 'information_sought'
  }
}

export function toPfifPerson(record: PublicMissingPerson): PFIFPerson {
  // For a minor the view has nulled the free-text location; PFIF keeps city +
  // state only (76 §4), reconstructed from municipio/estado so cross-platform
  // matching still works at municipio granularity. is_minor is never in the
  // record (not a view column) and never emitted (76 §5).
  const municipioLevel = [record.municipio, record.estado].filter(Boolean).join(', ')
  return {
    personRecordId: record.id,
    sourceDate: record.updated_at,
    fullName: record.full_name,
    sex: record.gender ?? undefined,
    age: record.age?.toString(),
    photoUrl: record.photo_url ?? undefined,
    lastKnownLocation: record.last_seen_location ?? (municipioLevel || undefined),
    status: mapStatus(record.status),
  }
}

export function buildPfifXml(persons: PFIFPerson[]): string {
  const entries = persons
    .map(
      (p) => `
  <pfif:person>
    <pfif:person_record_id>${escapeXml(p.personRecordId)}</pfif:person_record_id>
    <pfif:source_date>${escapeXml(p.sourceDate)}</pfif:source_date>
    <pfif:full_name>${escapeXml(p.fullName)}</pfif:full_name>
    ${p.sex ? `<pfif:sex>${escapeXml(p.sex)}</pfif:sex>` : ''}
    ${p.age ? `<pfif:age>${escapeXml(p.age)}</pfif:age>` : ''}
    ${p.photoUrl ? `<pfif:photo_url>${escapeXml(p.photoUrl)}</pfif:photo_url>` : ''}
    ${p.lastKnownLocation ? `<pfif:last_known_location>${escapeXml(p.lastKnownLocation)}</pfif:last_known_location>` : ''}
    <pfif:status>${escapeXml(p.status)}</pfif:status>
  </pfif:person>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<pfif:pfif xmlns:pfif="http://pfif.org/pfif/1.4">
${entries}
</pfif:pfif>`
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
