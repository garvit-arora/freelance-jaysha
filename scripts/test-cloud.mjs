import 'dotenv/config'
import assert from 'node:assert/strict'
import { createClient } from '@supabase/supabase-js'
const client = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } })
let mediaId
async function action(body) {
  const { data, error } = await client.functions.invoke('media', { body })
  if (error) throw new Error(`Media action ${body.action} failed: ${error.message}`)
  if (data.error) throw new Error(data.error)
  return data
}
try {
  const anonymous = await client.from('memory_media').select('id').limit(1)
  assert.ifError(anonymous.error)
  console.log('PASS public archive access allowed')
  const unsigned = await client.functions.invoke('media', { body: { action: 'sign', date: '24-10-2026' } })
  assert.ok(unsigned.error, 'Anonymous uploads must be denied')
  console.log('PASS anonymous upload denied')
  const { data, error } = await client.auth.signInWithPassword({ email: process.env.LOGIN_EMAIL, password: process.env.LOGIN_PASSWORD })
  if (error) throw new Error(`Login failed: ${error.message}`)
  assert.ok(data.session)
  console.log('PASS email/password login')
  const invalid = await client.functions.invoke('media', { body: { action: 'sign', date: '31-02-2026' } })
  assert.ok(invalid.error)
  console.log('PASS invalid upload date denied')
  const date = '24-10-2026'
  const auth = await action({ action: 'sign', date })
  const form = new FormData()
  form.append('file', new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64')], { type: 'image/png' }), 'archive-smoke-test.png')
  form.append('fileName', 'archive-smoke-test.png'); form.append('folder', auth.folder)
  for (const key of ['token', 'signature', 'expire', 'publicKey']) form.append(key, String(auth[key]))
  const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', body: form })
  assert.ok(response.ok, `ImageKit upload HTTP ${response.status}`)
  const uploaded = await response.json()
  console.log('PASS direct ImageKit photo upload')
  const saved = await action({ action: 'save', fileId: uploaded.fileId, date })
  mediaId = saved.media.id
  assert.equal(saved.media.kind, 'image'); assert.equal(saved.media.memory_date, date)
  assert.equal(new URL(saved.media.url).pathname, new URL(uploaded.url).pathname)
  const repeated = await action({ action: 'save', fileId: uploaded.fileId, date })
  assert.equal(repeated.media.id, mediaId)
  console.log('PASS automatic database save and duplicate-save protection')
  const visitor = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } })
  const publicRead = await visitor.from('memory_media').select('url').eq('id', mediaId).single()
  assert.ifError(publicRead.error); assert.equal(publicRead.data.url, saved.media.url)
  const publicUpdate = await visitor.from('memory_media').update({ favorite: true }).eq('id', mediaId)
  assert.ok(publicUpdate.error)
  const publicDelete = await visitor.functions.invoke('media', { body: { action: 'delete', id: mediaId } })
  assert.ok(publicDelete.error)
  console.log('PASS anonymous photo viewing allowed; anonymous editing and deletion denied')
  const favorite = await client.from('memory_media').update({ favorite: true }).eq('id', mediaId).select().single()
  assert.ifError(favorite.error); assert.equal(favorite.data.favorite, true)
  console.log('PASS favorite update')
  const forbidden = await client.from('memory_media').insert({ ...saved.media, id: crypto.randomUUID(), file_id: 'fake' })
  assert.ok(forbidden.error)
  console.log('PASS unverified database insert denied')
  await action({ action: 'delete', id: mediaId })
  const check = await client.from('memory_media').select('id').eq('id', mediaId)
  assert.ifError(check.error); assert.equal(check.data.length, 0)
  mediaId = null
  console.log('PASS ImageKit and database deletion')
  await client.auth.signOut()
  console.log('PASS sign out; cloud smoke test complete')
} catch (error) {
  console.error(error.message); process.exitCode = 1
} finally {
  if (mediaId) {
    try { await action({ action: 'delete', id: mediaId }); console.log('Test media cleaned up') }
    catch { console.error('Test media cleanup needs a retry: run this script again or remove archive-smoke-test.png in the gallery.') }
  }
}
