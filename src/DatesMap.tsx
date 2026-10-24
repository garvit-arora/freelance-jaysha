import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PageHeader } from './Calendar'
import { Heart, Minus, Plus, RotateCcw, X } from 'lucide-react'
import { dateMemories, memoryLocations } from './dates-memories'
import projection from './map-projection.json'
import './vendor/india-map-engine.js'
import './dates-map.css'

type Feature = { id: string; element: SVGGElement; attributes: { state: string } }
type Engine = {
  load: () => Promise<unknown>; destroy: () => void; clearSelection: () => void
  on: (name: string, handler: (event: CustomEvent<{ id: string; feature: Feature }>) => void) => () => void
  getFeatureElement: (id: string) => SVGGElement | null
  getFeatures: () => Feature[]; select: (id: string) => void
}
type View = { x: number; y: number; width: number; height: number }
const HOME: View = { x: 0, y: 0, width: 1000, height: 1100 }
const projectedLocations = Object.entries(memoryLocations).map(([id, location]) => ({
  id, ...location,
  x: projection.offsetX + (location.longitude * Math.PI / 180 - projection.minX) * projection.scale,
  y: projection.offsetY + (-Math.log(Math.tan(Math.PI / 4 + location.latitude * Math.PI / 360)) - projection.minY) * projection.scale,
  count: dateMemories.filter(memory => memory.location === id).length,
})).filter(location => location.count > 0)

export default function DatesMap() {
  const mount = useRef<HTMLDivElement>(null)
  const engine = useRef<Engine | null>(null)
  const controls = useRef({ zoom: (_factor: number) => {}, reset: () => {} })
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [label, setLabel] = useState('India')
  const [selected, setSelected] = useState('')
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([])
  const [retry, setRetry] = useState(0)
  const [activeLocations, setActiveLocations] = useState<string[]>([])
  const [activeMemory, setActiveMemory] = useState<string | null>(null)
  const visibleMemories = dateMemories.filter(memory => activeLocations.includes(memory.location))

  useEffect(() => {
    if (!mount.current) return
    const node = mount.current
    const Constructor = (window as unknown as { IndiaMapEngine: new (options: Record<string, unknown>) => Engine }).IndiaMapEngine
    const map = new Constructor({ mount: node, src: '/india-map-studio/india-states.svg', featureSelector: '.map-region', featureKey: 'slug' })
    engine.current = map
    let disposed = false
    let svg: SVGSVGElement | null = null
    const view = { ...HOME }
    let selectedSlug = ''
    let markers: { element: SVGGElement; count: SVGTextElement; title: SVGTitleElement; location: typeof projectedLocations[number] }[] = []
    let moved = false
    let dragDistance = 0
    const pointers = new Map<number, { x: number; y: number }>()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setStatus('loading')
    const paint = () => {
      if (!svg) return
      svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.width} ${view.height}`)
      const scale = Math.abs(svg.getScreenCTM()?.a || 1)
      const remaining = markers.filter(marker => !selectedSlug || marker.location.state === selectedSlug)
      markers.forEach(marker => { marker.element.style.display = 'none' })
      while (remaining.length) {
        const marker = remaining.shift()!
        const group = [marker]
        for (let i = remaining.length - 1; i >= 0; i--) {
          if (Math.hypot(remaining[i].location.x - marker.location.x, remaining[i].location.y - marker.location.y) * scale < 42) group.push(...remaining.splice(i, 1))
        }
        const ids = group.map(item => item.location.id)
        const count = group.reduce((total, item) => total + item.location.count, 0)
        marker.element.style.display = ''
        marker.element.dataset.locations = ids.join('|')
        marker.element.setAttribute('transform', `translate(${marker.location.x} ${marker.location.y}) scale(${1 / scale})`)
        marker.element.setAttribute('aria-label', `${group.map(item => item.location.name).join(', ')}: ${count} memories`)
        marker.title.textContent = marker.element.getAttribute('aria-label')
        marker.count.textContent = String(count)
      }
    }
    const go = (next: View, animate = true) => {
      gsap.killTweensOf(view)
      if (animate && !reduced) gsap.to(view, { ...next, duration: .45, ease: 'power2.out', onUpdate: paint })
      else { Object.assign(view, next); paint() }
    }
    const zoom = (factor: number, cx = view.x + view.width / 2, cy = view.y + view.height / 2) => {
      const width = Math.max(0.6, Math.min(1400, view.width * factor))
      const ratio = width / view.width
      go({ x: cx - (cx - view.x) * ratio, y: cy - (cy - view.y) * ratio, width, height: width * 1.1 }, false)
    }
    const reset = () => { selectedSlug = ''; map.clearSelection(); setSelected(''); setLabel('India'); setActiveLocations([]); go(HOME) }
    controls.current = { zoom, reset }
    const subscriptions = [
      map.on('selectionchange', event => {
        const id = event.detail.id
        selectedSlug = id || ''
        setSelected(id || '')
        setActiveLocations([])
        if (!id) { paint(); return }
        setLabel(event.detail.feature.attributes.state)
        const box = map.getFeatureElement(id)?.getBBox()
        if (!box) return
        const width = Math.max(box.width, box.height / 1.1, 4) * 1.22
        go({ x: box.x + box.width / 2 - width / 2, y: box.y + box.height / 2 - width * 1.1 / 2, width, height: width * 1.1 })
      }),
      map.on('featureenter', event => setLabel(event.detail.feature.attributes.state)),
      map.on('featurefocus', event => setLabel(event.detail.feature.attributes.state)),
    ]
    const svgPoint = (x: number, y: number) => {
      if (!svg) return null
      const matrix = svg.getScreenCTM()
      if (!matrix) return null
      return new DOMPoint(x, y).matrixTransform(matrix.inverse())
    }
    const wheel = (event: WheelEvent) => {
      if (!svg) return
      event.preventDefault()
      const point = svgPoint(event.clientX, event.clientY)
      if (point) zoom(event.deltaY > 0 ? 1.12 : .89, point.x, point.y)
    }
    const down = (event: PointerEvent) => {
      if (!svg || (event.pointerType === 'mouse' && event.button !== 0)) return
      gsap.killTweensOf(view)
      if (!pointers.size) { moved = false; dragDistance = 0 }
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      node.classList.add('is-panning')
      node.setPointerCapture(event.pointerId)
    }
    const move = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId)
      if (!previous || !svg) return
      const next = { x: event.clientX, y: event.clientY }
      const other = Array.from(pointers.entries()).find(([id]) => id !== event.pointerId)?.[1]
      dragDistance += Math.hypot(next.x - previous.x, next.y - previous.y)
      if (dragDistance > 5) moved = true
      if (other) {
        const oldDistance = Math.hypot(previous.x - other.x, previous.y - other.y)
        const newDistance = Math.hypot(next.x - other.x, next.y - other.y)
        const center = svgPoint((next.x + other.x) / 2, (next.y + other.y) / 2)
        if (oldDistance > 0 && newDistance > 0 && center) zoom(oldDistance / newDistance, center.x, center.y)
        moved = true
      } else {
        const before = svgPoint(previous.x, previous.y)
        const after = svgPoint(next.x, next.y)
        if (before && after) go({ ...view, x: view.x + before.x - after.x, y: view.y + before.y - after.y }, false)
      }
      pointers.set(event.pointerId, next)
    }
    const up = (event: PointerEvent) => {
      pointers.delete(event.pointerId)
      if (node.hasPointerCapture(event.pointerId)) node.releasePointerCapture(event.pointerId)
      if (!pointers.size) node.classList.remove('is-panning')
    }
    const click = (event: MouseEvent) => {
      if (moved && event.detail !== 0) { event.preventDefault(); event.stopImmediatePropagation(); moved = false }
    }
    // Capture on the original SVG target so a simple tap still reaches the engine's state click handler.
    const downWithCapture = (event: PointerEvent) => {
      down(event)
      if (svg && event.target instanceof Element && 'setPointerCapture' in event.target) {
        node.releasePointerCapture(event.pointerId)
        ;(event.target as Element).setPointerCapture(event.pointerId)
      }
    }
    node.addEventListener('wheel', wheel, { passive: false })
    node.addEventListener('pointerdown', downWithCapture)
    node.addEventListener('pointermove', move)
    node.addEventListener('pointerup', up)
    node.addEventListener('pointercancel', up)
    node.addEventListener('click', click, true)
    map.load().then(() => {
      if (disposed) return
      svg = node.querySelector('svg')
      if (svg) {
        const namespace = 'http://www.w3.org/2000/svg'
        const layer = document.createElementNS(namespace, 'g')
        layer.setAttribute('class', 'memory-pin-layer')
        svg.append(layer)
        markers = projectedLocations.map(location => {
          const element = document.createElementNS(namespace, 'g')
          element.setAttribute('class', 'memory-map-pin')
          element.setAttribute('role', 'button')
          element.setAttribute('tabindex', '0')
          const title = document.createElementNS(namespace, 'title')
          const pin = document.createElementNS(namespace, 'image')
          pin.setAttribute('href', '/pin.png')
          pin.setAttribute('x', '-29')
          pin.setAttribute('y', '-43')
          pin.setAttribute('width', '56')
          pin.setAttribute('height', '56')
          const count = document.createElementNS(namespace, 'text')
          count.setAttribute('text-anchor', 'middle')
          count.setAttribute('dominant-baseline', 'central')
          count.setAttribute('y', '-22')
          element.append(title, pin, count)
          layer.append(element)
          const open = () => {
            const ids = (element.dataset.locations || location.id).split('|')
            setActiveLocations(ids)
            setActiveMemory(null)
            setLabel(ids.map(id => memoryLocations[id].name).join(' · '))
            const points = projectedLocations.filter(point => ids.includes(point.id))
            const minX = Math.min(...points.map(point => point.x)), maxX = Math.max(...points.map(point => point.x))
            const minY = Math.min(...points.map(point => point.y)), maxY = Math.max(...points.map(point => point.y))
            const width = Math.max(maxX - minX, (maxY - minY) / 1.1, 6) * 1.8
            go({ x: (minX + maxX) / 2 - width / 2, y: (minY + maxY) / 2 - width * 1.1 / 2, width, height: width * 1.1 })
          }
          element.addEventListener('click', event => { event.stopPropagation(); open() })
          element.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); open() } })
          return { element, count, title, location }
        })
      }
      paint()
      const features = map.getFeatures()
      features.forEach(feature => { feature.element.setAttribute('role', 'button'); feature.element.setAttribute('aria-label', `Select ${feature.attributes.state}`) })
      setRegions(features.map(feature => ({ id: feature.id, name: feature.attributes.state })).sort((a, b) => a.name.localeCompare(b.name)))
      setStatus('ready')
      const minX = Math.min(...projectedLocations.map(point => point.x)), maxX = Math.max(...projectedLocations.map(point => point.x))
      const minY = Math.min(...projectedLocations.map(point => point.y)), maxY = Math.max(...projectedLocations.map(point => point.y))
      const width = Math.max(maxX - minX, (maxY - minY) / 1.1, 180) * 1.55
      go({ x: (minX + maxX) / 2 - width / 2, y: (minY + maxY) / 2 - width * 1.1 / 2, width, height: width * 1.1 }, false)
      ScrollTrigger.refresh()
    }).catch(() => { if (!disposed) setStatus('error') })
    return () => {
      disposed = true
      gsap.killTweensOf(view)
      subscriptions.forEach(remove => remove())
      node.removeEventListener('wheel', wheel)
      node.removeEventListener('pointerdown', downWithCapture)
      node.removeEventListener('pointermove', move)
      node.removeEventListener('pointerup', up)
      node.removeEventListener('pointercancel', up)
      node.removeEventListener('click', click, true)
      map.destroy()
      engine.current = null
    }
  }, [retry])

  return <main className="world-page dates-page site-texture">
    <PageHeader title="Dates" />
    <section className="studio-map" aria-label="Interactive India map">
      <div className="studio-map-toolbar"><label className="sr-only" htmlFor="studio-state">Select a state</label><select id="studio-state" value={selected} disabled={status !== 'ready'} onChange={event => event.target.value ? engine.current?.select(event.target.value) : controls.current.reset()}><option value="">All of India</option>{regions.map(region => <option key={region.id} value={region.id}>{region.name}</option>)}</select><div className="studio-map-zoom"><button aria-label="Zoom in" disabled={status !== 'ready'} onClick={() => controls.current.zoom(.65)}><Plus size={20} /></button><button aria-label="Zoom out" disabled={status !== 'ready'} onClick={() => controls.current.zoom(1.5)}><Minus size={20} /></button><button aria-label="Reset view" disabled={status !== 'ready'} onClick={() => controls.current.reset()}><RotateCcw size={18} /></button></div></div>
      <div ref={mount} className="studio-map-mount" />
      {status === 'loading' && <p className="studio-map-status" role="status">Loading map…</p>}
      {status === 'error' && <p className="studio-map-status" role="alert">Couldn’t load the map. <button onClick={() => setRetry(value => value + 1)}>Try again</button></p>}
      <button className="all-memories-button" onClick={() => { setActiveLocations(Object.keys(memoryLocations)); setActiveMemory(null) }}><Heart size={15} /> All {dateMemories.length} memories</button>
      {!!activeLocations.length && <section className="map-memories-panel" aria-label="Place memories">
        <header><div><span>Our dates</span><h2>{activeLocations.length === 1 ? memoryLocations[activeLocations[0]].name : `${visibleMemories.length} memories`}</h2></div><button aria-label="Close memories" onClick={() => setActiveLocations([])}><X size={20} /></button></header>
        <ul>{visibleMemories.map(memory => <li key={memory.id}><button className={activeMemory === memory.id ? 'is-active' : ''} onClick={() => setActiveMemory(memory.id)} aria-pressed={activeMemory === memory.id}><time>{memory.date}</time><strong>{memory.place}</strong>{memory.note && <span>{memory.note}</span>}</button></li>)}</ul>
      </section>}
      <div className="studio-map-caption"><span aria-live="polite">{label}</span><span>Tap a pin for memories · Drag to pan · Pinch to zoom</span></div>
    </section>
  </main>
}
