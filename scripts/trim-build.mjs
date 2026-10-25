import { rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
// Originals remain in public/chapters; playback uses the uploaded ImageKit copies.
const root = fileURLToPath(new URL('../dist/', import.meta.url))
const target = path.resolve(root, 'chapters')
if (path.relative(root, target) !== 'chapters') throw new Error('Unexpected build cleanup target')
await rm(target, { recursive: true, force: true })
console.log('Excluded local chapter originals from the web build (media is hosted on ImageKit).')

for (const file of ['song-videos.MP4', 'song-videos.mp4']) {
  const original = path.resolve(root, file)
  if (path.dirname(original) !== path.resolve(root)) throw new Error('Unexpected source video path')
  await rm(original, { force: true })
}

const audioOriginals = path.resolve(root, 'song-clips')
if (path.relative(root, audioOriginals) !== 'song-clips') throw new Error('Unexpected audio source path')
await rm(audioOriginals, { recursive: true, force: true })
