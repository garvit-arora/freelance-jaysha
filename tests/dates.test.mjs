import test from 'node:test'
import assert from 'node:assert/strict'
import { validDate, validEvent } from '../shared/dates.mjs'

test('date routes require real calendar dates in DD-MM-YYYY format', () => {
  for (const date of ['19-04-2026', '29-02-2024', '01-01-1900']) assert.equal(validDate(date), true)
  for (const date of ['31-04-2026', '29-02-2026', '2026-04-19', '19-4-2026', '00-04-2026', '01-13-2026', '../calendar', '01-01-0000']) assert.equal(validDate(date), false)
})
test('stored events require date, text, and HTTPS ImageKit URLs', () => {
  const event = { date: '19-04-2026', title: 'A memory', description: 'Our story', images: [{ url: 'https://ik.imagekit.io/example/photo.jpg', alt: 'Us' }] }
  assert.equal(validEvent(event), true)
  assert.equal(validEvent({ ...event, date: '31-04-2026' }), false)
  assert.equal(validEvent({ ...event, title: ' ' }), false)
  for (const url of ['javascript:alert(1)', 'http://ik.imagekit.io/photo.jpg', 'https://ik.imagekit.io.evil.example/photo.jpg']) {
    assert.equal(validEvent({ ...event, images: [{ url, alt: 'Us' }] }), false)
  }
})
