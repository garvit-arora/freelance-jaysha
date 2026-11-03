import test from 'node:test'
import assert from 'node:assert/strict'
import { helpdeskEmail } from '../supabase/functions/helpdesk-email/templates.mjs'
test('complaint email includes the saved category, incident and severity', () => {
  const { message } = helpdeskEmail('complaint',{ category:'Memory & Forgetfulness',incident:'Forgot our plan',severity:'Minor inconvenience' })
  assert.ok(message.includes('* Complaint category: Memory & Forgetfulness'))
  assert.ok(message.includes('* Description: Forgot our plan'))
  assert.ok(message.includes('* Severity: Minor inconvenience'))
  assert.ok(message.includes('Management is currently being handled by the accused himself.'))
})
test('request email retains the selected urgency and supplied closing', () => {
  const { message } = helpdeskEmail('request',{ category:'Quality Time',description:'A walk together',urgency:'Whenever you’re free' })
  assert.ok(message.includes('* Priority: Whenever you’re free'))
  assert.ok(message.includes('* Description: A walk together'))
  assert.ok(message.endsWith('Your Personal Boyfriend\nGirlfriend Helpdesk'))
})
test('date email contains the date, experience, optional notes and reservation caveat', () => {
  const { message } = helpdeskEmail('date-booking',{ preferred_date:'2026-11-08',experience:'Café Date',details:'' })
  assert.ok(message.includes('* Preferred date: 2026-11-08'))
  assert.ok(message.includes('* Special requests: None specified'))
  assert.ok(message.includes('not yet a confirmed reservation'))
  assert.ok(message.includes('❤️'))
  assert.throws(() => helpdeskEmail('other',{}))
})
