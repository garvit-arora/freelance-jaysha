// Approval applies only to submissions created after this instant; never backfill.
export const EMAIL_ENABLED_FROM = '2026-11-03T13:49:16Z'
export function canSendSubmission(createdAt) {
  const created = Date.parse(createdAt)
  return Number.isFinite(created) && created >= Date.parse(EMAIL_ENABLED_FROM)
}
