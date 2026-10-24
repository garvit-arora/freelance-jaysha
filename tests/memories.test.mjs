import test from 'node:test'
import assert from 'node:assert/strict'
import { dateMemories, memoryLocations } from '../src/dates-memories.ts'
import { validDate } from '../shared/dates.mjs'

test('all 63 supplied memories have unique IDs, real dates, and a pin location', () => {
  assert.equal(dateMemories.length, 63)
  assert.equal(new Set(dateMemories.map(memory => memory.id)).size, 63)
  for (const memory of dateMemories) {
    assert.ok(validDate(memory.date), memory.date)
    assert.ok(memoryLocations[memory.location], memory.place)
  }
})
test('different memories on the same date are retained separately', () => {
  assert.equal(dateMemories.filter(memory => memory.date === '27-07-2022').length, 2)
  assert.equal(dateMemories.filter(memory => memory.date === '08-11-2024').length, 2)
  assert.equal(dateMemories.filter(memory => memory.date === '05-06-2026').length, 2)
})
test('attached captions and corrected places are preserved', () => {
  assert.ok(dateMemories.every(memory => memory.note.trim().length > 0))
  assert.equal(dateMemories[0].note, 'Where it all started with a hug')
  assert.equal(dateMemories[1].place, 'Mayfield Gardens sector 51 gurgaon')
  assert.equal(dateMemories[1].location, 'gurgaon')
  assert.equal(dateMemories.find(memory => memory.date === '21-02-2025').place, 'Divya Jyoti apartments')
  assert.equal(dateMemories.find(memory => memory.date === '19-10-2025').location, 'murthal')
  assert.equal(dateMemories.at(-1).date, '21-10-2026')
})
