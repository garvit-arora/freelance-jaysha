import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
const url = process.env.VITE_SUPABASE_URL
const token = process.env.SUPABASE_ACCESS_TOKEN
const client = createClient(url,process.env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false}})
const records = []
try {
  const cases = [
    ['complaint','helpdesk_complaints',{category:'Attention & Affection',incident:'Temporary guest submission verification',severity:'Minor inconvenience'}],
    ['request','helpdesk_requests',{category:'Quality Time',description:'Temporary guest submission verification',urgency:'Whenever you’re free'}],
    ['date-booking','helpdesk_date_bookings',{preferred_date:'2099-01-01',experience:'Café Date',details:'Temporary guest submission verification'}],
  ]
  for (const [kind] of cases) {
    const denied = await client.functions.invoke('helpdesk-submit',{body:{kind}})
    assert.ok(denied.error,'Guests must not submit')
  }
  const {error:loginError} = await client.auth.signInWithPassword({email:process.env.LOGIN_EMAIL,password:process.env.LOGIN_PASSWORD})
  assert.ifError(loginError)
  for (const [kind,table,values] of cases) {
    const id = randomUUID(),receipt = randomUUID()+randomUUID()
    records.push({table,id})
    const body = {kind,id,receipt,values}
    const first = await client.functions.invoke('helpdesk-submit',{body})
    assert.ifError(first.error)
    assert.equal(first.data.id,id)
    const retry = await client.functions.invoke('helpdesk-submit',{body})
    assert.ifError(retry.error)
    assert.equal(retry.data.id,id)
    console.log('PASS signed-in submission and safe retry:',kind)
  }
  await client.auth.signOut({scope:'local'})
  const read = await client.from('helpdesk_complaints').select('id')
  assert.ok(read.error,'Guest database reads must remain blocked')
  const badReceipt = await client.functions.invoke('helpdesk-email',{body:{kind:'complaint',submissionId:records[0].id,receipt:randomUUID()+randomUUID()}})
  assert.ok(badReceipt.error,'Incorrect receipt must not send mail')
  console.log('PASS private records and receipt protection; no confirmation emails sent')
} finally {
  const ids = records.map(row => `'${row.id}'`).join(',')
  if (ids) {
    const query = `begin; delete from public.helpdesk_email_deliveries where submission_id in (${ids}); ${records.map(row => `delete from public.${row.table} where id='${row.id}';`).join(' ')} commit;`
    const ref = new URL(url).hostname.split('.')[0]
    const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({query})})
    assert.ok(response.ok,'Temporary records must be cleaned up')
    console.log('PASS temporary guest records cleaned up')
  }
}
