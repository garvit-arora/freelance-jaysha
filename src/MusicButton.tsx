import { createPortal } from 'react-dom'
import { Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import welcomeSongs from './welcome-song-audio.json'
import compilationSongs from './song-clips.json'
import downloadedSongs from './shorts-audio.json'
import additionalSongs from './additional-song-audio.json'
import { shuffleDeck } from '../shared/shuffle-deck.mjs'

const songs = [...compilationSongs, ...downloadedSongs, ...additionalSongs]
export const dedicationCount = songs.length

// Shared audio controller for the welcome song and dedication button.
export function MusicButton() {
  const location = useLocation()
  const isWelcome = location.pathname === '/' && location.hash !== '#explore'
  const welcomeSong = welcomeSongs[0]?.url || ''
  const [playing, setPlaying] = useState(false)
  const route = useRef(location.pathname)
  route.current = location.pathname
  const [error, setError] = useState('')
  const audio = useRef<HTMLAudioElement>(null)
  const deck = useRef<number[]>([])
  const previous = useRef(-1)
  const request = useRef(0)
  async function toggleWelcomeSong() {
    const player = audio.current
    if (!isWelcome || !player || !welcomeSong) return
    if (!player.paused) { request.current++; player.pause(); return }
    const currentRequest = ++request.current
    setError('')
    if (player.getAttribute('src') !== welcomeSong) player.src = welcomeSong
    try { await player.play() } catch {
      if (request.current === currentRequest) setError('Could not play the welcome song. Please try again.')
    }
  }
  useEffect(() => {
    if (location.pathname !== '/magic-buttons') {
      request.current++
      audio.current?.pause()
    }
  }, [location.pathname])
  useEffect(() => {
    const player = audio.current
    const stop = () => { request.current++; player?.pause() }
    const play = () => {
      if (route.current !== '/magic-buttons' || !player || !songs.length) return
      if (!deck.current.length) deck.current = shuffleDeck(songs.length, previous.current)
      const pick = deck.current.shift()!
      previous.current = pick
      const currentRequest = ++request.current
      document.querySelectorAll('audio, video').forEach(element => (element as HTMLMediaElement).pause())
      setError('')
      player.src = songs[pick].url
      player.play().catch(() => {
        if (request.current === currentRequest) setError('Could not play this song. Click the Song Button to try another.')
      })
    }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') stop() }
    window.addEventListener('archive-play-compilation-song', play)
    window.addEventListener('archive-stop-music', stop)
    document.addEventListener('keydown', escape)
    return () => {
      stop()
      window.removeEventListener('archive-play-compilation-song', play)
      window.removeEventListener('archive-stop-music', stop)
      document.removeEventListener('keydown', escape)
    }
  }, [])
  useEffect(() => {
    if (!isWelcome || !welcomeSong || !audio.current) return
    const player = audio.current
    let live = true
    player.src = welcomeSong
    const start = () => {
      if (!live || !player.paused) return
      const currentRequest = ++request.current
      player.play().then(() => { if (live) setError('') }).catch(error => {
        // Sound autoplay requires interaction in browsers that block it.
        if (live && request.current === currentRequest && error?.name !== 'NotAllowedError' && error?.name !== 'AbortError') {
          setError('Could not play the welcome song. Click anywhere to try again.')
        }
      })
    }
    const click = (event: MouseEvent) => {
      if ((event.target as Element)?.closest?.('.site-music')) return
      start()
    }
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') start()
    }
    start()
    document.addEventListener('click', click)
    document.addEventListener('keydown', keyboard)
    return () => {
      live = false
      document.removeEventListener('click', click)
      document.removeEventListener('keydown', keyboard)
    }
  }, [isWelcome, welcomeSong])
  return <><audio ref={audio} hidden preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} /><span className="sr-only" role="status">{error}</span>{isWelcome && createPortal(<div className="site-music"><button type="button" onClick={toggleWelcomeSong} disabled={!welcomeSong} aria-label={!welcomeSong ? 'Welcome song coming soon' : playing ? 'Pause welcome song' : 'Play welcome song'} aria-pressed={playing} title={!welcomeSong ? 'Welcome song coming soon' : playing ? 'Pause welcome song' : 'Play welcome song'}>{playing ? <Volume2 size={20} /> : <VolumeX size={20} />}</button></div>, document.body)}</>
}
