'use client'

import { useId, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { MapMarker, SeismicEvent } from '@/types/vigil.types'
interface MapAccessibleListProps {
  markers: MapMarker[]
  events?: SeismicEvent[]
}

export function MapAccessibleList({ markers, events = [] }: MapAccessibleListProps) {
  const t = useTranslations('map')
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)

  const needs = markers.filter((m) => m.type === 'need' && m.status === 'active')
  const comms = markers.filter(
    (m) => m.type === 'resource' && m.category === 'comms' && m.status === 'active'
  )
  const resources = markers.filter(
    (m) => m.type === 'resource' && m.category !== 'comms' && m.status === 'active'
  )
  const collection = markers.filter((m) => m.type === 'collection_point' && m.status === 'active')
  const significantEvents = events.filter((e) => (e.magnitude ?? 0) >= 4)

  const hasContent =
    needs.length > 0 ||
    resources.length > 0 ||
    comms.length > 0 ||
    collection.length > 0 ||
    significantEvents.length > 0

  return (
    <section
      aria-label={t('listHeading')}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          setOpen(false)
          toggleRef.current?.focus()
        }
      }}
      // relative z-10 keeps the toggle above the Leaflet map: the map wrapper is a
      // positioned (z-index:0) layer, which would otherwise paint over this static
      // section and intercept the close click when the open panel overlaps the map.
      className="relative z-10 rounded-card border border-slate-200 bg-white"
    >
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-[44px] w-full items-center justify-between gap-2 px-4 py-2 text-left text-[16px] font-medium text-vigil-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
      >
        <span>{open ? t('hideList') : t('viewAsList')}</span>
        {open ? <ChevronUp className="h-4 w-4 shrink-0" aria-hidden /> : <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />}
      </button>

      {open && (
        <div id={panelId} className="border-t border-slate-200 px-4 py-3 text-[16px] text-slate-700">
          {!hasContent && <p className="text-vigil-muted">{t('listEmpty')}</p>}

          {significantEvents.length > 0 && (
            <div className="mb-4">
              <h3 className="text-[17px] font-medium text-vigil-ink">{t('layers.aftershocks')}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {significantEvents.slice(0, 10).map((event) => (
                  <li key={event.id}>
                    <span className="font-mono text-[13px] text-vigil-muted">[{event.source}]</span>{' '}
                    {t('magnitude')} {event.magnitude?.toFixed(1)} — {event.place}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {needs.length > 0 && (
            <div className="mb-4">
              <h3 className="text-[17px] font-medium text-vigil-ink">{t('layers.needs')}</h3>
              <ul className="mt-2 space-y-2">
                {needs.slice(0, 15).map((marker) => (
                  <li key={marker.id} className="rounded-input border border-slate-200 px-3 py-2">
                    <span className="font-medium">{marker.title}</span>
                    {marker.description && <p className="mt-1 text-[13px] text-vigil-muted">{marker.description}</p>}
                    <p className="mt-1 font-mono text-[13px] text-vigil-muted">
                      {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {comms.length > 0 && (
            <div className="mb-4">
              <h3 className="text-[17px] font-medium text-vigil-ink">{t('layers.comms')}</h3>
              <ul className="mt-2 space-y-2">
                {comms.slice(0, 15).map((marker) => (
                  <li key={marker.id} className="rounded-input border border-amber-200 bg-amber-50/30 px-3 py-2">
                    <span className="font-medium">{marker.title}</span>
                    {marker.description && <p className="mt-1 text-[13px] text-vigil-muted">{marker.description}</p>}
                    <p className="mt-1 font-mono text-[13px] text-vigil-muted">
                      {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resources.length > 0 && (
            <div className="mb-4">
              <h3 className="text-[17px] font-medium text-vigil-ink">{t('layers.resources')}</h3>
              <ul className="mt-2 space-y-2">
                {resources.slice(0, 15).map((marker) => (
                  <li key={marker.id} className="rounded-input border border-slate-200 px-3 py-2">
                    <span className="font-medium">{marker.title}</span>
                    {marker.description && <p className="mt-1 text-[13px] text-vigil-muted">{marker.description}</p>}
                    <p className="mt-1 font-mono text-[13px] text-vigil-muted">
                      {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {collection.length > 0 && (
            <div>
              <h3 className="text-[17px] font-medium text-vigil-ink">{t('layers.collection')}</h3>
              <ul className="mt-2 space-y-2">
                {collection.slice(0, 15).map((marker) => (
                  <li key={marker.id} className="rounded-input border border-slate-200 px-3 py-2">
                    <span className="font-medium">{marker.title}</span>
                    {marker.description && <p className="mt-1 text-[13px] text-vigil-muted">{marker.description}</p>}
                    <p className="mt-1 font-mono text-[13px] text-vigil-muted">
                      {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
