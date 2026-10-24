import { rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
// Originals remain in public/chapters; playback uses the uploaded ImageKit copies.
const root = fileURLToPath(new URL('../dist/', import.meta.url))
const target = path.resolve(root, 'chapters')
if (path.relative(root, target) !== 'chapters') throw new Error('Unexpected build cleanup target')
await rm(target, { recursive: true, force: true })
console.log('Excluded local chapter originals from the web build (media is hosted on ImageKit).')
