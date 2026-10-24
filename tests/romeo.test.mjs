import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { romeoChapters } from '../src/romeo-data.ts'
const manifest = JSON.parse(await readFile(new URL('../src/chapter-media.json', import.meta.url), 'utf8'))
test('eight chapters retain all nine supplied media files and the ending poem', () => {
 assert.equal(romeoChapters.length, 8)
 assert.deepEqual(romeoChapters.map(chapter => chapter.media.length), [1, 1, 1, 1, 1, 3, 1, 0])
 assert.equal(romeoChapters[7].poem.length, 4)
 for (const chapter of romeoChapters) for (const media of chapter.media) {
  assert.ok(manifest[media.id], media.id)
  assert.equal(new URL(manifest[media.id].url).protocol, 'https:')
  assert.equal(new URL(manifest[media.id].url).hostname, 'ik.imagekit.io')
  if (manifest[media.id].kind === 'video') {
   assert.ok(manifest[media.id].url.endsWith('.mp4'))
   assert.ok(manifest[media.id+'Poster'])
   assert.ok(manifest[media.id].bytes < 100 * 1024 * 1024)
  }
 }
})
