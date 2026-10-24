import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { originalVideoUrl, safeVideoThumbnail } from '../shared/media-delivery.mjs'
const db = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const { data, error } = await db.from('memory_media').select('id,url,thumbnail_url').eq('kind', 'video')
if (error) throw error
let changed = 0
for (const item of data) {
 const url = originalVideoUrl(item.url), thumbnail_url = safeVideoThumbnail(item.thumbnail_url)
 if (url === item.url && thumbnail_url === item.thumbnail_url) continue
 const { error } = await db.from('memory_media').update({ url, thumbnail_url }).eq('id',item.id)
 if (error) throw error
 changed++
}
console.log('Updated existing video delivery records:', changed)
