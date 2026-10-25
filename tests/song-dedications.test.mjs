import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { songEmbedUrl } from '../shared/song-embed.mjs'
const songs = JSON.parse(await readFile(new URL('../src/song-dedications.json', import.meta.url), 'utf8'))
test('all 50 supplied song videos are retained with unique valid IDs', () => {
  assert.equal(songs.length, 50)
  assert.equal(new Set(songs.map(song => song.id)).size, 50)
  for (const song of songs) assert.match(song.id, /^[\w-]{11}$/)
})
test('dedication clips use absolute YouTube start and end times', () => {
  for (const [id, start, end] of [['prYPG-05udg', 45, 85], ['XDby7mfJmPE', 198, 245]]) {
    const song = songs.find(item => item.id === id)
    const url = new URL(songEmbedUrl(song))
    assert.equal(url.searchParams.get('start'), String(start))
    assert.equal(url.searchParams.get('end'), String(end))
  }
})
