import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import './navigation.css'

const navigation = [
  { label: 'Dates', path: '/calendar' },
  { label: "Jaysha's Dictionary", path: '/dictionary' },
  { label: 'Ek tha majnu', path: '/romeo' },
  { label: 'Impressions', path: '/impressions' },
]

export function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const toggle = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  useEffect(() => { setOpen(false) }, [location.pathname, location.hash])
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    const content = document.getElementById('smooth-wrapper')
    const wasInert = content?.inert || false
    const smoother = ScrollSmoother.get()
    const wasPaused = smoother?.paused() || false
    document.body.style.overflow = 'hidden'
    if (content) content.inert = true
    smoother?.paused(true)
    closeButton.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false) }
      if (event.key === 'Tab') {
        const items = Array.from(panel.current?.querySelectorAll<HTMLElement>('button, a[href]') || [])
        const index = items.indexOf(document.activeElement as HTMLElement)
        event.preventDefault()
        items[(index + (event.shiftKey ? -1 : 1) + items.length) % items.length]?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      if (content) content.inert = wasInert
      smoother?.paused(wasPaused)
      document.removeEventListener('keydown', onKey)
      toggle.current?.focus({ preventScroll: true })
    }
  }, [open])
  return createPortal(<>
    <button ref={toggle} className="site-menu-toggle" type="button" aria-label="Open navigation menu" aria-expanded={open} aria-controls={open ? 'site-navigation' : undefined} aria-hidden={open || undefined} tabIndex={open ? -1 : 0} style={{ visibility: open ? 'hidden' : 'visible' }} onClick={() => setOpen(true)}><Menu size={23} strokeWidth={1.8} /></button>
    {open && <div className="site-menu-overlay"><div className="site-menu-backdrop" aria-hidden="true" onClick={() => setOpen(false)} /><aside ref={panel} id="site-navigation" className="site-menu-panel" role="dialog" aria-modal="true" aria-label="Site navigation"><header><span>OUR LITTLE WORLD</span><button ref={closeButton} type="button" aria-label="Close navigation menu" onClick={() => setOpen(false)}><X size={24} strokeWidth={1.8} /></button></header><p className="site-menu-eyebrow">Find your way</p><nav aria-label="Site pages">{navigation.map((item, index) => {
      const active = location.pathname === item.path || (item.path === '/calendar' && (location.pathname.startsWith('/calendar/') || location.pathname === '/dates')) || (item.path === '/romeo' && location.pathname === '/story')
      return <Link key={item.path} to={item.path} aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)}><span className="site-menu-number">{String(index + 1).padStart(2, '0')}</span><span>{item.label}</span><ArrowUpRight size={17} /></Link>
    })}</nav><footer>Made just for you. Always.</footer></aside></div>}
  </>, document.body)
}
