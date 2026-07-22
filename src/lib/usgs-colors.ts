/** Client-safe USGS map helpers — keep free of next/headers / server imports. */

export function getMagnitudeColor(mag: number): string {
  if (mag < 2.5) return '#22c55e'
  if (mag < 4.0) return '#f59e0b'
  if (mag < 5.5) return '#f97316'
  if (mag < 7.0) return '#ef4444'
  return '#7c3aed'
}
