// Month interval and week grouping adapted from origin-space/event-calendar (MIT).
// See third-party/event-calendar-LICENSE.md.
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { addMonths, eachDayOfInterval, endOfMonth, format, isToday, startOfMonth } from 'date-fns'
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './calendar.css'
import './stories-calendar.css'
import { CalendarPicker } from './CalendarPicker'
import { listMedia, useSession } from './lib/cloud'
export { DateGallery as DatePage } from './DateGallery'
const DatesMap = lazy(() => import('./DatesMap'))

const dateKey = (date: Date) => format(date, 'dd-MM-yyyy')
const dateLabel = (date: Date) => format(date, 'EEEE, d MMMM yyyy')

export function PageHeader({ title }: { title: string }) {
  return <header className="world-header"><Link to="/home" className="world-back"><ArrowLeft size={18} /> Our world</Link></header>
}

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showMap, setShowMap] = useState(false)
  const mapSection = useRef<HTMLElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setShowMap(true); observer.disconnect() } }, { threshold: 0.05 })
    if (mapSection.current) observer.observe(mapSection.current)
    return () => observer.disconnect()
  }, [])
  const [media, setMedia] = useState<import('./lib/cloud').Media[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [retry, setRetry] = useState(0)
  const { session, loading } = useSession()
  useEffect(() => {
    let live = true
    setStatus('loading')
    listMedia().then(data => { if (live) { setMedia(data); setStatus('ready') } }).catch(() => { if (live) setStatus('error') })
    return () => { live = false }
  }, [retry])
  useEffect(() => { ScrollTrigger.refresh() }, [status, currentDate])
  const covers = new Map<string, string>()
  media.forEach(item => { if (!covers.has(item.memory_date)) covers.set(item.memory_date, item.thumbnail_url || item.url) })
  const months = [currentDate]
  return <main className="stories-calendar">
    <header className="stories-header"><Link to="/home" aria-label="Back to our world"><ArrowLeft size={25} /></Link><h1>Stories Archive</h1><Link to="/dictionary" aria-label="Open Jaysha-to-English translator"><BookOpen size={21} aria-hidden="true" /></Link></header>
    <section ref={mapSection} className="calendar-map-section" aria-labelledby="calendar-map-title"><header><span>THE PLACES BEHIND THE DAYS</span><h2 id="calendar-map-title">Our dates, on the map</h2><p>Explore a place and the memories we made there.</p></header>{showMap ? <Suspense fallback={<div className="calendar-map-loading" role="status">Opening our map?</div>}><DatesMap embedded /></Suspense> : <div className="calendar-map-loading" aria-hidden="true" />}</section>
    <div className="stories-tabs"><span aria-current="page">CALENDAR</span></div>
    <div className="stories-controls"><button onClick={() => setCurrentDate(value => addMonths(value, -1))} aria-label="Previous month"><ChevronLeft size={20} /></button><CalendarPicker value={currentDate} onChange={setCurrentDate} /><button onClick={() => setCurrentDate(value => addMonths(value, 1))} aria-label="Next month"><ChevronRight size={20} /></button><button onClick={() => setCurrentDate(new Date())}>Today</button></div>
    {status === 'loading' && <p className="stories-status" role="status">Loading memories?</p>}
    {status === 'error' && <p className="stories-status" role="alert">Couldn?t load the archive. <button onClick={() => setRetry(value => value + 1)}>Try again</button></p>}
    <div className="stories-months">{months.map(month => {
      const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
      return <section className="stories-month" key={format(month, 'yyyy-MM')} aria-label={format(month, 'MMMM yyyy')}><h2>{format(month, 'MMMM yyyy')}</h2><div className="stories-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}</div><div className="stories-days">{Array.from({ length: startOfMonth(month).getDay() }, (_, index) => <span key={`blank-${index}`} />)}{days.map(day => {
        const date = dateKey(day), cover = covers.get(date)
        const destination = `/calendar/${date}`
        return <Link key={date} to={destination} className={`stories-day ${cover ? 'has-memory' : ''} ${isToday(day) ? 'today' : ''}`} onClick={event => { if (loading || status !== 'ready') event.preventDefault() }} aria-disabled={loading || status !== 'ready'} aria-label={`${dateLabel(day)}: ${cover ? 'view memories' : 'add memories'}`} aria-current={isToday(day) ? 'date' : undefined}>{cover && <img src={cover} alt="" loading="lazy" />}<time dateTime={format(day, 'yyyy-MM-dd')}>{format(day, 'd')}</time></Link>
      })}</div></section>
    })}</div><p className="stories-note">Every circle holds a memory. Open any day to view or add yours.</p>

  </main>
}

export function NotFound() {
  return <main className="world-page"><PageHeader title="" /><div className="world-heading not-found"><span className="world-eyebrow">404</span><h1>No memory here.</h1><p>This date hasn’t been marked with an event.</p><Link className="intro-explore" to="/calendar">Back to our calendar ↗</Link></div></main>
}

export function SectionPage({ title }: { title: string }) {
  return <main className="world-page"><PageHeader title={title} /><div className="world-heading"><span className="world-eyebrow">Our world</span><h1>{title === 'Story' ? 'Our story' : 'About us'}</h1><p>{title === 'Story' ? 'Our story will live here.' : 'A little space for us.'}</p><Link className="intro-explore" to="/calendar">Visit our calendar ↗</Link></div></main>
}
