import { ClaimManageClient } from '@/components/claim/ClaimManageClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function MiReportePage({ params }: PageProps) {
  const { token } = await params
  return <ClaimManageClient token={token} />
}
