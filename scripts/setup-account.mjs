import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
const url = process.env.VITE_SUPABASE_URL
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
const password = process.env.LOGIN_PASSWORD
const emails = [...new Set([process.env.LOGIN_EMAIL || '', process.env.LOGIN_EMAILS || ''].join(',').split(/[,;\s]+/).filter(Boolean).map(email => email.toLowerCase()))]
if (!url || !secret || !password || !emails.length) throw new Error('Set Supabase URL, server secret, LOGIN_PASSWORD and LOGIN_EMAIL or LOGIN_EMAILS.')
if (emails.some(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw new Error('Each login must be a valid email address.')
const client = createClient(url, secret, { auth: { persistSession: false } })
const existing = new Map()
for (let page = 1; ; page++) {
  const { data, error } = await client.auth.admin.listUsers({ page, perPage: 1000 })
  if (error) throw new Error(`Could not list login accounts: ${error.message}`)
  for (const user of data.users) if (user.email) existing.set(user.email.toLowerCase(), user.id)
  if (data.users.length < 1000) break
}
for (const email of emails) {
  const id = existing.get(email)
  const { error } = id
    ? await client.auth.admin.updateUserById(id, { password, email_confirm: true })
    : await client.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) throw new Error(`Could not configure ${email}: ${error.message}`)
  console.log(`Login ready: ${email}`)
}
console.log('All listed accounts use LOGIN_PASSWORD. No invitation or confirmation emails sent.')
