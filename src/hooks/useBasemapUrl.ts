'use client'

import { useEffect, useState } from 'react'
import { BASEMAP_URL, isBasemapUrl } from '@/lib/basemap'

export function useBasemapUrl(tileUrl?: string): string {
  const [url, setUrl] = useState(tileUrl && isBasemapUrl(tileUrl) ? tileUrl : BASEMAP_URL)

  useEffect(() => {
    if (tileUrl && isBasemapUrl(tileUrl)) {
      setUrl(tileUrl)
      return
    }
    let cancelled = false
    fetch('/api/basemap')
      .then((r) => r.json())
      .then((data: { url?: unknown }) => {
        if (cancelled || typeof data.url !== 'string' || !isBasemapUrl(data.url)) return
        setUrl(data.url)
      })
      .catch(() => {
        /* keep unkeyed fallback */
      })
    return () => {
      cancelled = true
    }
  }, [tileUrl])

  return url
}
