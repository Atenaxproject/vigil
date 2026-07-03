import { PropertyAssessmentClaimClient } from '@/components/claim/PropertyAssessmentClaimClient'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function MiEvaluacionPage({ params }: PageProps) {
  const { token } = await params
  return <PropertyAssessmentClaimClient token={token} />
}
