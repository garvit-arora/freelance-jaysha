import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const paragraphs = [
  'Jaysha is a professional overthinker, part time drama queen, full time cutie, and an emotionally expensive human being who can go from \u201cI\u2019m fine\u201d to \u201chadd hoti hai yaar\u201d in fraction of a second.',
  'She has a heart way too soft for this world, a talent for getting emotionally invested to the smallest things, and has absolutely no idea how adorable she is.',
  'Handle with love. Feed on time. Reassure regularly. Compliment frequently.',
]
export function AboutHer() {
  const root = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const motion = gsap.matchMedia()
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const heading = root.current?.querySelector('h2')
      if (heading) gsap.fromTo(heading, { autoAlpha: 0, y: 24, color: '#e5b33e' }, { autoAlpha: 1, y: 0, color: '#fffdf5', ease: 'none', scrollTrigger: { trigger: heading, start: 'top 90%', end: 'top 55%', scrub: .6 } })
      const words = root.current?.querySelectorAll('.about-her-word')
      if (!words) return
      gsap.fromTo(words, { color: '#55534f' }, { color: '#fffdf5', stagger: .12, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 65%', end: 'bottom 65%', scrub: .5 } })
    })
    ScrollTrigger.refresh()
    return () => motion.revert()
  }, [])
  return <section ref={root} className="about-her" aria-labelledby="about-her-title"><h2 id="about-her-title">About <em>her.</em></h2><div>{paragraphs.map(paragraph => <p key={paragraph} aria-label={paragraph}>{paragraph.split(' ').map((word, index) => <span key={index} className="about-her-word" aria-hidden="true">{word}{' '}</span>)}</p>)}</div></section>
}
