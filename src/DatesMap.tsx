import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import { createPortal } from 'react-dom'
import { ArrowLeft, Search, Plus, Minus, LocateFixed, Layers, X, ExternalLink, MapPin } from 'lucide-react'
import { dateMemories, memoryLocations } from './dates-memories'
import { venueFor, venueCoordinates, venueAlternatives, type VenueCoordinate } from './venue-locations'
import { listMedia } from './lib/cloud'
import 'leaflet/dist/leaflet.css'
import './street-map.css'

const allBounds = L.latLngBounds(Object.values(venueCoordinates).map(place => [place.latitude, place.longitude] as L.LatLngTuple))
const delhiBounds = L.latLngBounds([[28.33, 76.91], [28.8, 77.46]])
export default function DatesMap({ embedded = false }: { embedded?: boolean }) {
  const Surface = embedded ? 'section' : 'main'
  const mount = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const markers = useRef<L.LayerGroup | null>(null)
  const [query, setQuery] = useState('')
  const [streetView, setStreetView] = useState<{ place: string; latitude: number; longitude: number; source: string; precision: string; memoryIds: string[] } | null>(null)
  const panoramaClose = useRef<HTMLButtonElement>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [showList, setShowList] = useState(false)
  const [glow, setGlow] = useState(true)
  const [tileError, setTileError] = useState(false)
  const [covers, setCovers] = useState<Record<string, string>>({})
  const [ready, setReady] = useState(false)
  const [coverWarning, setCoverWarning] = useState(false)
  const matching = dateMemories.filter(memory => `${memory.place} ${memory.note} ${memory.date} ${memoryLocations[memory.location].name}`.toLowerCase().includes(query.toLowerCase()))
  const visible = selected.length ? matching.filter(memory => selected.includes(memory.id)) : matching
  useEffect(() => {
    let live = true
    listMedia().then(items => {
      if (!live) return
      const photos: Record<string, string> = {}
      items.filter(item => item.kind === 'image').forEach(item => { if (!photos[item.memory_date]) photos[item.memory_date] = item.thumbnail_url || item.url })
      setCovers(photos)
    }).catch(() => { if (live) setCoverWarning(true) })
    return () => { live = false }
  }, [])
  useEffect(() => {
    if (!mount.current) return
    const instance = L.map(mount.current, { zoomControl: false, minZoom: 3, maxZoom: 19, attributionControl: true, scrollWheelZoom: !embedded })
    map.current = instance
    instance.fitBounds(delhiBounds, { padding: [35, 35] })
    const tiles = L.tileLayer(import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, keepBuffer: 1,
      attribution: import.meta.env.VITE_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(instance)
    tiles.on('tileerror', () => setTileError(true))
    markers.current = L.layerGroup().addTo(instance)
    const resize = new ResizeObserver(() => instance.invalidateSize({ pan: false }))
    resize.observe(mount.current)
    setReady(true)
    return () => { resize.disconnect(); instance.remove(); map.current = null; markers.current = null }
  }, [embedded])
  useEffect(() => {
    const instance = map.current, layer = markers.current
    if (!instance || !layer || !ready) return
    const paint = () => {
      layer.clearLayers()
      const venues = new Map<string, typeof matching>()
      for (const memory of matching) {
        const key = `${memory.location}:${memory.place.trim().toLowerCase()}`
        venues.set(key, [...(venues.get(key) || []), memory])
      }
      const entries = [...venues.entries()]
      for (const [key, memories] of entries) {
        const point = venueFor(memories[0])
        if (!point) continue
        const latitude = point.latitude, longitude = point.longitude
        const origin = L.latLng(latitude, longitude)
        if (glow) {
          L.circleMarker([latitude, longitude], { radius: Math.min(72, 27 + memories.length * 2), stroke: false, fillColor: '#f3b44c', fillOpacity: .17, interactive: false }).addTo(layer)
          L.circleMarker([latitude, longitude], { radius: Math.min(43, 16 + memories.length), stroke: false, fillColor: '#ff805e', fillOpacity: .12, interactive: false }).addTo(layer)
        }
        const content = document.createElement('div'); content.className = 'street-photo-marker'
        const bubble = document.createElement('span'); bubble.className = 'street-original-pin'
        const image = document.createElement('img'); image.src = '/pin.png'; image.alt = ''; bubble.append(image)
        const count = document.createElement('small'); count.textContent = String(memories.length); bubble.append(count)
        const label = document.createElement('span'); label.className = 'street-pin-label'; label.textContent = memories[0].place
        content.append(bubble, label)
        const marker = L.marker([latitude, longitude], { icon: L.divIcon({ html: content, className: 'street-marker-wrapper', iconSize: [62, 76], iconAnchor: [31, 70] }), title: `${label.textContent}: ${memories.length} memories`, keyboard: true }).addTo(layer)
        marker.on('click', () => {
          setSelected(memories.map(memory => memory.id)); setShowList(true)
          setStreetView({ place: memories[0].place, latitude, longitude, source: point.source, precision: point.precision, memoryIds: memories.map(memory => memory.id) })
          instance.setView(origin, Math.max(instance.getZoom(), 13), { animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches })
        })
      }
    }
    paint(); instance.on('zoomend moveend', paint)
    return () => { instance.off('zoomend moveend', paint); layer.clearLayers() }
  }, [ready, query, glow, covers])
  useEffect(() => {
    if (!streetView) return
    const previous = document.activeElement as HTMLElement | null
    panoramaClose.current?.focus()
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setStreetView(null) }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); previous?.focus() }
  }, [streetView])
  function fitAll() { setSelected([]); map.current?.fitBounds(allBounds, { padding: [65, 65], maxZoom: 12 }) }
  function focusPlace(memoryId: string, candidate?: VenueCoordinate) {
    const memory = dateMemories.find(item => item.id === memoryId)
    if (!memory) return
    const point = candidate || venueFor(memory)
    setSelected([memoryId]); setShowList(true)
    if (!point) return
    setStreetView({ place: memory.place, latitude: point.latitude, longitude: point.longitude, source: point.source, precision: point.precision, memoryIds: [memoryId] })
    map.current?.setView([point.latitude, point.longitude], 16)
  }
  return <Surface className={`street-map-page ${embedded ? 'street-map-embedded' : ''}`} aria-label="Our dates street map"><div ref={mount} className="street-map-canvas" aria-label="Interactive street map. Use arrow keys to pan and plus or minus to zoom." />
    <div className="street-map-left"><div className="street-search-bar"><Link to="/home" aria-label="Back to our world"><ArrowLeft size={20} /></Link><label><span className="sr-only">Search our places, dates and memories</span><input value={query} onChange={event => { setQuery(event.target.value); setSelected([]); setShowList(true) }} placeholder="Search our memories" /></label>{query ? <button aria-label="Clear search" onClick={() => { setQuery(''); setSelected([]) }}><X size={18} /></button> : <Search size={19} />}</div><div className="street-map-chips"><button onClick={() => { setSelected([]); setShowList(value => !value) }} aria-expanded={showList}><MapPin size={14} /> {dateMemories.length} memories</button><button onClick={fitAll}><LocateFixed size={14} /> All places</button></div>
    {showList && <section className="street-memory-panel" aria-label="Place memories"><header><div><span>OUR LITTLE WORLD</span><h1>{selected.length === 1 ? dateMemories.find(memory => memory.id === selected[0])?.place : query ? 'Search results' : 'Our dates'}</h1><small>{visible.length} memories</small></div><button aria-label="Close memories" onClick={() => { setShowList(false); setSelected([]) }}><X size={19} /></button></header><p className="street-location-note">Pins use published or supplied coordinates. Precision notes identify area anchors; unresolved branches require a choice.</p><ul>{visible.map(memory => <li key={memory.id}><button className="street-memory-focus" onClick={() => focusPlace(memory.id)}>{covers[memory.date] && <img src={covers[memory.date]} alt="" loading="lazy" />}<div><time>{memory.date}</time><h2>{memory.place}</h2><p>{memory.note}</p><small className="street-coordinate-status">{venueFor(memory) ? `${venueFor(memory)!.latitude.toFixed(6)}, ${venueFor(memory)!.longitude.toFixed(6)} / ${venueFor(memory)!.precision}` : 'Location unresolved - not pinned'}</small></div></button>{venueFor(memory) && <a href={venueFor(memory)!.source} target="_blank" rel="noopener noreferrer">{venueFor(memory)!.provenance === 'user-provided' ? 'Supplied coordinate: map reference' : 'Coordinate source'} <ExternalLink size={12} /></a>}{venueAlternatives[memory.place.toLowerCase()]?.map(option => <button key={option.name} className="street-branch-choice" onClick={() => focusPlace(memory.id, option)}>{option.name} / {option.precision}</button>)}<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueFor(memory) ? `${venueFor(memory)!.latitude},${venueFor(memory)!.longitude}` : `${memory.place}, ${memoryLocations[memory.location].name}, India`)}`} target="_blank" rel="noopener noreferrer">Open in Google Maps <ExternalLink size={12} /></a></li>)}</ul>{!visible.length && <p className="street-no-results">No matching memories. Try a place name or date.</p>}</section>}
    </div><div className="street-map-controls"><button aria-label="Zoom in" onClick={() => map.current?.zoomIn()}><Plus size={21} /></button><button aria-label="Zoom out" onClick={() => map.current?.zoomOut()}><Minus size={21} /></button><button aria-label="Return to Delhi NCR" onClick={() => map.current?.fitBounds(delhiBounds, { padding: [35, 35] })}><LocateFixed size={20} /></button><button aria-label="Toggle memory glow" aria-pressed={glow} onClick={() => setGlow(value => !value)}><Layers size={20} /></button></div>
    <div className="street-map-caption">Our dates · Real streets, favorite memories</div>{tileError && <div className="street-map-error" role="alert">Some map tiles couldn’t load. Check your connection. <button onClick={() => window.location.reload()}>Retry</button></div>}{coverWarning && <div className="street-photo-warning">Photo previews are unavailable. Your written memories are still here.</div>}
    {streetView && createPortal(<div className="street-panorama-backdrop" onClick={event => { if (event.target === event.currentTarget) setStreetView(null) }}><section className="street-panorama-dialog" role="dialog" aria-modal="true" aria-labelledby="panorama-title"><header><div><span>OUR MEMORIES</span><h2 id="panorama-title">{streetView.place}</h2><p>{streetView.precision}</p></div><button ref={panoramaClose} onClick={() => setStreetView(null)} aria-label="Close memories"><X size={23} /></button></header><div className="street-panorama-content"><aside className="street-panorama-memories" aria-label="Memories at this pin"><span>THE DAYS WE KEPT</span>{dateMemories.filter(memory => streetView.memoryIds.includes(memory.id)).map(memory => <article key={memory.id} className="active"><button onClick={() => setStreetView(previous => previous ? { ...previous, place: memory.place } : null)}><time>{memory.date}</time><h3>{memory.place}</h3><p>{memory.note}</p></button></article>)}</aside></div></section></div>, document.body)}

  </Surface>
}
