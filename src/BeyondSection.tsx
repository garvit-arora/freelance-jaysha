import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './beyond.css'

const strengths = [
  'Stalking skills like Joe Goldberg',
  'Deep empathy towards people',
  'Can identify a dog’s mood but not his man’s mood',
  'Loves wholeheartedly and a genuinely caring heart',
  'A beautiful balance of softness and strength',
  'Living in Uttar Pradesh and still doesn’t own a gun',
]
const weaknesses = [
  'Guggu and guggi reels',
  'Gol gappe',
  'Animal lover until animals are used in steamed momos',
  'Random compliments from his boyfriend',
  'Addicted to reassurance : Needs confirmation, receives confirmation, questions the confirmation.',
  'Cannot walk past a dog without saying “Awww, baby!”',
]

export function BeyondSection() {
  const section = useRef<HTMLElement>(null)
  useEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const columns = gsap.utils.toArray<HTMLElement>('.beyond-trait-column', section.current)
      const animations = columns.map((column, index) => gsap.fromTo(column,
        { x: index === 0 ? -24 : 24, opacity: 0.65 },
        { x: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: column, start: 'top 90%', end: 'top 45%', scrub: true } },
      ))
      return () => animations.forEach(animation => { animation.scrollTrigger?.kill(); animation.revert() })
    })
    ScrollTrigger.refresh()
    return () => media.revert()
  }, [])

  return <section ref={section} className="beyond-section" aria-label="Strengths and weaknesses">
    <div className="beyond-traits">
      <div className="beyond-trait-column beyond-strengths">
        <h2>Strengths</h2>
        <ul>{strengths.map(text => <li key={text}>{text}</li>)}</ul>
      </div>
      <div className="beyond-trait-column beyond-weaknesses">
        <h2>Weaknesses</h2>
        <ul>{weaknesses.map(text => <li key={text}>{text}</li>)}</ul>
      </div>
    </div>
    <div className="beyond-character">
      <img src="/anveshan/near-strength-nobg.png" alt="Jaysha" loading="lazy" decoding="async" onLoad={() => ScrollTrigger.refresh()} />
    </div>
  </section>
}

const specialAbilities = [
  'Overthinking a situation that hasn?t happened yet',
  'Detecting a change in tone through a single emoji',
  'Telepathically knowing when his boyfriend reaches home',
  'Caring a little too much',
  'Making nona baby face every time she is sad',
  'Remembering the tiniest details about the people she loves',
  'Can watch each part of a screenshot except the part that was intended to show',
  'Remembers each and every fight and its causes',
]
const threats = [
  'Never leave her on seen and then upload an Instagram story.',
  'Never try to win an argument using logic',
  'Never assume ?Do whatever you want? is permission to do whatever you want.',
  'Never respond to a serious message with a laughing emoji.',
  'Never make her feel silly for being emotional',
  'Don?t you dare make jokes about her dog',
  'Never leave her alone in a public space',
  'Never miss even a single reel she sent unreacted',
]

function TraitList({ title, items }: { title: string; items: string[] }) {
  return <section className="beyond-list-section" aria-label={title}>
    <div className="beyond-list-content"><h2>{title}</h2><ol>{items.map((text, index) => <li key={text}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><p>{text}</p></li>)}</ol></div>
  </section>
}

export function SpecialAbilitiesSection() {
  return <TraitList title="Special Abilities" items={specialAbilities} />
}

export function ThreatsSection() {
  return <TraitList title="Threats" items={threats} />
}
