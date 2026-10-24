import 'dotenv/config'
import assert from 'node:assert/strict'
import { createClient } from '@supabase/supabase-js'
const options = { auth: { persistSession: false } }
const client = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY, options)
const visitor = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY, options)
let contactId
async function action(body) {
  const { data, error } = await client.functions.invoke('media', { body })
  if (error || data?.error) throw new Error(data?.error || error.message)
  return data
}
try {
  const publicContacts = await visitor.from('impression_contacts').select('id').limit(1)
  assert.ifError(publicContacts.error)
  assert.ok(publicContacts.data.length)
  const blocked = await visitor.from('impression_messages').insert({ contact_id: publicContacts.data[0].id, body: 'Not allowed' })
  assert.ok(blocked.error)
  console.log('PASS public reading and anonymous write protection')
  const login = await client.auth.signInWithPassword({ email: process.env.LOGIN_EMAIL, password: process.env.LOGIN_PASSWORD })
  assert.ifError(login.error)
  const created = await client.from('impression_contacts').insert({ name: 'Disposable impressions test', label: 'Temporary test contact', avatar: 'T' }).select().single()
  assert.ifError(created.error); contactId = created.data.id
  const renamed = await client.from('impression_contacts').update({ name: 'Updated disposable test' }).eq('id', contactId).select().single()
  assert.ifError(renamed.error); assert.equal(renamed.data.name, 'Updated disposable test')
  console.log('PASS contact creation and update')
  const tamper = await client.from('impression_contacts').update({ avatar_file_id: 'unverified' }).eq('id', contactId)
  assert.ok(tamper.error)
  console.log('PASS unverified ImageKit profile changes denied')
  const first = await client.from('impression_messages').insert({ contact_id: contactId, sender_id: null, body: 'Test from me' }).select().single()
  assert.ifError(first.error)
  const second = await client.from('impression_messages').insert({ contact_id: contactId, sender_id: publicContacts.data[0].id, body: 'Test on another contact’s behalf' }).select().single()
  assert.ifError(second.error)
  const edited = await client.from('impression_messages').update({ body: 'Edited message', sender_id: contactId, updated_at: new Date().toISOString() }).eq('id', first.data.id).select().single()
  assert.ifError(edited.error); assert.equal(edited.data.body, 'Edited message'); assert.equal(edited.data.sender_id, contactId)
  const persisted = await visitor.from('impression_messages').select('*').eq('contact_id', contactId)
  assert.ifError(persisted.error); assert.equal(persisted.data.length, 2)
  const deleted = await client.from('impression_messages').delete().eq('id', second.data.id)
  assert.ifError(deleted.error)
  console.log('PASS send as either side, edit sender/text, persist, publicly read, delete')
  const auth = await action({ action: 'signProfile', contactId })
  const form = new FormData()
  form.append('file', new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64')], { type: 'image/png' }), 'impressions-test-profile.png')
  form.append('fileName', 'impressions-test-profile.png'); form.append('folder', auth.folder)
  for (const key of ['token', 'signature', 'expire', 'publicKey']) form.append(key, String(auth[key]))
  const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', body: form })
  assert.ok(response.ok)
  const uploaded = await response.json()
  await action({ action: 'saveProfile', contactId, fileId: uploaded.fileId })
  const profile = await visitor.from('impression_contacts').select('avatar_url').eq('id', contactId).single()
  assert.ifError(profile.error); assert.ok(profile.data.avatar_url.includes('ik.imagekit.io'))
  console.log('PASS ImageKit profile upload, verification, persistence and public display URL')
  await action({ action: 'removeProfile', contactId })
  const removed = await client.from('impression_contacts').select('avatar_url').eq('id', contactId).single()
  assert.equal(removed.data.avatar_url, '')
  console.log('PASS profile deletion')
  await action({ action: 'deleteContact', contactId })
  const empty = await client.from('impression_messages').select('id').eq('contact_id', contactId)
  assert.ifError(empty.error); assert.equal(empty.data.length, 0)
  contactId = null
  console.log('PASS contact deletion cascades its messages; test data cleaned up')
} catch (error) { console.error(error.message); process.exitCode = 1 }
finally {
  if (contactId) { try { await action({ action: 'deleteContact', contactId }); console.log('Temporary test contact cleaned up') } catch { console.error('Could not clean up temporary test contact; remove it in Impressions.') } }
  await client.auth.signOut()
}
