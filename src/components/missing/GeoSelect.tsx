'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  VENEZUELA_ESTADOS,
  getMunicipiosForEstado,
  getParroquiasForMunicipio,
} from '@/lib/venezuela-geo'

interface GeoSelectProps {
  estado: string
  municipio: string
  parroquia: string
  onEstadoChange: (value: string) => void
  onMunicipioChange: (value: string) => void
  onParroquiaChange: (value: string) => void
  estadoError?: boolean
}

export function GeoSelect({
  estado,
  municipio,
  parroquia,
  onEstadoChange,
  onMunicipioChange,
  onParroquiaChange,
  estadoError,
}: GeoSelectProps) {
  const t = useTranslations('missing.form.geo')
  const [municipios, setMunicipios] = useState<string[]>([])
  const [parroquias, setParroquias] = useState<string[]>([])

  useEffect(() => {
    if (estado) {
      setMunicipios(getMunicipiosForEstado(estado))
    } else {
      setMunicipios([])
    }
  }, [estado])

  useEffect(() => {
    if (estado && municipio) {
      setParroquias(getParroquiasForMunicipio(estado, municipio))
    } else {
      setParroquias([])
    }
  }, [estado, municipio])

  const selectClass =
    'mt-1 w-full min-h-[44px] rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-vigil-blue/20'
  const labelClass = 'block text-[13px] font-medium text-slate-600'

  return (
    <div className="space-y-4 rounded-input border border-slate-200 bg-vigil-cloud/50 p-4">
      <p className="text-[13px] font-medium text-vigil-ink">{t('sectionTitle')}</p>

      <div>
        <label htmlFor="estado" className={labelClass}>
          {t('estado')} *
        </label>
        <select
          id="estado"
          value={estado}
          onChange={(e) => {
            onEstadoChange(e.target.value)
            onMunicipioChange('')
            onParroquiaChange('')
          }}
          className={selectClass}
          aria-required="true"
          aria-invalid={estadoError}
        >
          <option value="">{t('selectEstado')}</option>
          {VENEZUELA_ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="municipio" className={labelClass}>
          {t('municipio')}
        </label>
        <select
          id="municipio"
          value={municipio}
          onChange={(e) => {
            onMunicipioChange(e.target.value)
            onParroquiaChange('')
          }}
          disabled={!estado || municipios.length === 0}
          className={selectClass}
        >
          <option value="">{t('selectMunicipio')}</option>
          {municipios.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {parroquias.length > 0 && (
        <div>
          <label htmlFor="parroquia" className={labelClass}>
            {t('parroquia')}
          </label>
          <select
            id="parroquia"
            value={parroquia}
            onChange={(e) => onParroquiaChange(e.target.value)}
            className={selectClass}
          >
            <option value="">{t('selectParroquia')}</option>
            {parroquias.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
