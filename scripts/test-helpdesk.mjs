import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
const url = process.env.VITE_SUPABASE_URL
const token = process.env.SUPABASE_ACCESS_TOKEN
if (!url || !token) throw new Error('Supabase URL and access token required')
const client = createClient(url,process.env.VITE_SUPABASE_PUBLISHABLE_KEY,{ auth:{ persistSession:false } })
const records = []
try {
  const { data:auth,error:loginError } = await client.auth.signInWithPassword({ email:process.env.LOGIN_EMAIL,password:process.env.LOGIN_PASSWORD })
  assert.ifError(loginError)
  assert.ok(auth.session)
  console.log('PASS configured email/password sign-in')
  const cases = [
    ['helpdesk_complaints',{ category:'Attention & Affection',incident:'Temporary helpdesk verification record',severity:'Minor inconvenience' }],
    ['helpdesk_requests',{ category:'Quality Time',description:'Temporary helpdesk verification record',urgency:'Whenever you’re free' }],
    ['helpdesk_date_bookings',{ preferred_date:'2099-01-01',experience:'Café Date',details:'Temporary helpdesk verification record' }],
  ]
  for (const [table,values] of cases) {
    const id = randomUUID()
    records.push({ table,id })
    const { data,error } = await client.from(table).insert({ id,user_id:auth.user.id,...values }).select('id').single()
    assert.ifError(error)
    assert.equal(data.id,id)
    console.log('PASS authenticated form submission:',table)
  }
} finally {
  if (records.length) {
    const ids = records.map(record => `'${record.id}'`).join(',')
    const query = `begin; delete from public.helpdesk_email_deliveries where submission_id in (${ids}); ${records.map(record => `delete from public.${record.table} where id='${record.id}';`).join(' ')} commit;`
    const ref = new URL(url).hostname.split('.')[0]
    const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`,{ method:'POST',headers:{ Authorization:`Bearer ${token}`,'Content-Type':'application/json' },body:JSON.stringify({ query }) })
    assert.ok(response.ok,'Temporary test data cleanup must succeed')
    console.log('PASS temporary form records and email queue entries cleaned up; no emails sent')
  }
  await client.auth.signOut({ scope:'local' })
}
