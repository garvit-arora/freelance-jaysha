import { Link } from 'react-router-dom'
import { ArrowLeft, CalendarHeart, HandHeart, MessageSquareWarning } from 'lucide-react'
import { PageHeader } from './Calendar'
import { DateBookingForm } from './DateBookingForm'
import { RequestForm } from './RequestForm'
import { ComplaintForm } from './ComplaintForm'
import './girlfriend-helpdesk.css'

const departments = [
  { title: 'The Complaint Department', description: 'For when your boyfriend has committed a crime against your peace.', icon: MessageSquareWarning, path: '/girlfriend-helpdesk/complaint' },
  { title: 'The Request Department', description: "For things you want, things you need, and things you shouldn't have to ask twice for.", icon: HandHeart, path: '/girlfriend-helpdesk/request' },
  { title: 'The Date Booking Department', description: 'For officially reserving your favourite person.', icon: CalendarHeart, path: '/girlfriend-helpdesk/date-booking' },
]

export function GirlfriendHelpdeskPage() {
  return <main className="world-page helpdesk-page">
    <PageHeader title="Girlfriend Helpdesk" />
    <article className="helpdesk-card" aria-labelledby="helpdesk-title">
      <header className="helpdesk-introduction">
        <span className="helpdesk-eyebrow">Girlfriend Helpdesk</span>
        <h1 id="helpdesk-title">Your Boyfriend, At<br />Your Service.</h1>
        <p>For complaints, requests, and dates. Because apparently, having a boyfriend wasn't enough. You also needed a customer support department.</p>
      </header>
      <nav className="helpdesk-departments" aria-label="Helpdesk departments">{departments.map(({ title, description, icon: Icon, path }) => <Link className="helpdesk-department" key={title} to={path}>
        <h2><Icon aria-hidden="true" strokeWidth={1.7} /><span>{title}</span></h2>
        <p>{description}</p>
      </Link>)}</nav>
    </article>
  </main>
}

export function ComplaintDepartmentPage() {
  return <main className="world-page helpdesk-page helpdesk-complaint-page"><header className="world-header"><Link to="/girlfriend-helpdesk" className="world-back"><ArrowLeft size={18} /> Girlfriend Helpdesk</Link></header><ComplaintForm /></main>
}

export function RequestDepartmentPage() {
  return <main className="world-page helpdesk-page helpdesk-complaint-page"><header className="world-header"><Link to="/girlfriend-helpdesk" className="world-back"><ArrowLeft size={18} /> Girlfriend Helpdesk</Link></header><RequestForm /></main>
}

export function DateBookingDepartmentPage() {
  return <main className="world-page helpdesk-page helpdesk-complaint-page"><header className="world-header"><Link to="/girlfriend-helpdesk" className="world-back"><ArrowLeft size={18} /> Girlfriend Helpdesk</Link></header><DateBookingForm /></main>
}
