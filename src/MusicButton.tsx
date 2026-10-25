import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import introSongs from './song-clips.json'
import { Volume2, VolumeX } from 'lucide-react'
import songs from './shorts-audio.json'
import { shuffleDeck } from '../shared/shuffle-deck.mjs'

export function MusicButton() {
  const location = useLocation()
  const onIntro = location.pathname === '/' && location.hash !== '#explore'
  const introDeck = useRef<number[]>([])
  const previousIntro = useRef(-1)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')
  const audio = useRef<HTMLAudioElement>(null)
  const deck = useRef<number[]>([])
  const previous = useRef(-1)
  const request = useRef(0)
  function next(fromIntro = onIntro) {
    const collection = fromIntro ? introSongs : songs
    const bag = fromIntro ? introDeck : deck
    const last = fromIntro ? previousIntro : previous
    if (!audio.current || !collection.length) return
    if (!bag.current.length) bag.current = shuffleDeck(collection.length, last.current)
    const pick = bag.current.shift()!
    last.current = pick
    const currentRequest = ++request.current
    document.querySelectorAll('audio, video').forEach(element => (element as HTMLMediaElement).pause())
    setError('')
    audio.current.src = collection[pick].url
    audio.current.play().catch(() => {
      if (request.current === currentRequest) setError('Could not play this song. Tap the speaker to try another.')
    })
  }
  useEffect(() => {
    const player = audio.current
    const startIntro = () => next(true)
    window.addEventListener('archive-play-compilation-song', startIntro)
    const stop = () => { request.current++; player?.pause() }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') stop() }
    window.addEventListener('archive-stop-music', stop)
    document.addEventListener('keydown', escape)
    return () => {
      stop()
      window.removeEventListener('archive-play-compilation-song', startIntro)
      window.removeEventListener('archive-stop-music', stop)
      document.removeEventListener('keydown', escape)
    }
  }, [])
  return createPortal(<div className="site-music">
    <audio ref={audio} hidden preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
    <button type="button" onClick={() => next()} aria-label={playing ? 'Play another song' : 'Play a random song'} title={playing ? 'Play another song (Escape to stop)' : 'Play a random song'}>{playing ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>
    <span className="sr-only" role="status">{error}</span>
  </div>, document.body)
}
