import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Heart, RotateCcw } from 'lucide-react'
import { romeoChapters } from './romeo-data'
import manifest from './chapter-media.json'
import './romeo.css'
import { originalVideoUrl } from '../shared/media-delivery.mjs'

type Asset = { url: string; kind: string }
const assets: Record<string, Asset> = manifest
const years = ['2019', '2020', '2021', '2022–24', '2025', '2026']
function StoryMedia({ id, active, caption, title }: { id: string; active: boolean; caption?: string; title: string }) {
  const video = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)
  const asset = assets[id]
  useEffect(() => { if (video.current && !active) video.current.pause() }, [active])
  // Keep this very player mounted when moving from preload to visible playback.
  useEffect(() => { video.current?.load() }, [])
  if (!asset) return <p className="romeo-media-error">This memory is not available yet.</p>
  return <figure className={`romeo-media ${asset.kind === 'image' ? 'is-image' : ''}`}>
    {asset.kind === 'video' ? <video ref={video} src={originalVideoUrl(asset.url)} poster={assets[`${id}Poster`]?.url} preload="auto" controls={active} playsInline aria-label={caption || title} onError={() => setFailed(true)} /> : <a href={asset.url} target="_blank" rel="noreferrer" aria-label={`View full image: ${title}`}><img src={asset.url} alt={title} decoding="async" /></a>}
    {failed && <div className="romeo-media-error" role="alert">Couldn’t load this video. <button onClick={() => { setFailed(false); video.current?.load() }}><RotateCcw size={14} /> Retry</button></div>}
    {caption && <figcaption>{caption}</figcaption>}
  </figure>
}
export function RomeoPage() {
  const [chapter, setChapter] = useState(0)
  const [warmed, setWarmed] = useState<Set<number>>(() => new Set([0]))
  const heading = useRef<HTMLHeadingElement>(null)
  const switched = useRef(false)
  function warm(index: number) {
    if (index < 0 || index >= romeoChapters.length) return
    setWarmed(previous => previous.has(index) ? previous : new Set([...previous, index]))
  }
  function open(index: number) {
    if (index < 0 || index >= romeoChapters.length) return
    switched.current = true; warm(index); setChapter(index)
  }
  useEffect(() => {
    if (switched.current) {
      heading.current?.focus({ preventScroll: true })
      heading.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    }
    document.title = 'Jaysha singh'
  }, [chapter])
  const current = romeoChapters[chapter]
  return <main className="romeo-page"><header className="romeo-page-header"><Link to="/explore"><ArrowLeft size={17} /> Our world</Link><span>A VERY UNOFFICIAL LOVE STORY</span><Heart size={17} /></header>
    <div className="romeo-introduction"><span>FROM A COMPLIMENT TO A WHOLE LIFE</span><h1>Ek tha majnu<span>.</span></h1><h2>One girl. Eight chapters. One hopeless romantic</h2><p>Once upon a time, there was a perfectly normal boy. Then he came across a girl with a pretty smile, and things went slightly downhill from there.</p></div>
    <section className="romeo-book" aria-label="Eight chapters of our story">
      <nav className="romeo-years" aria-label="Story years">{years.map(year => {
        const first = romeoChapters.findIndex(item => item.year === year)
        return <button key={year} aria-current={current.year === year ? 'step' : undefined} onClick={() => open(first)} onPointerEnter={() => warm(first)} onFocus={() => warm(first)}><span className={current.year === year ? 'active' : years.indexOf(year) < years.indexOf(current.year) ? 'completed' : ''} /><strong>{year}</strong></button>
      })}</nav>
      <div className="romeo-chapter-card"><div className="romeo-chapter-topline"><span>CHAPTER {String(chapter + 1).padStart(2, '0')}</span><span>{current.date}</span></div><h2 ref={heading} tabIndex={-1}>{current.title}</h2><div className="romeo-chapter-copy">{current.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
        {romeoChapters.map((item, index) => warmed.has(index) && <div key={index} hidden={chapter !== index} className="romeo-chapter-media" aria-label={`${item.title} media`}>{item.media.map((media, mediaIndex) => <div key={media.id}>{item.media.length > 1 && <span className="romeo-video-label">VIDEO {mediaIndex + 1}</span>}<StoryMedia id={media.id} active={chapter === index} caption={media.caption} title={`${item.title}${item.media.length > 1 ? ` · Video ${mediaIndex + 1}` : ''}`} /></div>)}</div>)}
        {current.poem && <div className="romeo-poem"><span aria-hidden="true">♡</span>{current.poem.map(stanza => <p key={stanza}>{stanza}</p>)}<small>Not the end. Just the next page.</small></div>}
      </div>
      <div className="romeo-book-navigation"><button disabled={chapter === 0} onClick={() => open(chapter - 1)} onPointerEnter={() => warm(chapter - 1)} onFocus={() => warm(chapter - 1)}><ArrowLeft size={21} /> Previous</button><span>{String(chapter + 1).padStart(2, '0')} / 08</span>{chapter < 7 ? <button className="romeo-next" onClick={() => open(chapter + 1)} onPointerEnter={() => warm(chapter + 1)} onFocus={() => warm(chapter + 1)} onTouchStart={() => warm(chapter + 1)}>Next chapter <ArrowRight size={22} /></button> : <button className="romeo-next" onClick={() => open(0)}>Read it again <Heart size={20} /></button>}</div>
      <nav className="romeo-chapter-dots" aria-label="Choose a chapter">{romeoChapters.map((item, index) => <button key={item.title} aria-label={`Chapter ${index + 1}: ${item.title}`} aria-current={index === chapter ? 'step' : undefined} onClick={() => open(index)} onFocus={() => warm(index)} onPointerEnter={() => warm(index)}>{index + 1}</button>)}</nav>
    </section><footer className="romeo-footer">Some stories don’t need an ending. Just another day together.</footer>
  </main>
}
