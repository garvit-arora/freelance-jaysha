import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
const manifest = JSON.parse(await readFile(new URL('../src/shorts-audio.json', import.meta.url), 'utf8'))
const supplied = JSON.parse(await readFile(new URL('../src/song-dedications.json', import.meta.url), 'utf8'))

test('downloaded MP3 entries reference supplied Shorts and real audio files', async () => {
  const ids = new Set(supplied.filter(song => song.short).map(song => song.id))
  assert.equal(new Set(manifest.map(song => song.id)).size, manifest.length)
  for (const song of manifest) {
    assert.ok(ids.has(song.id))
    assert.equal(song.url, `/shorts-audio/${song.id}.mp3`)
    assert.ok((await stat(new URL(`../public${song.url}`, import.meta.url))).size > 1000)
  }
})
