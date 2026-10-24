import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { gsap } from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import { X } from 'lucide-react'
import './contact.css'

gsap.registerPlugin(TextPlugin)

export function ContactButton() {
  const [open, setOpen] = useState(false)
  const [contacting, setContacting] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const running = useRef(false)
  const location = useLocation()

  useEffect(() => {
    timeline.current?.kill()
    running.current = false
    setContacting(false)
    setOpen(false)
    if (label.current) label.current.textContent = 'Contact'
    return () => { timeline.current?.kill(); running.current = false }
  }, [location.pathname])
  const contact = () => {
    if (running.current || open || !label.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setOpen(true); return }
    running.current = true
    setContacting(true)
    timeline.current?.kill()
    timeline.current = gsap.timeline({ onComplete: () => {
      running.current = false
      setContacting(false)
      setOpen(true)
    } })
      .to(label.current, { duration: 1, text: { value: 'Contacting...', type: 'diff' }, ease: 'sine.in' })
      .to(label.current, { duration: .6, text: { value: 'Contacting', type: 'diff' }, ease: 'sine.inOut', repeat: 4, yoyo: true })
      .to({}, { duration: .5 })
  }
  useEffect(() => {
    if (!open) {
      if (!running.current && label.current) label.current.textContent = 'Contact'
      return
    }
    if (!dialog.current) return
    const modal = dialog.current
    const smoother = ScrollSmoother.get()
    const wasPaused = smoother?.paused() ?? false
    const previousOverflow = document.body.style.overflow
    modal.showModal()
    smoother?.paused(true)
    document.body.style.overflow = 'hidden'
    return () => {
      modal.close()
      document.body.style.overflow = previousOverflow
      smoother?.paused(wasPaused)
      button.current?.focus({ preventScroll: true })
    }
  }, [open])

  return createPortal(<>
    <button ref={button} type="button" className="contact-button" aria-label={contacting ? 'Contacting Jayasha' : 'Contact Jayasha'} aria-busy={contacting} aria-disabled={contacting} aria-haspopup="dialog" aria-controls="contact-dialog" onClick={contact}><span ref={label} aria-hidden="true">Contact</span><span aria-hidden="true">↗</span></button>
    <span className="sr-only" role="status">{contacting ? 'Contacting Jayasha…' : ''}</span>
    <dialog ref={dialog} id="contact-dialog" className="contact-dialog" aria-label="Contact Jayasha" onCancel={() => setOpen(false)} onClose={() => setOpen(false)} onKeyDown={event => event.stopPropagation()} onClick={event => { if (event.target === event.currentTarget) setOpen(false) }}>
      <div className="contact-image-wrap">
        <button type="button" className="contact-close" aria-label="Close contact" onClick={() => setOpen(false)} autoFocus><X size={24} strokeWidth={1.5} /></button>
        <img src="/anveshan/contact.jpeg" alt="Contact Jayasha" className="contact-image" decoding="async" />
      </div>
    </dialog>
  </>, document.body)
}
