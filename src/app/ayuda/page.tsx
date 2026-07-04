import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { HelpCenter } from '@/components/help/HelpCenter'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('helpCenter')
  return {
    title: t('metaTitle'),
    description: t('subtitle'),
  }
}

export default function AyudaPage() {
  return <HelpCenter />
}
