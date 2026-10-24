// Adapted from pallavithegod/Anveshan's timeline components (MIT).
// Original layout, path, assets and sample milestones are retained; animation uses our existing GSAP setup.
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { timelineData } from './timeline-data'
import './timeline.css'

const curve = 'M9.00101 3.99977C9.00101 3.99977 -15.1548 65.4995 50.5004 133.499C116.155 201.499 229.557 204.076 294.5 296.499C352.121 378.502 348.348 441.21 440.5 511.999C550.5 596.499 710.501 479.853 862.001 535.003C985.501 579.959 1058.43 986.896 1184.5 1033.5'

export function Timeline() {
  const section = useRef<HTMLElement>(null)
  const path = useRef<SVGPathElement>(null)
  const tip = useRef<SVGGElement>(null)

  useEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const element = path.current
      if (!element) return
      const length = element.getTotalLength()
      element.style.strokeDasharray = String(length)
      element.style.strokeDashoffset = String(length)
      const draw = (progress: number) => {
        // The source maps overall viewport progress [0.21, 0.9] to path progress [0, 1.2].
        const amount = Math.max(0, Math.min(1, (progress - 0.21) / 0.69 * 1.2))
        element.style.strokeDashoffset = String(length * (1 - amount))
        const point = element.getPointAtLength(length * amount)
        tip.current?.setAttribute('transform', `translate(${point.x}, ${point.y})`)
      }
      const trigger = ScrollTrigger.create({ trigger: section.current, start: 'top bottom', end: 'bottom top', onUpdate: self => draw(self.progress), onRefresh: self => draw(self.progress) })
      const numbers = gsap.utils.toArray<HTMLElement>('.timeline-number', section.current)
      const animations = numbers.map(number => gsap.fromTo(number, { color: '#555555' }, { color: '#ffbe0d', ease: 'none', scrollTrigger: { trigger: number.parentElement, start: 'top 60%', end: 'center 60%', scrub: true } }))
      draw(trigger.progress)
      return () => {
        trigger.kill()
        animations.forEach(animation => { animation.scrollTrigger?.kill(); animation.revert() })
        element.removeAttribute('style')
        tip.current?.removeAttribute('transform')
      }
    })
    ScrollTrigger.refresh()
    return () => media.revert()
  }, [])

  return <section ref={section} id="timeline" className="anveshan-timeline site-texture" aria-labelledby="timeline-heading">
    <h2 id="timeline-heading">TIMELINE</h2>
    <div className="timeline-stage">
      <div className="timeline-art" aria-hidden="true">
        <img className="timeline-pencil" src="/anveshan/pencil.png" alt="" loading="lazy" width="372" height="752" />
        <img className="timeline-robot" src="/anveshan/robot.png" alt="" loading="lazy" width="1024" height="1536" />
        <svg className="timeline-curve" viewBox="-25 -25 1240 1090" fill="none">
          <path d={curve} stroke="#333333" strokeWidth="7.9875" strokeLinecap="round" strokeDasharray="15.98 15.98" />
          <path ref={path} d={curve} stroke="url(#our-timeline-gradient)" strokeWidth="7.9875" strokeLinecap="round" />
          <g ref={tip} transform="translate(9 4)"><image href="/anveshan/heart.png" x="-30" y="-30" width="60" height="60" /></g>
          <defs><linearGradient id="our-timeline-gradient" x1="1097.57" y1="212.909" x2="665.402" y2="707.481" gradientUnits="userSpaceOnUse"><stop stopColor="#ffbe0d" /><stop offset="1" stopColor="#ffd866" /></linearGradient></defs>
        </svg>
      </div>
      <ol className="timeline-events">{timelineData.events.map(event => <li key={event.eventNumber} className={`timeline-event timeline-event-${event.eventNumber}`}>
        <span className="timeline-number" aria-hidden="true">{event.eventNumber}</span>
        <div className="timeline-event-copy"><h3>{event.title}</h3><img className="timeline-divider" src="/anveshan/border.svg" alt="" loading="lazy" /><p className="timeline-duration">{event.duration}</p><p>{event.description}</p></div>
      </li>)}</ol>
    </div>
  </section>
}
