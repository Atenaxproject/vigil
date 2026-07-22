import { ConnectivityForm } from '@/components/comms/ConnectivityForm'
import { getTranslations } from 'next-intl/server'

export default async function ConectividadPage() {
  const t = await getTranslations('crisisInfo')

  return (
    <div>
      <div className="mx-auto max-w-2xl px-4 pt-6">
        <div className="rounded-card border border-slate-200 bg-vigil-cloud p-4">
          <p className="text-[16px] text-vigil-body">{t('telecomFreeCalls')}</p>
          <p className="mt-2 font-mono text-[13px] text-vigil-muted">{t('telecomFreeCallsSource')}</p>
        </div>
      </div>
      <ConnectivityForm />
    </div>
  )
}
