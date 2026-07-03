'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { PropertyTagStatus } from '@/types/vigil.types'

interface PropertyAssessmentClaimClientProps {
  token: string
}

interface ClaimAssessment {
  estado: string | null
  municipio: string | null
  request_type: string
  tag_status: PropertyTagStatus
  status: string
  description: string | null
  created_at: string
  tag_assigned_at: string | null
  has_relocation_link: boolean
}

export function PropertyAssessmentClaimClient({ token }: PropertyAssessmentClaimClientProps) {
  const t = useTranslations('propertyAssessment.claim')
  const [assessment, setAssessment] = useState<ClaimAssessment | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/property-assessments/claim?token=${token}`)
      if (!res.ok) throw new Error()
      const json = (await res.json()) as { assessment: ClaimAssessment }
      setAssessment(json.assessment)
    } catch {
      setAssessment(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return <p className="p-8 text-center text-vigil-muted">{t('loading')}</p>
  }

  if (!assessment) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <p className="text-vigil-muted">{t('notFound')}</p>
        <Link href="/evaluacion-estructural" className="mt-4 inline-block text-vigil-blue">
          {t('back')}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg p-4 pb-24">
      <h1 className="font-display text-[24px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-2 text-[16px] text-vigil-muted">
        {assessment.estado}
        {assessment.municipio ? `, ${assessment.municipio}` : ''}
      </p>

      <div className="mt-6 rounded-card border border-slate-200 bg-white p-4">
        <p className="text-[13px] font-medium text-vigil-muted">{t('status')}</p>
        <p className="mt-1 text-[18px] font-semibold">{t(`tagStatus.${assessment.tag_status}`)}</p>
        <p className="mt-1 text-[14px] text-vigil-muted">{t(`workflow.${assessment.status}`)}</p>
      </div>

      {assessment.description && (
        <p className="mt-4 text-[16px] text-vigil-body">{assessment.description}</p>
      )}

      {assessment.has_relocation_link && (
        <p className="mt-4 rounded-card border border-vigil-blue/30 bg-vigil-blue-light p-4 text-[15px]">
          {t('relocationLinked')}{' '}
          <Link href="/intercambio" className="font-medium text-vigil-blue hover:underline">
            {t('relocationLink')}
          </Link>
        </p>
      )}

      <p className="mt-6 text-[14px] text-vigil-muted">{t('privacyNote')}</p>
    </div>
  )
}
