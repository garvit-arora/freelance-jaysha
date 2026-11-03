import { createClient } from 'npm:@supabase/supabase-js@2'
const cors = { 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS' }
const reply = (body:unknown,status=200) => new Response(JSON.stringify(body),{ status,headers:{ ...cors,'Content-Type':'application/json' } })
const tables = { complaint:'helpdesk_complaints',request:'helpdesk_requests','date-booking':'helpdesk_date_bookings' }
const fields = { complaint:['category','incident','severity'],request:['category','description','urgency'],'date-booking':['preferred_date','experience','details'] }
const digest = async (value:string) => [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(byte => byte.toString(16).padStart(2,'0')).join('')
Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null,{ headers:cors })
  if (request.method !== 'POST') return reply({error:'Method not allowed'},405)
  try {
    const raw = await request.text()
    if (raw.length > 20000) return reply({error:'Form is too long'},400)
    const {kind,id,receipt,values} = JSON.parse(raw)
    if (!Object.hasOwn(tables,kind) || !/^[\da-f-]{36}$/i.test(id || '') || !/^[\da-f-]{72}$/i.test(receipt || '') || !values || typeof values !== 'object') return reply({error:'Invalid form'},400)
    const selected = fields[kind as keyof typeof fields]
    if (selected.some(field => typeof values[field] !== 'string' || values[field].length > (field === 'details' ? 2000 : field === 'incident' || field === 'description' ? 5000 : 100))) return reply({error:'Invalid fields'},400)
    const admin = createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}})
    const hash = await digest(receipt)
    const {data:existing} = await admin.from('helpdesk_email_deliveries').select('guest_receipt_hash').eq('kind',kind).eq('submission_id',id).maybeSingle()
    if (existing) return existing.guest_receipt_hash === hash ? reply({id}) : reply({error:'Invalid receipt'},403)
    const payload = Object.fromEntries(selected.map(field => [field,values[field].trim()]))
    const {error} = await admin.rpc('save_guest_helpdesk',{p_kind:kind,p_id:id,p_values:payload,p_receipt_hash:hash})
    if (error) {
      const {data:duplicate} = await admin.from('helpdesk_email_deliveries').select('guest_receipt_hash').eq('kind',kind).eq('submission_id',id).maybeSingle()
      if (duplicate?.guest_receipt_hash === hash) return reply({id})
      return reply({error:'Please check the form fields and try again.'},400)
    }
    return reply({id})
  } catch { return reply({error:'Could not submit the form. Please try again.'},500) }
})
