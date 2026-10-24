import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{2}-\d{2}-\d{4}$/.test(value)) return false
  const [d, m, y] = value.split('-').map(Number), date = new Date(Date.UTC(y, m - 1, d))
  return y >= 1900 && date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}
Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405)
  try {
    const url = Deno.env.get('SUPABASE_URL')!, anon = Deno.env.get('SUPABASE_ANON_KEY')!
    const authorization = request.headers.get('Authorization') || ''
    const client = createClient(url, anon, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } })
    const { data: { user }, error: authError } = await client.auth.getUser(authorization.replace(/^Bearer /i, ''))
    if (authError || !user) return reply({ error: 'Please sign in again.' }, 401)
    const privateKey = Deno.env.get('IMAGEKIT_PRIVATE_KEY'), publicKey = Deno.env.get('IMAGEKIT_PUBLIC_KEY')
    if (!privateKey || !publicKey) return reply({ error: 'ImageKit is not configured yet.' }, 503)
    const body = await request.json()
    const headers = { Authorization: `Basic ${btoa(privateKey + ':')}` }
    if (body.action === 'sign' || body.action === 'signProfile') {
      const profile = body.action === 'signProfile'
      if (profile && (typeof body.contactId !== 'string' || !/^[a-zA-Z0-9-]+$/.test(body.contactId))) return reply({ error: 'Invalid contact' }, 400)
      if (profile) {
        const { data } = await client.from('impression_contacts').select('id').eq('id', body.contactId).maybeSingle()
        if (!data) return reply({ error: 'Contact not found' }, 404)
      }
      if (!profile && !validDate(body.date)) return reply({ error: 'Invalid date' }, 400)
      const token = crypto.randomUUID(), expire = Math.floor(Date.now() / 1000) + 300
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey('raw', encoder.encode(privateKey), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
      const buffer = await crypto.subtle.sign('HMAC', key, encoder.encode(token + expire))
      const signature = Array.from(new Uint8Array(buffer)).map(byte => byte.toString(16).padStart(2, '0')).join('')
      return reply({ token, expire, signature, publicKey, folder: profile ? `/our-world/${user.id}/profiles/${body.contactId}` : `/our-world/${user.id}/${body.date}` })
    }
    if (['saveProfile', 'removeProfile', 'deleteContact'].includes(body.action)) {
      if (typeof body.contactId !== 'string') return reply({ error: 'Invalid contact' }, 400)
      const { data: contact } = await client.from('impression_contacts').select('*').eq('id', body.contactId).maybeSingle()
      if (!contact) return reply({ error: 'Contact not found' }, 404)
      const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
      if (body.action === 'saveProfile') {
        if (typeof body.fileId !== 'string') return reply({ error: 'Invalid profile upload' }, 400)
        const response = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(body.fileId)}/details`, { headers })
        if (!response.ok) return reply({ error: 'Could not verify profile upload.' }, 502)
        const file = await response.json()
        if (!file.filePath?.startsWith(`/our-world/${user.id}/profiles/${contact.id}/`) || file.fileType !== 'image' || file.size > 10 * 1024 * 1024) return reply({ error: 'Invalid profile picture. Use an image smaller than 10 MB.' }, 400)
        const { error } = await admin.from('impression_contacts').update({ avatar_url: file.url, avatar_file_id: file.fileId }).eq('id', contact.id)
        if (error) return reply({ error: 'Could not save profile picture.' }, 503)
        if (contact.avatar_file_id && contact.avatar_file_id !== file.fileId) await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(contact.avatar_file_id)}`, { method: 'DELETE', headers })
        return reply({ ok: true })
      }
      if (contact.avatar_file_id) {
        const response = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(contact.avatar_file_id)}`, { method: 'DELETE', headers })
        if (!response.ok && response.status !== 404) return reply({ error: 'Could not delete profile picture from ImageKit. Please retry.' }, 502)
      }
      const result = body.action === 'deleteContact'
        ? await admin.from('impression_contacts').delete().eq('id', contact.id)
        : await admin.from('impression_contacts').update({ avatar_url: '', avatar_file_id: '' }).eq('id', contact.id)
      if (result.error) return reply({ error: 'Could not update contact. Please retry.' }, 503)
      return reply({ ok: true })
    }
    if (body.action === 'save') {
      if (!validDate(body.date) || typeof body.fileId !== 'string') return reply({ error: 'Invalid upload' }, 400)
      const response = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(body.fileId)}/details`, { headers })
      if (!response.ok) return reply({ error: 'Could not verify the uploaded file. Please retry.' }, 502)
      const file = await response.json()
      if (!file.filePath?.startsWith(`/our-world/${user.id}/${body.date}/`)) return reply({ error: 'File does not belong to this date and account.' }, 403)
      if (file.size > 100 * 1024 * 1024) return reply({ error: 'File exceeds the 100 MB limit.' }, 400)
      const kind = file.fileType === 'image' ? 'image' : /\.(mp4|webm|mov|m4v|avi|mkv|3gp)$/i.test(file.name) ? 'video' : null
      if (!kind) return reply({ error: 'Unsupported media type.' }, 400)
      const { data: existing } = await client.from('memory_media').select('*').eq('file_id', file.fileId).eq('owner_id', user.id).maybeSingle()
      if (existing) return reply({ media: existing })
      const endpoint = new URL(file.url)
      if (endpoint.protocol !== 'https:') return reply({ error: 'Invalid media URL.' }, 400)
      const thumbnail = kind === 'video' ? '/video-placeholder.svg' : file.thumbnailUrl || file.url
      const delivery = new URL(file.url)
      if (kind === 'video') delivery.searchParams.set('tr', 'orig-true')
      // Only the trusted service may register verified ImageKit files.
      const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
      const { data, error } = await admin.from('memory_media').insert({ owner_id: user.id, memory_date: body.date, file_id: file.fileId, url: delivery.toString(), thumbnail_url: thumbnail, name: file.name, kind }).select().single()
      if (error) {
        const { data: concurrent } = await client.from('memory_media').select('*').eq('file_id', file.fileId).eq('owner_id', user.id).maybeSingle()
        if (concurrent) return reply({ media: concurrent })
        return reply({ error: 'Uploaded file could not be saved to the archive. Please retry.' }, 503)
      }
      return reply({ media: data })
    }
    if (body.action === 'delete') {
      const { data: media, error } = await client.from('memory_media').select('*').eq('id', body.id).eq('owner_id', user.id).single()
      if (error || !media) return reply({ error: 'File not found in your archive.' }, 404)
      const response = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(media.file_id)}`, { method: 'DELETE', headers })
      if (!response.ok && response.status !== 404) return reply({ error: 'Could not delete this file from ImageKit. Please retry.' }, 502)
      const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
      const { error: dbError } = await admin.from('memory_media').delete().eq('id', media.id).eq('owner_id', user.id)
      if (dbError) return reply({ error: 'File deleted; archive cleanup failed. Please retry deletion.' }, 503)
      return reply({ ok: true })
    }
    return reply({ error: 'Unknown action' }, 400)
  } catch { return reply({ error: 'Media service temporarily unavailable. Please retry.' }, 500) }
})
