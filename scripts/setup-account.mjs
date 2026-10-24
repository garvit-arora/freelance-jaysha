import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
const url = process.env.VITE_SUPABASE_URL
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.LOGIN_EMAIL, password = process.env.LOGIN_PASSWORD
if (!url || !secret || !email || !password) {
  console.error('Missing .env settings:', Object.entries({ VITE_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: secret, LOGIN_EMAIL: email, LOGIN_PASSWORD: password }).filter(([, value]) => !value).map(([key]) => key).join(', ')); process.exit(1)
}
const client = createClient(url, secret, { auth: { persistSession: false } })
const { error } = await client.auth.admin.createUser({ email, password, email_confirm: true })
if (error) { console.error('Could not create login account:', error.message); process.exit(1) }
console.log('Login account created. Sign in through /login. Disable public signups in Supabase Auth settings.')
