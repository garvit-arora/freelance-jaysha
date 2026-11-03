import { useEffect, useRef, useState } from 'react'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { HelpdeskDropdown } from './HelpdeskDropdown'
import { HelpdeskEmailStatus } from './HelpdeskEmailStatus'
import { submitHelpdesk } from './lib/helpdesk'

const categories = ["Attention & Affection", "Emotional Support", "Quality Time", "Date Night Requests", "Romantic Gestures", "Gifts & Treats", "Communication & Connection", "Personal Favour", "Special Occasions", "Adventures & Experiences", "Surprise Me", "Other Requests"]
const urgencies = ["As soon as possible", "Whenever you\u2019re free", "Just putting it out there"]
const emptyDraft = { category: '', description: '', urgency: '' }
const draftKey = 'helpdesk-request-draft'
function initialDraft() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(draftKey) || 'null')
    if (stored && Object.values(stored).every(value => typeof value === 'string')) return { ...emptyDraft, ...stored, category: categories.includes(stored.category) ? stored.category : '' }
  } catch { /* A draft is optional. */ }
  return emptyDraft
}

export function RequestForm() {
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
    if (!draft.description.trim()) { setError('Please describe your request.'); return }
    submitting.current = true; setBusy(true)
    try {
      const data = await submitHelpdesk('request', { category: draft.category, description: draft.description.trim(), urgency: draft.urgency })
      setReceipt(data.receipt)
      setSubmittedId(data.id); setDraft(emptyDraft); setSuccess(true)
    } catch { setError('Your request could not be saved. Please try again. Your draft is still here.') }
    finally { submitting.current = false; setBusy(false) }
  }
  return <section id="request-department" className="helpdesk-form-section" aria-labelledby="request-form-title">
    <p className="helpdesk-form-intro">Anything you've been wanting, something you've been meaning to tell me, or something you wish I'd do more often. This is your space.</p>
    <form className="helpdesk-form" onSubmit={submit} aria-busy={busy}>
      <h2 id="request-form-title">Make a request</h2>
      <label htmlFor="request-category">Select category</label>
      <HelpdeskDropdown id="request-category" options={categories} value={draft.category} disabled={busy} placeholder="Select a category" onChange={category => setDraft({ ...draft, category })} />
      <label htmlFor="request-description">Describe your request</label>
      <textarea id="request-description" required maxLength={5000} rows={5} placeholder="Tell your boyfriend what you have in mind..." value={draft.description} disabled={busy} onChange={event => setDraft({ ...draft, description: event.target.value })} />
      <fieldset disabled={busy}><legend>How soon should your boyfriend attend to this?</legend><div className="helpdesk-severity-options">{urgencies.map(urgency => <label key={urgency} className="helpdesk-radio"><input type="radio" name="request-urgency" value={urgency} required checked={draft.urgency === urgency} onChange={() => setDraft({ ...draft, urgency })} /><span>{urgency}</span></label>)}</div></fieldset>
      {error && <p className="helpdesk-form-error" role="alert">{error}</p>}
      <button type="submit" disabled={busy}>{busy ? 'Submitting request...' : 'Submit request'}</button>
    </form>
    <dialog ref={confirmation} className="helpdesk-confirmation" aria-labelledby="request-confirmation-message" onCancel={() => setSuccess(false)} onClose={() => setSuccess(false)} onClick={event => { if (event.target === event.currentTarget) setSuccess(false) }}>
      <p id="request-confirmation-message">Your request has been received. Your boyfriend has been notified and is currently considering how to make you the happiest girl in the world.</p>
      {success && <HelpdeskEmailStatus kind="request" submissionId={submittedId} receipt={receipt} />}
      <button type="button" autoFocus onClick={() => setSuccess(false)}>Close</button>
    </dialog>
  </section>
}
