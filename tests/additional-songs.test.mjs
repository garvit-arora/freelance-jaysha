import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
const input = JSON.parse(await readFile(new URL('../src/additional-song-dedications.json', import.meta.url), 'utf8'))
const audio = JSON.parse(await readFile(new URL('../src/additional-song-audio.json', import.meta.url), 'utf8'))

test('new dedications include 23 Shorts and the requested 54 second excerpt', () => {
  assert.equal(input.filter(song => song.short).length, 23)
  assert.deepEqual(input.find(song => !song.short), { id: '9cSi5bt9MtY', short: false, start: 26, end: 80 })
})
test('new downloaded audio references supplied songs and valid MP3 files', async () => {
  for (const song of audio) {
    assert.ok(input.some(item => item.id === song.id))
    assert.ok((await stat(new URL(`../public${song.url}`, import.meta.url))).size > 1000)
  }
})
