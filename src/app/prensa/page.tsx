import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PressKit } from '@/components/prensa/PressKit'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('press')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default function PrensaPage() {
  return <PressKit />
}
