import { useEffect } from 'react'
import { cloud } from './lib/cloud'
export function HelpdeskEmailStatus({ kind, submissionId, receipt }: { kind: 'complaint' | 'request' | 'date-booking'; submissionId: string; receipt?: string }) {
  useEffect(() => {
    if (!submissionId) return
    // Forward in the background; confirmation dialogs show only their supplied copy.
    void cloud?.functions.invoke('helpdesk-email',{ body:{ kind,submissionId,receipt } }).catch(() => {})
  },[kind,submissionId,receipt])
  return null
}
