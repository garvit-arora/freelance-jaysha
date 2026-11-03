import 'dotenv/config'
import { readFile } from 'node:fs/promises'
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const token = process.env.SUPABASE_ACCESS_TOKEN
if (!url || !token) throw new Error('Supabase URL and access token required')
const ref = new URL(url).hostname.split('.')[0]
const query = await readFile('supabase/migrations/202611030005_impression_corrections.sql','utf8')
const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({query})})
if (!response.ok) throw new Error(`Chat update failed (${response.status})`)
console.log('Restored Lakshya first impression and updated reply; removed requested dog sentence and food message.')
