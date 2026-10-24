import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import entries from './dictionary-data.json'

export function PhraseDropdown({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const wrapper = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const filtered = entries.filter(entry => entry.term.toLowerCase().includes(query.trim().toLowerCase()))
  function show() { setQuery(''); setActive(Math.max(0, entries.findIndex(entry => entry.term === value))); setOpen(true) }
  function close(restore = false) { setOpen(false); if (restore) trigger.current?.focus() }
  function choose(term: string) { onChange(term); close(true) }
  useEffect(() => {
    if (!open) return
    input.current?.focus({ preventScroll: true })
    const outside = (event: PointerEvent) => { if (!wrapper.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])
  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [open, active])
  return <div ref={wrapper} className={`phrase-dropdown ${open ? 'is-open' : ''}`} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false) }}>
    <button ref={trigger} type="button" className="phrase-dropdown-trigger" aria-haspopup="listbox" aria-expanded={open} aria-controls="translator-phrase-options" aria-label={`Choose a Jaysha phrase${value ? `: ${value}` : ''}`} onClick={() => open ? close() : show()} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); show() } }}><span>{value || 'Choose a Jaysha phrase'}</span><ChevronDown size={18} /></button>
    {open && <div className="phrase-dropdown-menu"><label className="phrase-dropdown-search"><Search size={16} /><span className="sr-only">Search saved phrases</span><input ref={input} role="combobox" aria-expanded="true" aria-controls="translator-phrase-options" aria-autocomplete="list" aria-activedescendant={filtered[active] ? `phrase-option-${entries.indexOf(filtered[active])}` : undefined} placeholder="Find her words…" value={query} onChange={event => { setQuery(event.target.value); setActive(0) }} onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); close(true) }
      if (event.key === 'ArrowDown') { event.preventDefault(); setActive(index => Math.min(index + 1, filtered.length - 1)) }
      if (event.key === 'ArrowUp') { event.preventDefault(); setActive(index => Math.max(index - 1, 0)) }
      if (event.key === 'Enter') { event.preventDefault(); if (filtered[active]) choose(filtered[active].term) }
      if (event.key === 'Tab') close()
    }} /></label><div className="phrase-dropdown-caption">HER WORDS <span>{filtered.length} phrases</span></div><div ref={list} className="phrase-dropdown-options" id="translator-phrase-options" role="listbox" aria-label="Saved Jaysha phrases">{filtered.map((entry, index) => <div key={entry.term} id={`phrase-option-${entries.indexOf(entry)}`} role="option" aria-selected={entry.term === value} data-index={index} className={`phrase-dropdown-option ${index === active ? 'is-active' : ''}`} onMouseEnter={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => choose(entry.term)}><span>{entry.term}</span>{entry.term === value && <Check size={16} />}</div>)}</div>{!filtered.length && <p className="phrase-dropdown-empty" role="status">No matching phrases. Try another word.</p>}</div>}
  </div>
}
