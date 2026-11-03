import test from 'node:test'
import assert from 'node:assert/strict'
import { canSendSubmission } from '../supabase/functions/helpdesk-email/delivery-policy.mjs'

test('email approval permits only new submissions and rejects missing timestamps', () => {
  assert.equal(canSendSubmission('2026-11-03T13:49:15.999Z'), false)
  assert.equal(canSendSubmission('2026-11-03T13:49:16Z'), true)
  assert.equal(canSendSubmission('2026-11-04T00:00:00Z'), true)
  assert.equal(canSendSubmission(undefined), false)
  assert.equal(canSendSubmission('invalid'), false)
})
