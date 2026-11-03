import { createClient } from 'npm:@supabase/supabase-js@2'
import { helpdeskEmail } from './templates.mjs'
import { canSendSubmission } from './delivery-policy.mjs'
const cors = { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods':'POST, OPTIONS' }
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers:{ ...cors, 'Content-Type':'application/json' } })
const tables = { complaint:'helpdesk_complaints', request:'helpdesk_requests', 'date-booking':'helpdesk_date_bookings' }
Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { headers:cors })
  if (request.method !== 'POST') return reply({ error:'Method not allowed' },405)
  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const authorization = request.headers.get('Authorization') || ''
    const client = createClient(url,Deno.env.get('SUPABASE_ANON_KEY')!, { global:{ headers:{ Authorization:authorization } }, auth:{ persistSession:false } })
    const { kind, submissionId, receipt } = await request.json()
    if (!Object.hasOwn(tables,kind) || typeof submissionId !== 'string' || !/^[\da-f-]{36}$/i.test(submissionId)) return reply({ error:'Invalid submission' },400)
    const admin = createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth:{ persistSession:false } })
    let row
    if (typeof receipt === 'string' && /^[\da-f-]{72}$/i.test(receipt)) {
      const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(receipt)))].map(byte => byte.toString(16).padStart(2,'0')).join('')
      const {data:proof} = await admin.from('helpdesk_email_deliveries').select('guest_receipt_hash').eq('kind',kind).eq('submission_id',submissionId).maybeSingle()
      if (!proof || proof.guest_receipt_hash !== hash) return reply({error:'Invalid receipt'},403)
      const {data} = await admin.from(tables[kind as keyof typeof tables]).select('*').eq('id',submissionId).maybeSingle()
      row = data
    } else {
      const {data:{user},error:authError} = await client.auth.getUser(authorization.replace(/^Bearer /i,''))
      if (authError || !user) return reply({error:'Valid submission receipt required.'},401)
      const {data} = await client.from(tables[kind as keyof typeof tables]).select('*').eq('id',submissionId).eq('user_id',user.id).maybeSingle()
      row = data
    }
    if (!row) return reply({error:'Submission not found'},404)
    await admin.from('helpdesk_email_deliveries').upsert({ kind,submission_id:submissionId }, { onConflict:'kind,submission_id',ignoreDuplicates:true })
    const { data:delivery } = await admin.from('helpdesk_email_deliveries').select('*').eq('kind',kind).eq('submission_id',submissionId).single()
    if (!delivery) return reply({ error:'Email status unavailable' },503)
    // Earlier submissions remain paused even if someone retries them later.
    if (!canSendSubmission(row.created_at)) return reply({ sent:false, paused:true })
    if (delivery.status === 'sent') return reply({ sent:true })
    const endpoint = Deno.env.get('FORMSPARK_HELPDESK_URL') || ''
    if (!/^https:\/\/submit-form\.com\/[A-Za-z0-9_-]+$/.test(endpoint) || endpoint.endsWith('/echo')) return reply({ sent:false, pending:true })
    // Never automatically retry an ambiguous provider result: it could duplicate email.
    if (delivery.status === 'sending') return reply({ sent:false,pending:true })
    const { data:claim } = await admin.from('helpdesk_email_deliveries').update({ status:'sending',attempts:delivery.attempts + 1,updated_at:new Date().toISOString() }).eq('kind',kind).eq('submission_id',submissionId).eq('status',delivery.status).select('submission_id').maybeSingle()
    if (!claim) return reply({ sent:false,pending:true })
    const email = helpdeskEmail(kind,row)
    let response: Response
    try {
      response = await fetch(endpoint, { method:'POST',headers:{ 'Content-Type':'application/json',Accept:'application/json' },body:JSON.stringify({ department:kind,submission_id:submissionId,message:email.message,_email:{ subject:email.subject,from:'Girlfriend Helpdesk',template:{ title:false,footer:false } } }),signal:AbortSignal.timeout(20000) })
    } catch { return reply({ sent:false,pending:true }) }
    const accepted = response.ok
    // A definitive rejection can be retried; a 5xx may have accepted before failing.
    const status = accepted ? 'sent' : response.status < 500 ? 'failed' : 'sending'
    await admin.from('helpdesk_email_deliveries').update({ status,updated_at:new Date().toISOString() }).eq('kind',kind).eq('submission_id',submissionId)
    return reply({ sent:accepted,pending:!accepted })
  } catch { return reply({ error:'Unable to prepare the email confirmation.' },500) }
})
