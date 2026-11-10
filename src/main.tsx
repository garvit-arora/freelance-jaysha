import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { CalendarPage, DatePage, NotFound, SectionPage } from './Calendar'
import { RomeoPage } from './Romeo'
import { ImpressionsPage } from './Impressions'
import { BeyondSection, SpecialAbilitiesSection, ThreatsSection } from './BeyondSection'
import { HamburgerMenu } from './HamburgerMenu'
import { ContactButton } from './ContactButton'
import { AboutHer } from './AboutHer'
import { FaqSection } from './FaqSection'
import { MagicButtonsPage } from './MagicButtons'
import { GirlfriendHelpdeskPage, ComplaintDepartmentPage, RequestDepartmentPage, DateBookingDepartmentPage } from './GirlfriendHelpdesk'
import { MusicButton } from './MusicButton'
import { useSession } from './lib/cloud'
import './refinements.css'
import SlideCommit from './SlideCommit'
import { DictionaryPage, LoginPage } from './PersonalPages'
const DatesMap = React.lazy(() => import('./DatesMap'))
import './style.css'
import './timeline.css'
import './site-background.css'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
const delay = (ms: number) => ({ animationDelay: `${ms}ms` })

function Intro() {
  const heading = 'Of all the things I want to give you in this life, I hope making you feel loved is the one I never stop doing'
  const revealEnd = 200 + heading.length * 125 + 1200
  const navigate = useNavigate()
  const navigateTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(navigateTimer.current), [])



  return (
    <section className="intro-screen site-texture" aria-label="Welcome">
      <div className="intro-copy">
        <h1 className="intro-heading intro-love-line" aria-label={heading}>
          {heading.split(' ').map((word, wordIndex, words) => {
            const offset = words.slice(0, wordIndex).join(' ').length + (wordIndex ? 1 : 0)
            return <React.Fragment key={wordIndex}><span className="intro-word" aria-hidden="true">{Array.from(word).map((character, i) => <span className="intro-letter" key={i} style={{ animationDelay: `${200 + (offset + i) * 125}ms` }}>{character}</span>)}</span>{wordIndex < words.length - 1 ? ' ' : ''}</React.Fragment>
          })}
        </h1>
        <div className="intro-step mt-8" style={delay(revealEnd)}>
          <SlideCommit
            label="Slide to Explore"
            doneLabel="Let’s explore"
            errorLabel="Please try again"
            onDone={() => { navigateTimer.current = setTimeout(() => navigate('/home'), 600) }}
            className="intro-slide"
            trackColor="#181816"
            handleColor="#efeee9"
            successColor="#efeee9"
            width={260}
            height={56}
            radius={28}
            holdMs={0}
          />
        </div>
      </div>
      <footer className="intro-footer intro-step" style={delay(revealEnd + 300)}>Made just for you</footer>
    </section>
  )
}

function RequireLogin({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession()
  const location = useLocation()
  if (loading) return <main className="world-page" role="status">Checking sign-in...</main>
  if (!session) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search + location.hash)}`} replace />
  return <>{children}</>
}

function App() {
  const location = useLocation()
  const previousPath = useRef(location.pathname)
  const exploring = location.pathname === '/home' || (location.pathname === '/' && location.hash === '#explore')
  useLayoutEffect(() => {
    if (location.pathname.startsWith('/girlfriend-helpdesk')) return
    if (['/impressions', '/romeo', '/story', '/dates', '/calendar', '/dictionary'].includes(location.pathname)) return
    const motion = gsap.matchMedia()
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      // The smoother must exist before any pinned ScrollTriggers.
      const smoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 2,
        effects: true,
        normalizeScroll: { allowNestedScroll: true },
      })
      if (exploring) {
        smoother.scrollTo(0, false)
      }
      return () => { smoother.kill(); ScrollTrigger.normalizeScroll(false) }
    })
    return () => motion.revert()
  }, [location.pathname, exploring])
  useLayoutEffect(() => {
    document.title = 'Jaysha Singyan'
    const returningToCalendar = location.pathname === '/calendar' && (location.hash === '#calendar-section' || /^\/calendar\/\d{2}-\d{2}-\d{4}$/.test(previousPath.current))
    previousPath.current = location.pathname
    const resetScroll = () => {
      if (returningToCalendar) document.getElementById('calendar-section')?.scrollIntoView({ block: 'start', behavior: 'instant' })
      else window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
    ScrollTrigger.refresh()
    resetScroll()
    // Run again after menu cleanup and ScrollSmoother release their old position.
    const frame = requestAnimationFrame(resetScroll)
    if (exploring) document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true })
    return () => cancelAnimationFrame(frame)
  }, [location.pathname, location.search, location.hash, exploring])
  return <>{exploring && <div className="explore-fixed-background" aria-hidden="true" />}<div id="smooth-wrapper"><div id="smooth-content"><Routes>
    <Route path="/" element={exploring ? <Navigate to="/home" replace /> : <Intro />} />
    <Route path="/home" element={<Hero />} />
    <Route path="/explore" element={<Navigate to="/home" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/magic-buttons" element={<MagicButtonsPage />} />
    <Route path="/girlfriend-helpdesk/date-booking" element={<DateBookingDepartmentPage />} />
    <Route path="/girlfriend-helpdesk/request" element={<RequestDepartmentPage />} />
    <Route path="/girlfriend-helpdesk/complaint" element={<ComplaintDepartmentPage />} />
    <Route path="/girlfriend-helpdesk" element={<GirlfriendHelpdeskPage />} />
    <Route path="/impressions" element={<ImpressionsPage />} />
    <Route path="/dictionary" element={<DictionaryPage />} />
    <Route path="/about" element={<SectionPage title="About" />} />
    <Route path="/story" element={<RequireLogin><RomeoPage /></RequireLogin>} />
    <Route path="/romeo" element={<RequireLogin><RomeoPage /></RequireLogin>} />
    <Route path="/calendar" element={<RequireLogin><CalendarPage /></RequireLogin>} />
    <Route path="/calendar/:date" element={<RequireLogin><DatePage /></RequireLogin>} />
    <Route path="/dates" element={<RequireLogin><React.Suspense fallback={<main className="world-page" role="status">Loading our map…</main>}><DatesMap /></React.Suspense></RequireLogin>} />
    <Route path="*" element={<NotFound />} />
  </Routes></div></div><HamburgerMenu /><MusicButton />{!['/', '/impressions', '/dates'].includes(location.pathname) && <ContactButton />}</>
}

function Hero() {

  return (
    <main tabIndex={-1} aria-label="Explore" className="explore-page site-texture font-hn text-cream outline-none">
    <section aria-label="Our world, a little closer" className="explore-photo-hero">
      <img src="/bg-post-timeline.jpeg" alt="Jaysha" className="explore-photo-image" fetchPriority="high" />
      <div className="explore-photo-shade" aria-hidden="true" />
      <div className="explore-photo-copy"><span className="hero-welcome-line">Ladies and Gentlemen, Welcome to</span><h1>The World of<br /><span className="hero-jaysha-name">Jaysha Singyan</span></h1><p className="hero-welcome-subtext">&quot;There's a lot more to her than meets the eye&quot;</p></div>
      <span className="explore-photo-hint">Scroll to explore &#8595;</span>
    </section>
    <AboutHer />
    <SpecialAbilitiesSection />
    <BeyondSection />
    <ThreatsSection />
    <FaqSection />



    </main>
  )
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>)
