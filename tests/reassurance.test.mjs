import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { shuffleDeck } from '../shared/shuffle-deck.mjs'

test('all 100 supplied reassurances are available without repeats in a cycle', async () => {
  const messages = JSON.parse(await readFile(new URL('../src/reassurance-messages.json', import.meta.url), 'utf8'))
  assert.equal(messages.length, 100)
  assert.equal(new Set(messages).size, 100)
  const deck = shuffleDeck(messages.length)
  assert.equal(new Set(deck).size, 100)
  assert.deepEqual([...deck].sort((a, b) => a - b), Array.from({ length: 100 }, (_, i) => i))
})

test('new shuffle does not immediately repeat the previous reassurance', () => {
  const initial = shuffleDeck(100, -1, () => 0)
  const next = shuffleDeck(100, initial[0], () => 0)
  assert.notEqual(next[0], initial[0])
  assert.equal(new Set(next).size, 100)
})
