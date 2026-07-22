/**
 * Contested figures policy types (prompt 71).
 * Extends SourcedFigure — contested figures MUST render with disputes.
 */

export interface FigureDispute {
  party: string
  claim: string
  source_url: string
  dated: string
}

export interface ContestedFigure {
  key: string
  label: string
  value: string | number
  source: string
  source_url?: string | null
  verified_at: string
  is_official: boolean
  is_contested: true
  disputes: FigureDispute[]
  independent_alternatives?: Array<{
    label: string
    value: string | number
    source: string
    source_url?: string | null
    verified_at: string
  }>
}

export function assertContestedHasDisputes(
  figure: { is_contested?: boolean; disputes?: FigureDispute[] }
): boolean {
  if (!figure.is_contested) return true
  return Array.isArray(figure.disputes) && figure.disputes.length > 0
}
