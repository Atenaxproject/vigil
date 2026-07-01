import { RedNetworkClient } from '@/components/red/RedNetworkClient'

export const metadata = {
  title: 'Red de búsqueda — Vigil',
  description:
    'Plataformas hermanas de búsqueda de personas desaparecidas en la crisis del terremoto en Venezuela.',
}

export default function RedPage() {
  return <RedNetworkClient />
}
