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
import { MusicButton } from './MusicButton'
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
  const revealEnd = 200 + heading.length * 100 + 1200
  const navigate = useNavigate()
  const navigateTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(navigateTimer.current), [])



  return (
    <section className="intro-screen site-texture" aria-label="Welcome">
      <div className="intro-copy">
        <h1 className="intro-heading intro-love-line" aria-label={heading}>
          {heading.split(' ').map((word, wordIndex, words) => {
            const offset = words.slice(0, wordIndex).join(' ').length + (wordIndex ? 1 : 0)
            return <React.Fragment key={wordIndex}><span className="intro-word" aria-hidden="true">{Array.from(word).map((character, i) => <span className="intro-letter" key={i} style={{ animationDelay: `${200 + (offset + i) * 100}ms` }}>{character}</span>)}</span>{wordIndex < words.length - 1 ? ' ' : ''}</React.Fragment>
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

function App() {
  const location = useLocation()
  const exploring = location.pathname === '/home' || (location.pathname === '/' && location.hash === '#explore')
  useLayoutEffect(() => {
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
  useEffect(() => {
    document.title = 'Jaysha singh'
    window.scrollTo(0, 0)
    if (exploring) document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true })
    ScrollTrigger.refresh()
  }, [location.pathname, exploring])
  return <>{exploring && <div className="explore-fixed-background" aria-hidden="true" />}<div id="smooth-wrapper"><div id="smooth-content"><Routes>
    <Route path="/" element={exploring ? <Navigate to="/home" replace /> : <Intro />} />
    <Route path="/home" element={<Hero />} />
    <Route path="/explore" element={<Navigate to="/home" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/magic-buttons" element={<MagicButtonsPage />} />
    <Route path="/impressions" element={<ImpressionsPage />} />
    <Route path="/dictionary" element={<DictionaryPage />} />
    <Route path="/about" element={<SectionPage title="About" />} />
    <Route path="/story" element={<RomeoPage />} />
    <Route path="/romeo" element={<RomeoPage />} />
    <Route path="/calendar" element={<CalendarPage />} />
    <Route path="/calendar/:date" element={<DatePage />} />
    <Route path="/dates" element={<React.Suspense fallback={<main className="world-page" role="status">Loading our map…</main>}><DatesMap /></React.Suspense>} />
    <Route path="*" element={<NotFound />} />
  </Routes></div></div><HamburgerMenu /><MusicButton />{!['/impressions', '/dates'].includes(location.pathname) && <ContactButton />}</>
}

function Hero() {

  return (
    <main tabIndex={-1} aria-label="Explore" className="explore-page site-texture font-hn text-cream outline-none">
    <section aria-label="Our world, a little closer" className="explore-photo-hero">
      <img src="/bg-post-timeline.jpeg" alt="Jaysha" className="explore-photo-image" fetchPriority="high" />
      <div className="explore-photo-shade" aria-hidden="true" />
      <div className="explore-photo-copy"><span className="hero-welcome-line">LADIES AND GENTEMAN, WELCOME TO</span><h1>THE WORLD OF JAYSHA SINGYAN.</h1><p className="hero-welcome-subtext">&quot;There's a lot more to her than meets the eye&quot;</p></div>
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
