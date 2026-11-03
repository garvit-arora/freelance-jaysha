import { useEffect, useId, useRef, useState } from 'react'
import { addDays, addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth, startOfDay } from 'date-fns'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import './calendar-picker.css'

type View = 'days' | 'months' | 'years'
const MIN_YEAR = 1900, MAX_YEAR = 2099
export function CalendarPicker({ value, onChange, minDate, placeholder, disabled = false, id, initialView = 'days' }: { value?: Date; onChange: (date: Date) => void; minDate?: Date; placeholder?: string; disabled?: boolean; id?: string; initialView?: View }) {
  const popupId = useId()
  const earliest = minDate ? startOfDay(minDate) : undefined
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('days')
  const [cursor, setCursor] = useState(value || minDate || new Date())
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const heading = useRef<HTMLButtonElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const decade = Math.floor(cursor.getFullYear() / 12) * 12
  function close(restore = true) { setOpen(false); if (restore) trigger.current?.focus({ preventScroll: true }) }
  function choose(date: Date) { if (earliest && startOfDay(date) < earliest) return; onChange(date); close() }
  function switchView(next: View) { setView(next); heading.current?.focus({ preventScroll: true }) }
  function move(direction: number) {
    const next = view === 'days' ? addMonths(cursor, direction) : new Date(cursor.getFullYear() + direction * (view === 'years' ? 12 : 1), cursor.getMonth(), 1)
    if (next.getFullYear() >= MIN_YEAR && next.getFullYear() <= MAX_YEAR) setCursor(next)
  }
  useEffect(() => {
    if (!open) return
    heading.current?.focus({ preventScroll: true })
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open, view])
  const days = eachDayOfInterval({ start: startOfMonth(cursor), end: endOfMonth(cursor) })
  const buttons = view === 'days' ? days : Array.from({ length: 12 }, (_, index) => new Date(view === 'years' ? decade + index : cursor.getFullYear(), view === 'months' ? index : 0, 1))
  const previousEnd = view === 'days' ? endOfMonth(addMonths(cursor, -1)) : new Date((view === 'months' ? cursor.getFullYear() : decade) - 1, 11, 31, 23, 59)
  const previousBeforeMinimum = !!earliest && previousEnd < earliest
  const previousDisabled = previousBeforeMinimum || ( view === 'days' ? cursor.getFullYear() === MIN_YEAR && cursor.getMonth() === 0 : view === 'months' ? cursor.getFullYear() <= MIN_YEAR : decade <= MIN_YEAR)
  const nextDisabled = view === 'days' ? cursor.getFullYear() === MAX_YEAR && cursor.getMonth() === 11 : view === 'months' ? cursor.getFullYear() >= MAX_YEAR : decade + 11 >= MAX_YEAR
  return <div className="calendar-picker" ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false) }} onKeyDown={event => { if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); close() } }}>
    <button id={id} disabled={disabled} ref={trigger} className="calendar-picker-trigger" type="button" aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? popupId : undefined} aria-label={value ? `Choose date, currently ${format(value, 'd MMMM yyyy')}` : placeholder || 'Choose date'} onClick={() => { if (open) close(); else { setCursor(value || minDate || new Date()); setView(initialView); setOpen(true) } }}><CalendarDays size={17} /><span>{value ? format(value, placeholder ? 'd MMMM yyyy' : 'MMMM yyyy') : placeholder || 'Choose date'}</span><ChevronDown size={14} /></button>
    {open && <section id={popupId} className="calendar-picker-popup" role="dialog" aria-label="Choose a date"><div className="calendar-picker-top"><span>{view === 'days' ? 'CHOOSE DATE' : view === 'months' ? 'CHOOSE MONTH' : 'CHOOSE YEAR'}</span><button type="button" aria-label="Close date picker" onClick={() => close()}><X size={16} /></button></div><header><button type="button" disabled={previousDisabled} aria-label={`Previous ${view === 'days' ? 'month' : view === 'months' ? 'year' : '12 years'}`} onClick={() => move(-1)}><ChevronLeft size={18} /></button><div className="calendar-picker-heading-group">{view === 'days' ? <><button ref={heading} type="button" className="calendar-picker-heading" aria-label="Choose month" onClick={() => switchView('months')}>{format(cursor, 'MMMM')}<ChevronDown size={12} /></button><button type="button" className="calendar-picker-heading" aria-label="Choose year" onClick={() => switchView('years')}>{cursor.getFullYear()}<ChevronDown size={12} /></button></> : <button ref={heading} type="button" className="calendar-picker-heading" aria-label={view === 'months' ? 'Choose year' : 'Showing year range'} onClick={() => { if (view === 'months') switchView('years') }}>{view === 'months' ? cursor.getFullYear() : `${Math.max(MIN_YEAR, decade)} \u2013 ${Math.min(MAX_YEAR, decade + 11)}`}{view === 'months' && <ChevronDown size={14} />}</button>}</div><button type="button" disabled={nextDisabled} aria-label={`Next ${view === 'days' ? 'month' : view === 'months' ? 'year' : '12 years'}`} onClick={() => move(1)}><ChevronRight size={18} /></button></header>
      <p className="calendar-picker-hint">{view === 'days' ? 'Click the month above to jump to another month.' : view === 'months' ? 'Click the year above to choose another year.' : 'Choose a year, then a month and date.'}</p>
      {view === 'days' && <div className="calendar-picker-weekdays">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <span key={day}>{day}</span>)}</div>}
      <div ref={grid} className={`calendar-picker-grid picker-${view}`} onKeyDown={event => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
        const cells = Array.from(grid.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') || [])
        const index = cells.indexOf(document.activeElement as HTMLButtonElement)
        if (index < 0) return
        event.preventDefault()
        const columns = view === 'days' ? 7 : 3
        const step = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : event.key === 'ArrowUp' ? -columns : columns
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? cells.length - 1 : Math.max(0, Math.min(cells.length - 1, index + step))
        cells[next]?.focus()
      }}>{view === 'days' && Array.from({ length: startOfMonth(cursor).getDay() }, (_, index) => <span key={`blank-${index}`} />)}{buttons.map(date => {
        const selected = !!value && (view === 'days' ? isSameDay(date, value) : view === 'months' ? date.getFullYear() === value.getFullYear() && date.getMonth() === value.getMonth() : date.getFullYear() === value.getFullYear())
        const periodEnd = view === 'days' ? date : view === 'months' ? endOfMonth(date) : new Date(date.getFullYear(), 11, 31, 23, 59)
        const invalid = date.getFullYear() < MIN_YEAR || date.getFullYear() > MAX_YEAR || (!!earliest && periodEnd < earliest)
        return <button key={date.toISOString()} type="button" disabled={invalid} aria-pressed={selected} aria-label={format(date, view === 'days' ? 'd MMMM yyyy' : view === 'months' ? 'MMMM yyyy' : 'yyyy')} className={selected ? 'selected' : ''} onClick={() => {
          if (view === 'days') choose(date)
          else if (view === 'months') { setCursor(date); switchView('days') }
          else { setCursor(new Date(date.getFullYear(), cursor.getMonth(), 1)); switchView('months') }
        }}>{format(date, view === 'days' ? 'd' : view === 'months' ? 'MMM' : 'yyyy')}</button>
      })}</div><footer><button type="button" onClick={() => choose(new Date())}>Today</button>{view !== 'days' && <button type="button" onClick={() => switchView(view === 'years' ? 'months' : 'days')}>Back to {view === 'years' ? 'months' : 'dates'}</button>}</footer>
    </section>}
  </div>
}
