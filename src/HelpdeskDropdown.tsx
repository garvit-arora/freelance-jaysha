import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import './helpdesk-dropdown.css'

export function HelpdeskDropdown({ id, options, value, placeholder, disabled, onChange }: {
  id: string; options: string[]; value: string; placeholder: string; disabled?: boolean; onChange: (value: string) => void
}) {
  const menuId = useId()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  function show() { setActive(Math.max(0, options.indexOf(value))); setOpen(true) }
  function close(restore = false) { setOpen(false); if (restore) trigger.current?.focus({ preventScroll: true }) }
  function choose(option: string) { onChange(option); close(true) }
  useEffect(() => {
    if (!open) return
    list.current?.focus({ preventScroll: true })
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])
  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])
  useEffect(() => {
    const container = list.current
    const option = container?.querySelector<HTMLElement>(`[data-index="${active}"]`)
    if (!open || !container || !option) return
    if (option.offsetTop < container.scrollTop) container.scrollTop = option.offsetTop
    else if (option.offsetTop + option.offsetHeight > container.scrollTop + container.clientHeight) container.scrollTop = option.offsetTop + option.offsetHeight - container.clientHeight
  }, [active, open])
  return <div ref={root} className={`helpdesk-dropdown ${open ? 'is-open' : ''}`} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close() }}>
    <button id={id} ref={trigger} type="button" className="helpdesk-dropdown-trigger" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? menuId : undefined} onClick={() => open ? close() : show()} onKeyDown={event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); show() }
    }}><span className={value ? '' : 'is-placeholder'}>{value || placeholder}</span><ChevronDown size={18} aria-hidden="true" /></button>
    {open && <div className="helpdesk-dropdown-menu"><div ref={list} id={menuId} role="listbox" tabIndex={0} className="helpdesk-dropdown-options" aria-label={placeholder} aria-activedescendant={`${menuId}-${active}`} onWheel={event => event.stopPropagation()} onTouchMove={event => event.stopPropagation()} onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true) }
      if (event.key === 'Tab') close()
      if (event.key === 'ArrowDown') { event.preventDefault(); setActive(index => Math.min(options.length - 1, index + 1)) }
      if (event.key === 'ArrowUp') { event.preventDefault(); setActive(index => Math.max(0, index - 1)) }
      if (event.key === 'Home') { event.preventDefault(); setActive(0) }
      if (event.key === 'End') { event.preventDefault(); setActive(options.length - 1) }
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (options[active]) choose(options[active]) }
    }}>{options.map((option, index) => <button id={`${menuId}-${index}`} data-index={index} key={option} type="button" role="option" aria-selected={value === option} tabIndex={-1} className={active === index ? 'is-active' : ''} onMouseDown={event => event.preventDefault()} onClick={() => choose(option)}><span>{option}</span>{value === option && <Check size={16} aria-hidden="true" />}</button>)}</div></div>}
  </div>
}
