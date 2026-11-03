import { Link } from 'react-router-dom'
import { useSession } from './lib/cloud'
import { useEffect, useRef, useState } from 'react'
import { CalendarPicker } from './CalendarPicker'
import { format, parseISO } from 'date-fns'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { HelpdeskDropdown } from './HelpdeskDropdown'
import { HelpdeskEmailStatus } from './HelpdeskEmailStatus'
import { submitHelpdesk } from './lib/helpdesk'

const experiences = ["Fine Dining Date", "Caf\u00e9 Date", "Movie Date", "Adventure Date", "Shopping Date", "Romantic Getaway", "Outdoor Date", "Activity Date", "Night Out", "At-Home Date", "Surprise Date", "Quality Time Date"]
const emptyDraft = { preferredDate: '', experience: '', details: '' }
const draftKey = 'helpdesk-date-booking-draft'
function initialDraft() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(draftKey) || 'null')
    if (stored && Object.values(stored).every(value => typeof value === 'string')) return { ...emptyDraft, ...stored, experience: experiences.includes(stored.experience) ? stored.experience : '' }
  } catch { /* A draft is optional. */ }
  return emptyDraft
}

export function DateBookingForm() {
  const { session, loading } = useSession()
  const [draft, setDraft] = useState(initialDraft)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submittedId, setSubmittedId] = useState('')
  const [receipt, setReceipt] = useState('')
  const submitting = useRef(false)
  const confirmation = useRef<HTMLDialogElement>(null)
  const today = format(new Date(), 'yyyy-MM-dd')
  useEffect(() => { try { sessionStorage.setItem(draftKey, JSON.stringify(draft)) } catch { /* Keep the form usable without storage. */ } }, [draft])
  useEffect(() => {
    if (!success || !confirmation.current) return
    const modal = confirmation.current
    const focused = document.activeElement as HTMLElement | null
    const smoother = ScrollSmoother.get()
    const paused = smoother?.paused() ?? false
    const overflow = document.body.style.overflow
    modal.showModal(); smoother?.paused(true); document.body.style.overflow = 'hidden'
    return () => { modal.close(); smoother?.paused(paused); document.body.style.overflow = overflow; focused?.focus({ preventScroll: true }) }
  }, [success])
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current || loading || !session) return
    setError(''); setSuccess(false)
    if (!draft.preferredDate || draft.preferredDate < today || !experiences.includes(draft.experience)) { setError('Choose a preferred date and date experience.'); return }
    submitting.current = true; setBusy(true)
    try {
      const data = await submitHelpdesk('date-booking', { preferred_date: draft.preferredDate, experience: draft.experience, details: draft.details.trim() })
      setReceipt(data.receipt)
      setSubmittedId(data.id); setDraft(emptyDraft); setSuccess(true)
    } catch { setError('Your date request could not be saved. Please try again. Your draft is still here.') }
    finally { submitting.current = false; setBusy(false) }
  }
  return <section className="helpdesk-form-section" aria-labelledby="date-booking-title">
    <p className="helpdesk-form-intro">Select your preferred date, choose the kind of date you'd like, and leave the rest to me.</p>
    <form className="helpdesk-form helpdesk-date-form" onSubmit={submit} aria-busy={busy}>
      <h2 id="date-booking-title">The Date Booking Department</h2>
      <label htmlFor="booking-date">When would you like to go?</label>
      <CalendarPicker id="booking-date" value={draft.preferredDate ? parseISO(draft.preferredDate) : undefined} minDate={new Date()} disabled={busy} placeholder="Choose your preferred date" onChange={date => setDraft({ ...draft, preferredDate: format(date, 'yyyy-MM-dd') })} />
      <label htmlFor="booking-experience">What kind of date are you in the mood for?</label>
      <HelpdeskDropdown id="booking-experience" options={experiences} value={draft.experience} disabled={busy} placeholder="Choose your date experience" onChange={experience => setDraft({ ...draft, experience })} />
      <label htmlFor="booking-details">Anything else you'd like?</label>
      <textarea id="booking-details" rows={3} maxLength={2000} disabled={busy} placeholder="Your preferred place, time, outfit, or anything else..." value={draft.details} onChange={event => setDraft({ ...draft, details: event.target.value })} />
      {error && <p className="helpdesk-form-error" role="alert">{error}</p>}
      {session ? <button type="submit" disabled={busy}>{busy ? 'Requesting your date...' : 'Request my date'}</button> : <p className="helpdesk-sign-in"><Link to={`/login?next=${encodeURIComponent(window.location.pathname)}`}>Sign in to submit</Link></p>}
    </form>
    <dialog ref={confirmation} className="helpdesk-confirmation" aria-labelledby="booking-confirmation" onCancel={() => setSuccess(false)} onClose={() => setSuccess(false)} onClick={event => { if (event.target === event.currentTarget) setSuccess(false) }}>
      <p id="booking-confirmation">&quot;Your date request has been sent to your personal date planner. Please allow 24 hours for your boyfriend to prepare an unnecessarily elaborate response&quot;.</p>{success && <HelpdeskEmailStatus kind="date-booking" submissionId={submittedId} receipt={receipt} />}<button type="button" autoFocus onClick={() => setSuccess(false)}>Close</button>
    </dialog>
  </section>
}
