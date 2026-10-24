import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Heart, LogOut, Plus, Trash2, X } from 'lucide-react'
import { cloud, listMedia, mediaAction, uploadMedia, useSession } from './lib/cloud'
import type { Media } from './lib/cloud'
import { validDate } from '../shared/dates.mjs'
import { NotFound } from './Calendar'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './gallery.css'

export function DateGallery() {
  const { date = '' } = useParams()
  const navigate = useNavigate()
  const { session, loading } = useSession()
  const [items, setItems] = useState<Media[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [viewer, setViewer] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [progress, setProgress] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const picker = useRef<HTMLInputElement>(null)
  const closeViewer = useRef<HTMLButtonElement>(null)
  const visible = items.filter(item => (!favoritesOnly || (item.favorite && session?.user.id === item.owner_id)) && item.name.toLowerCase().includes(search.toLowerCase()))
  const activeIndex = visible.findIndex(item => item.id === viewer)
  const active = visible[activeIndex]
  useEffect(() => {
    let live = true
    if (!validDate(date)) { setFetching(false); return }
    setFetching(true); setItems([]); setSelected([]); setViewer(null); setSearch(''); setFavoritesOnly(false); setError('')
    listMedia(date).then(data => { if (live) setItems(data) }).catch(error => { if (live) setError(error.message) }).finally(() => { if (live) setFetching(false) })
    return () => { live = false }
  }, [session?.user.id, date])
  useEffect(() => {
    if (!viewer) return
    const previous = document.activeElement as HTMLElement | null
    closeViewer.current?.focus()
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setViewer(null)
      if (event.key === 'ArrowRight' && visible[activeIndex + 1]) setViewer(visible[activeIndex + 1].id)
      if (event.key === 'ArrowLeft' && visible[activeIndex - 1]) setViewer(visible[activeIndex - 1].id)
      if (event.key === 'Tab') {
        const nodes = Array.from(document.querySelectorAll<HTMLElement>('.photo-viewer button, .photo-viewer a, .photo-viewer video'))
        const index = nodes.indexOf(document.activeElement as HTMLElement)
        event.preventDefault(); nodes[(index + (event.shiftKey ? -1 : 1) + nodes.length) % nodes.length]?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => { document.removeEventListener('keydown', handler); previous?.focus() }
  }, [viewer, activeIndex, visible.length])
  useEffect(() => { ScrollTrigger.refresh() }, [fetching, visible.length, error])
  if (!validDate(date)) return <NotFound />
  if (loading) return <main className="photos-page"><p role="status">Opening your archive…</p></main>
  const canEdit = (item: Media) => session?.user.id === item.owner_id
  const toggle = (id: string) => setSelected(values => values.includes(id) ? values.filter(value => value !== id) : [...values, id])
  async function upload(files: FileList | null) {
    if (!files?.length || busy) return
    setBusy(true); setError('')
    const failures: string[] = []
    for (const [index, file] of Array.from(files).entries()) {
      try {
        const saved = await uploadMedia(file, date, value => setProgress(`${index + 1}/${files.length} · ${file.name} · ${value}%`))
        setItems(previous => [saved, ...previous.filter(item => item.id !== saved.id)])
      } catch (error) { failures.push(`${file.name}: ${error instanceof Error ? error.message : 'Upload failed'}`) }
    }
    setError(failures.join('\n')); setProgress(failures.length ? 'Some files could not be saved.' : 'All uploads saved.'); setBusy(false)
    if (picker.current) picker.current.value = ''
  }
  async function remove() {
    setConfirmDelete(false); setBusy(true); setError('')
    const failures: string[] = []
    for (const id of selected) {
      try { await mediaAction({ action: 'delete', id }); setItems(values => values.filter(item => item.id !== id)); setSelected(values => values.filter(value => value !== id)); if (viewer === id) setViewer(null) }
      catch { failures.push('A file could not be deleted. Select it and try again.') }
    }
    setError(failures.join('\n')); setBusy(false)
  }
  async function favorite(item: Media) {
    if (!cloud) return
    const { error } = await cloud.from('memory_media').update({ favorite: !item.favorite }).eq('id', item.id)
    if (error) setError(error.message)
    else setItems(values => values.map(value => value.id === item.id ? { ...value, favorite: !value.favorite } : value))
  }
  return <main className="photos-page">
    <header className="photos-header"><Link to="/calendar" aria-label="Back to calendar"><ArrowLeft /></Link><div><span>Our memories</span><h1>{date}</h1></div><label className="photos-search"><span className="sr-only">Search this day?s photos and videos</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search photos and videos" /></label>{session && <button onClick={() => cloud?.auth.signOut()} aria-label="Sign out"><LogOut size={20} /></button>}</header>
    <div className="photos-toolbar"><div><button aria-pressed={!favoritesOnly} onClick={() => { setFavoritesOnly(false); setSelected([]) }}>Photos</button>{session && <button aria-pressed={favoritesOnly} onClick={() => { setFavoritesOnly(true); setSelected([]) }}><Heart size={17} /> Favorites</button>}</div><button className="photos-upload" disabled={busy} onClick={() => session ? picker.current?.click() : navigate(`/login?next=${encodeURIComponent(`/calendar/${date}`)}`)}><Plus size={18} /> {session ? 'Upload' : 'Sign in to upload'}</button><input ref={picker} type="file" accept="image/*,video/*" multiple hidden onChange={event => upload(event.target.files)} /></div>
    {selected.length > 0 && <div className="photos-selection"><button onClick={() => setSelected([])} aria-label="Clear selection"><X size={18} /></button><span>{selected.length} selected</span><button disabled={busy} onClick={() => setConfirmDelete(true)}><Trash2 size={18} /> Delete</button><button onClick={() => setSelected(visible.filter(canEdit).map(item => item.id))}>Select all</button></div>}
    {progress && <p className="photos-message" role="status">{progress}</p>}{error && <p className="photos-message photos-error" role="alert">{error}</p>}
    {fetching ? <p role="status">Loading your photos?</p> : error && !items.length ? <p className="photos-load-error">Unable to load this day. <button onClick={() => window.location.reload()}>Try again</button></p> : !visible.length ? <section className="photos-empty"><div aria-hidden="true">?</div><h2>{search ? 'No matching photos' : favoritesOnly ? 'No favorites on this day' : 'No Dates on this day'}</h2><p>{search ? 'Try another filename.' : favoritesOnly ? 'Tap the heart on one of your photos or videos to save it here.' : session ? 'Add photos and videos for this day.' : 'Login to add images for here.'}</p>{!search && !favoritesOnly && (session ? <button disabled={busy} onClick={() => picker.current?.click()}>Add photos & videos</button> : <Link to={`/login?next=${encodeURIComponent(`/calendar/${date}`)}`}>Login</Link>)}</section> : <div className="photos-grid">{visible.map(item => <article key={item.id} className={selected.includes(item.id) ? 'selected' : ''}><button className="photo-open" onClick={() => setViewer(item.id)} aria-label={`Open ${item.name}`}><img src={item.thumbnail_url || item.url} alt={item.name} loading="lazy" onLoad={() => ScrollTrigger.refresh()} />{item.kind === 'video' && <span className="video-badge">▶ Video</span>}</button>{canEdit(item) && <input type="checkbox" aria-label={`Select ${item.name}`} checked={selected.includes(item.id)} onChange={() => toggle(item.id)} />}{canEdit(item) && <button className="photo-favorite" onClick={() => favorite(item)} aria-label={item.favorite ? 'Remove favorite' : 'Add favorite'}><Heart size={18} fill={item.favorite ? 'currentColor' : 'none'} /></button>}</article>)}</div>}
    {active && createPortal(<div className="photo-viewer" role="dialog" aria-modal="true" aria-label={active.name}><header><button ref={closeViewer} onClick={() => setViewer(null)} aria-label="Close viewer"><X /></button><span>{active.name}</span>{canEdit(active) && <button onClick={() => favorite(active)} aria-label="Toggle favorite"><Heart fill={active.favorite ? 'currentColor' : 'none'} /></button>}<a href={active.url} target="_blank" rel="noreferrer" download={active.name} aria-label="Open original or download"><Download /></a>{canEdit(active) && <button disabled={busy} onClick={() => { setSelected([active.id]); setViewer(null); setConfirmDelete(true) }} aria-label="Delete"><Trash2 /></button>}</header><div className="photo-viewer-body"><button disabled={activeIndex === 0} onClick={() => setViewer(visible[activeIndex - 1].id)} aria-label="Previous"><ChevronLeft /></button>{active.kind === 'video' ? <video key={active.id} src={active.url} controls autoPlay playsInline /> : <img src={active.url} alt={active.name} />}<button disabled={activeIndex === visible.length - 1} onClick={() => setViewer(visible[activeIndex + 1].id)} aria-label="Next"><ChevronRight /></button></div><footer>{activeIndex + 1} of {visible.length} · {new Date(active.created_at).toLocaleString()}</footer></div>, document.body)}
    {confirmDelete && createPortal(<div className="delete-backdrop"><section role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><h2 id="delete-title">Delete {selected.length} {selected.length === 1 ? 'item' : 'items'}?</h2><p>These files will be permanently removed from ImageKit and your archive.</p><button autoFocus onClick={() => setConfirmDelete(false)}>Cancel</button><button onClick={remove}>Delete permanently</button></section></div>, document.body)}
  </main>
}
