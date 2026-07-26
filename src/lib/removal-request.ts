/** Marker so admin triage can sort these ahead of general feedback without a schema change. */
export const REMOVAL_REQUEST_MARKER = '[removal_request]'

export function isRemovalRequestMessage(message: string): boolean {
  return message.startsWith(REMOVAL_REQUEST_MARKER) || message.includes(REMOVAL_REQUEST_MARKER)
}
