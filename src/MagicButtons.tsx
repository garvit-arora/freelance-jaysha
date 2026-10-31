import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { PageHeader } from './Calendar'
import messages from './reassurance-messages.json'
import { shuffleDeck } from '../shared/shuffle-deck.mjs'
import './magic-buttons.css'

export function MagicButtonsPage() {
  const [message, setMessage] = useState('')
  const [kind, setKind] = useState<'reassurance' | null>(null)
  const deck = useRef<number[]>([])
  const previous = useRef(-1)
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  function reassure() {
    if (!deck.current.length) deck.current = shuffleDeck(messages.length, previous.current)
    const index = deck.current.shift()!
    previous.current = index
    setMessage(messages[index])
    setKind('reassurance')
  }
  function dedicate() {
    window.dispatchEvent(new Event('archive-play-compilation-song'))
  }
  useEffect(() => {
    if (!kind || !dialog.current) return
    const modal = dialog.current
    const focused = document.activeElement as HTMLElement | null
    const smoother = ScrollSmoother.get()
    const paused = smoother?.paused() ?? false
    const overflow = document.body.style.overflow
    smoother?.paused(true)
    document.body.style.overflow = 'hidden'
    modal.showModal()
    closeButton.current?.focus({ preventScroll: true })
    return () => {
      modal.close()
      smoother?.paused(paused)
      document.body.style.overflow = overflow
      focused?.focus({ preventScroll: true })
    }
  }, [kind])
  return <main className="world-page magic-page"><PageHeader title="Magic Buttons" />
    <header className="magic-heading"><span>FOR EVERY LITTLE WHAT IF</span><h1>Magic Buttons<span>.</span></h1><p>A little love, whenever you need it.</p></header>
    <div className="magic-cards">
      <section className="magic-card" aria-labelledby="reassurance-title"><span className="magic-number">01 / A LITTLE REASSURANCE</span><h2 id="reassurance-title">The Reassurance Button</h2>
        <p>Since your need for reassurance is a full time job and you ask for it 47 times in a day, I’ve decided to automate it.</p>
        <p>Hundreds of reassurances, personally written by your already overworked boyfriend, covering every possible crisis your beautiful little brain could manufacture.</p>
        <p>Click as many times as you want whenever your brain decides to become your biggest enemy. Unlike me, this button never gets tired.</p>
        <button className="magic-action" onClick={reassure}>Reassure me</button>
      </section>
      <section className="magic-card magic-song-card" aria-labelledby="song-title"><span className="magic-number">02 / A LITTLE DEDICATION</span><h2 id="song-title">The Song Button</h2>
        <p>Since “Which song would you dedicate to me?” has somehow become one of your most frequently asked questions, I’ve decided to make a permanent solution.</p>
        <p>So here you go. An entire collection of song lyrics that make me think of you. Next time you feel like asking me that question for the 847th time, you know where to come.</p>
        <p>Click once, get a dedication. Click again, get another. Keep clicking until you’re satisfied, although history suggests that might never happen.</p>
        <button className="magic-action" onClick={dedicate}>Dedicate a song</button>
      </section>
    </div>
    <dialog ref={dialog} className="magic-dialog" aria-labelledby="magic-message-title" onCancel={() => setKind(null)} onClose={() => setKind(null)} onClick={event => { if (event.target === event.currentTarget) setKind(null) }}>
      <button ref={closeButton} className="magic-close" aria-label="Close message" onClick={() => setKind(null)}><X size={20} /></button><span className="magic-number">JUST FOR YOU</span>
      <h2 id="magic-message-title">In case you needed to hear it.</h2>
      <p key={message} className="magic-note" role="status" aria-live="polite" aria-atomic="true">{message}</p>
      {kind === 'reassurance' && <button className="magic-action" onClick={reassure}>One more, please</button>}
    </dialog>
  </main>
}
