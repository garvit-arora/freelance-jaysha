import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dateMemories } from '../src/dates-memories.ts'
const coordinates = JSON.parse(await readFile(new URL('../src/venue-coordinates.json', import.meta.url), 'utf8'))
test('venue coordinates have provenance and are bound to actual named memories', () => {
 const names = new Set(dateMemories.map(memory => memory.place.toLowerCase()))
 for (const [key, place] of Object.entries(coordinates)) {
  assert.ok(names.has(key), key)
  assert.ok(Number.isFinite(place.latitude) && Math.abs(place.latitude) <= 90, key)
  assert.ok(Number.isFinite(place.longitude) && Math.abs(place.longitude) <= 180, key)
  assert.equal(new URL(place.source).protocol, 'https:')
  assert.ok(place.verifiedAt && place.precision)
 }
 assert.equal(coordinates['rohini sector 18 metro station'].longitude, 77.13985)
 assert.notEqual(coordinates['boho bistro vaishali'].longitude, coordinates['sector 4 vaishali lenskart.com'].longitude)
 assert.equal(coordinates.radisson.latitude, 28.415805)
 assert.equal(coordinates.manali.latitude, 32.2455)
 assert.equal(coordinates.nmacc, undefined)
 assert.equal(coordinates['shri ram centre for performing arts, mandi house'].longitude, 77.23298)
 assert.equal(coordinates['park plaza'], undefined)
 assert.equal(coordinates['nsp tasteland'].precision, 'NSP neighbourhood only')
})

test('all attached memories have pins including entries 25, 46 and corrected Indirapuram school', () => {
 const aliases = {'ramprastha vaishali':'ramprastha','park plaza':'park plaza shahdara','yellow bowl':'yellow bowl rohini'}
 for (const memory of dateMemories) {
  const key = memory.place.toLowerCase()
  assert.ok(coordinates[aliases[key] || key], `${memory.id}: ${memory.place}`)
 }
 assert.equal(coordinates['department of political science'].latitude, 28.68731)
 assert.equal(coordinates['vada pav ghaziabad'].longitude, 77.341185)
 assert.equal(coordinates['presidium school'].name, 'Presidium School, Indirapuram')
 assert.equal(coordinates['presidium school'].longitude, 77.369436)
})
