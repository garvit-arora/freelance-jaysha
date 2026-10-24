import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { CalendarPage, DatePage, NotFound, SectionPage } from './Calendar'
import { RomeoPage } from './Romeo'
import { ImpressionsPage } from './Impressions'
import { BeyondSection, SpecialAbilitiesSection, ThreatsSection } from './BeyondSection'
import { HamburgerMenu } from './HamburgerMenu'
import ScrollExpand from './ScrollExpand'
import { ContactButton } from './ContactButton'
import SlideCommit from './SlideCommit'
import { DictionaryPage, LoginPage } from './PersonalPages'
const DatesMap = React.lazy(() => import('./DatesMap'))
import './style.css'
import './timeline.css'
import './site-background.css'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
const delay = (ms: number) => ({ animationDelay: `${ms}ms` })

function Intro() {
  const heading = 'Jaysha'
  const navigate = useNavigate()
  const navigateTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(navigateTimer.current), [])

  return (
    <section className="intro-screen site-texture" aria-label="Birthday welcome">
      <div className="intro-copy">
        <h1 className="intro-heading" aria-label={heading}>
          {Array.from(heading).map((character, i) => <span aria-hidden="true" key={i} style={{ animationDelay: `${200 + i * 45}ms` }}>{character === ' ' ? '\u00a0' : character}</span>)}
        </h1>
        <p className="intro-subtitle">
          <span className="intro-step" style={delay(1250)}>Of all the things I want to give you in this life, I hope making you feel loved is the one I never stop doing</span>
        </p>
        <div className="intro-step mt-8" style={delay(1600)}>
          <SlideCommit
            label="Slide to Explore"
            doneLabel="Let’s explore"
            errorLabel="Please try again"
            onDone={() => { navigateTimer.current = setTimeout(() => navigate('/explore'), 600) }}
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
      <footer className="intro-footer intro-step" style={delay(1900)}>Made just for you</footer>
    </section>
  )
}

function App() {
  const location = useLocation()
  const exploring = location.pathname === '/explore' || (location.pathname === '/' && location.hash === '#explore')
  useLayoutEffect(() => {
    if (['/impressions', '/romeo', '/story'].includes(location.pathname)) return
    const motion = gsap.matchMedia()
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      // The smoother must exist before any pinned ScrollTriggers.
      const smoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 2,
        effects: true,
        normalizeScroll: location.pathname !== '/dates',
      })
      if (exploring) {
        smoother.scrollTo(0, false)
      }
      return () => smoother.kill()
    })
    return () => motion.revert()
  }, [location.pathname, exploring])
  useEffect(() => {
    document.title = 'Jaysha singh'
    window.scrollTo(0, 0)
    if (exploring) document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true })
    ScrollTrigger.refresh()
  }, [location.pathname, exploring])
  return <><div id="smooth-wrapper"><div id="smooth-content"><Routes>
    <Route path="/" element={exploring ? <Hero /> : <Intro />} />
    <Route path="/explore" element={<Hero />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/impressions" element={<ImpressionsPage />} />
    <Route path="/dictionary" element={<DictionaryPage />} />
    <Route path="/about" element={<SectionPage title="About" />} />
    <Route path="/story" element={<RomeoPage />} />
    <Route path="/romeo" element={<RomeoPage />} />
    <Route path="/calendar" element={<CalendarPage />} />
    <Route path="/calendar/:date" element={<DatePage />} />
    <Route path="/dates" element={<React.Suspense fallback={<main className="world-page" role="status">Loading our map…</main>}><DatesMap /></React.Suspense>} />
    <Route path="*" element={<NotFound />} />
  </Routes></div></div><HamburgerMenu />{location.pathname !== '/impressions' && <ContactButton />}</>
}

function Hero() {

  return (
    <main tabIndex={-1} aria-label="Explore" className="site-texture font-hn text-cream outline-none">
    <section aria-label="A little more of our world" className="bg-black text-cream">
      <ScrollExpand
        src="/bg-post-timeline.jpeg"
        mediaBlur={8}
        alt="Jaysha"
        title="Our world, a little closer"
        scrollHint="Scroll to explore"
        useWindowScroll
        style={{ width: '100%' }}
      >
        <h2 className="font-hn text-[clamp(2.5rem,7vw,6rem)] leading-tight">Every little thing, you.</h2>
        <p className="mt-5 max-w-xl font-hn text-lg leading-relaxed sm:text-2xl">Of all the things I want to give you in this life, I hope making you feel loved is the one I never stop doing</p>
      </ScrollExpand>
    </section>
    <SpecialAbilitiesSection />
    <BeyondSection />
    <ThreatsSection />



    </main>
  )
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>)
