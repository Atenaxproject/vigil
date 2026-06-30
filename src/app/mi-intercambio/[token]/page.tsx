import { ExchangeClaimClient } from '@/components/claim/ExchangeClaimClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function MiIntercambioPage({ params }: PageProps) {
  const { token } = await params
  return <ExchangeClaimClient token={token} />
}
