import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { LoginForm } from '@/components/auth/LoginForm'

export async function generateMetadata() {
  const t = await getTranslations('auth')
  return {
    title: t('loginTitleMeta'),
    description: t('loginSubtitle'),
  }
}

export default async function LoginPage() {
  const t = await getTranslations('auth')
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('loginTitle')}</h1>
      <p className="mt-2 text-sm text-vigil-muted">{t('loginSubtitle')}</p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-vigil-muted">{t('loading')}</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
