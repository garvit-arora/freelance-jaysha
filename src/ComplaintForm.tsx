import { useEffect, useRef, useState } from 'react'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { HelpdeskDropdown } from './HelpdeskDropdown'
import { HelpdeskEmailStatus } from './HelpdeskEmailStatus'
import { submitHelpdesk } from './lib/helpdesk'

const categories = ["Attention & Affection", "Communication Issues", "Boyfriend Behaviour", "Date Night Negligence", "Emotional Support", "Memory & Forgetfulness", "Romance Deficiency", "Time Management", "Teasing & Arguments", "Reassurance & Insecurities", "Food & Snack Related Crimes", "Other Serious Allegations"]
const severities = ['Minor inconvenience', 'Boyfriend needs to fix this immediately', 'Unacceptable. I want to see the manager.']
const emptyDraft = { category: '', incident: '', severity: '' }
const draftKey = 'helpdesk-complaint-draft'
function initialDraft() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(draftKey) || 'null')
    if (stored && Object.values(stored).every(value => typeof value === 'string')) return { ...emptyDraft, ...stored, category: categories.includes(stored.category) ? stored.category : '' }
  } catch { /* A draft is optional. */ }
  return emptyDraft
}

export function ComplaintForm() {
  const [draft, setDraft] = useState(initialDraft)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submittedId, setSubmittedId] = useState('')
  const [receipt, setReceipt] = useState('')
  const submitting = useRef(false)
  const confirmation = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (!success || !confirmation.current) return
    const modal = confirmation.current
    const focused = document.activeElement as HTMLElement | null
    const smoother = ScrollSmoother.get()
    const paused = smoother?.paused() ?? false
    const overflow = document.body.style.overflow
    modal.showModal()
    smoother?.paused(true)
    document.body.style.overflow = 'hidden'
    return () => {
      modal.close()
      smoother?.paused(paused)
      document.body.style.overflow = overflow
      focused?.focus({ preventScroll: true })
    }
  }, [success])
  useEffect(() => { try { sessionStorage.setItem(draftKey, JSON.stringify(draft)) } catch { /* Keep the form usable without storage. */ } }, [draft])
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    setError(''); setSuccess(false)
    if (!categories.includes(draft.category)) { setError('Please select a category.'); return }
    if (!draft.incident.trim()) { setError('Please describe the incident.'); return }
    submitting.current = true; setBusy(true)
    try {
      const data = await submitHelpdesk('complaint', { category: draft.category, incident: draft.incident.trim(), severity: draft.severity })
      setReceipt(data.receipt)
      setSubmittedId(data.id); setDraft(emptyDraft); setSuccess(true)
    } catch { setError('Your complaint could not be saved. Please try again. Your draft is still here.') }
    finally { submitting.current = false; setBusy(false) }
  }
  return <section id="complaint-department" className="helpdesk-form-section" aria-labelledby="complaint-form-title">
    <p className="helpdesk-form-intro">We're sorry your boyfriend has been behaving like this. Please describe the incident below. Your complaint will be reviewed by the only employee, who is also the accused.</p>
    <form className="helpdesk-form" onSubmit={submit} aria-busy={busy}>
      <h2 id="complaint-form-title">File a complaint</h2>
      <label htmlFor="complaint-category">What is the complaint about?</label>
      <HelpdeskDropdown id="complaint-category" options={categories} value={draft.category} disabled={busy} placeholder="Select a category" onChange={category => setDraft({ ...draft, category })} />
      <label htmlFor="complaint-incident">Describe the incident</label>
      <textarea id="complaint-incident" required maxLength={5000} rows={5} placeholder="Tell management exactly what happened..." value={draft.incident} disabled={busy} onChange={event => setDraft({ ...draft, incident: event.target.value })} />
      <fieldset disabled={busy}><legend>How serious is this matter?</legend><div className="helpdesk-severity-options">{severities.map(severity => <label key={severity} className="helpdesk-radio"><input type="radio" name="complaint-severity" value={severity} required checked={draft.severity === severity} onChange={() => setDraft({ ...draft, severity })} /><span>{severity}</span></label>)}</div></fieldset>
      {error && <p className="helpdesk-form-error" role="alert">{error}</p>}
      <button type="submit" disabled={busy}>{busy ? 'Submitting complaint...' : 'Submit complaint to management'}</button>
    </form>
    <dialog ref={confirmation} className="helpdesk-confirmation" aria-labelledby="complaint-confirmation-message" onCancel={() => setSuccess(false)} onClose={() => setSuccess(false)} onClick={event => { if (event.target === event.currentTarget) setSuccess(false) }}>
      <p id="complaint-confirmation-message">&quot;Your complaint has been successfully escalated to the boyfriend. He has been instructed to stop being an idiot and attend to your concerns immediately.&quot;</p>
      {success && <HelpdeskEmailStatus kind="complaint" submissionId={submittedId} receipt={receipt} />}
      <button type="button" autoFocus onClick={() => setSuccess(false)}>Close</button>
    </dialog>
  </section>
}
