import 'dotenv/config'
import { readFile } from 'node:fs/promises'
const token = process.env.SUPABASE_ACCESS_TOKEN
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
if (!token || !url) throw new Error('Supabase access token and URL are required')
const ref = new URL(url).hostname.split('.')[0]
async function query(sql) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method:'POST', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body:JSON.stringify({ query:sql }),
  })
  if (!response.ok) throw new Error(`Helpdesk schema request failed (${response.status})`)
  return response.json()
}
await query(await readFile('supabase/migrations/202611020001_helpdesk_complaints.sql', 'utf8'))
await query(await readFile('supabase/migrations/202611020002_complaint_categories.sql', 'utf8'))
await query(await readFile('supabase/migrations/202611020003_helpdesk_requests.sql', 'utf8'))
const [result] = await query("select relrowsecurity as secured, (select count(*) from pg_policies where schemaname='public' and tablename='helpdesk_complaints') as policies from pg_class where oid='public.helpdesk_complaints'::regclass;")
if (!result?.secured || Number(result.policies) !== 2) throw new Error('Helpdesk security verification failed')
console.log('Complaint storage created; row security and both access policies verified.')

const [requests] = await query("select relrowsecurity as secured, (select count(*) from pg_policies where schemaname='public' and tablename='helpdesk_requests') as policies from pg_class where oid='public.helpdesk_requests'::regclass;")
if (!requests?.secured || Number(requests.policies) !== 2) throw new Error('Request security verification failed')
console.log('Request storage created; row security and both access policies verified.')

await query(await readFile('supabase/migrations/202611020004_helpdesk_date_bookings.sql', 'utf8'))
await query(await readFile('supabase/migrations/202611020005_date_experiences.sql', 'utf8'))
const [bookings] = await query("select relrowsecurity as secured, (select count(*) from pg_policies where schemaname='public' and tablename='helpdesk_date_bookings') as policies from pg_class where oid='public.helpdesk_date_bookings'::regclass;")
if (!bookings?.secured || Number(bookings.policies) !== 2) throw new Error('Date booking security verification failed')
console.log('Date booking storage created; row security and both access policies verified.')

await query(await readFile('supabase/migrations/202611020006_helpdesk_email_deliveries.sql', 'utf8'))
console.log('Private email delivery queue and submission triggers applied.')

await query(await readFile('supabase/migrations/202611030001_guest_helpdesk.sql','utf8'))
console.log('Guest submissions enabled through server functions; direct public table access remains denied.')
