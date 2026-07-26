'use client'

import { useCallback, useState } from 'react'
import { CrisisMap } from '@/components/map/CrisisMap'
import { MapAccessibleList } from '@/components/map/MapAccessibleList'
import type { MapMarker, SeismicEvent, PublicPropertyAssessment, PublicMissingPerson } from '@/types/vigil.types'

interface HomeMapSectionProps {
  events: SeismicEvent[]
  markers: MapMarker[]
  propertyAssessments: PublicPropertyAssessment[]
  missingPersons: PublicMissingPerson[]
}

export function HomeMapSection({
  events,
  markers,
  propertyAssessments,
  missingPersons,
}: HomeMapSectionProps) {
  const [focused, setFocused] = useState<MapMarker | null>(null)

  const onFocusMarker = useCallback((marker: MapMarker) => {
    setFocused(marker)
  }, [])

  return (
    <>
      <div className="min-h-[min(50vh,400px)] flex-1">
        <CrisisMap
          events={events}
          markers={markers}
          propertyAssessments={propertyAssessments}
          missingPersons={missingPersons}
          focusLat={focused?.lat ?? null}
          focusLng={focused?.lng ?? null}
        />
      </div>
      <MapAccessibleList
        markers={markers}
        events={events}
        focusedMarkerId={focused?.id ?? null}
        onFocusMarker={onFocusMarker}
      />
    </>
  )
}
