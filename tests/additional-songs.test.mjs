import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
const input = JSON.parse(await readFile(new URL('../src/additional-song-dedications.json', import.meta.url), 'utf8'))
const audio = JSON.parse(await readFile(new URL('../src/additional-song-audio.json', import.meta.url), 'utf8'))

test('additional dedications retain 38 Shorts and all three timed excerpts', () => {
  assert.equal(input.filter(song => song.short).length, 38)
  assert.equal(input.filter(song => !song.short).length, 3)
  assert.deepEqual(input.find(song => song.id === '9cSi5bt9MtY'), { id: '9cSi5bt9MtY', short: false, start: 26, end: 80 })
})

test('all seven November additions have playable audio references', () => {
  for (const id of ['Cbo24gdzxxE','DDZOjzVoApQ','SSdN62DdaUA','Q19o2MYQjGc','jrEMF5TuHOE','P821lRU0aiQ','kxaIKJxoJ9I']) {
    assert.ok(input.some(song => song.id === id && song.short))
    assert.ok(audio.some(song => song.id === id && song.url === `/shorts-audio/${id}.mp3`))
  }
})
test('new downloaded audio references supplied songs and valid MP3 files', async () => {
  for (const song of audio) {
    assert.ok(input.some(item => item.id === song.id))
    assert.ok((await stat(new URL(`../public${song.url}`, import.meta.url))).size > 1000)
  }
})
