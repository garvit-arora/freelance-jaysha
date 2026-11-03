import { useEffect, useState } from 'react'
import { cloud } from './lib/cloud'
export function HelpdeskEmailStatus({ kind, submissionId, receipt }: { kind: 'complaint' | 'request' | 'date-booking'; submissionId: string; receipt?: string }) {
  const [status,setStatus] = useState<'sending' | 'sent' | 'pending'>('sending')
  const [retry,setRetry] = useState(0)
  useEffect(() => {
    if (!submissionId) return
    let live = true
    setStatus('sending')
    cloud?.functions.invoke('helpdesk-email',{ body:{ kind,submissionId,receipt } }).then(({ data,error }) => { if (live) setStatus(!error && data?.sent ? 'sent' : 'pending') }).catch(() => { if (live) setStatus('pending') })
    if (!cloud) setStatus('pending')
    return () => { live = false }
  },[kind,submissionId,receipt,retry])
  if (!submissionId) return null
  return <div className="helpdesk-email-status" role="status">{status === 'sending' ? 'Sending email confirmation...' : status === 'sent' ? 'Email confirmation submitted for both recipients.' : <>Your form was saved. Email confirmation is pending. <button type="button" onClick={() => setRetry(value => value + 1)}>Retry email</button></>}</div>
}
