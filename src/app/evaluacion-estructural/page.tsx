import { PropertyAssessmentForm } from '@/components/property/PropertyAssessmentForm'
import { getPropertyAssessmentStats } from '@/lib/data'

export const metadata = {
  title: 'Evaluación de Seguridad Estructural — Vigil',
  description:
    'Solicita una evaluación voluntaria de seguridad estructural de tu vivienda tras el terremoto en Venezuela.',
}

export const dynamic = 'force-dynamic'

export default async function EvaluacionEstructuralPage() {
  const stats = await getPropertyAssessmentStats()
  return <PropertyAssessmentForm stats={stats} />
}
