import { originalVideoUrl, safeVideoThumbnail } from '../../shared/media-delivery.mjs'
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const cloud = url && key ? createClient(url, key, { auth: { storage: {
  getItem: (name: string) => localStorage.getItem(name) || sessionStorage.getItem(name),
  setItem: (name: string, value: string) => {
    const remember = localStorage.getItem('archive-remember') !== 'no'
    ;(remember ? localStorage : sessionStorage).setItem(name, value)
    ;(remember ? sessionStorage : localStorage).removeItem(name)
  },
  removeItem: (name: string) => { localStorage.removeItem(name); sessionStorage.removeItem(name) },
} } }) : null
export const setupMessage = 'Cloud connection is not configured yet. Add the Supabase settings to .env and restart the app.'
export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!cloud) { setLoading(false); return }
    let active = true
    const { data } = cloud.auth.onAuthStateChange((_event, value) => { if (active) { setSession(value); setLoading(false) } })
    cloud.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setLoading(false) } })
    return () => { active = false; data.subscription.unsubscribe() }
  }, [])
  return { session, loading }
}
export type Media = { id: string; owner_id: string; memory_date: string; file_id: string; url: string; thumbnail_url: string; name: string; kind: 'image' | 'video'; favorite: boolean; created_at: string }
export async function listMedia(date?: string): Promise<Media[]> {
  if (!cloud) throw new Error(setupMessage)
  let query = cloud.from('memory_media').select('*').order('created_at', { ascending: false })
  if (date) query = query.eq('memory_date', date)
  const { data, error } = await query
  if (error) throw error
  return (data || []).map(item => item.kind === 'video' ? { ...item, url: originalVideoUrl(item.url), thumbnail_url: safeVideoThumbnail(item.thumbnail_url) } : item)
}
export async function mediaAction(body: Record<string, unknown>) {
  if (!cloud) throw new Error(setupMessage)
  const { data, error } = await cloud.functions.invoke('media', { body })
  if (error) throw new Error('Media service unavailable. Check your connection and try again.')
  if (data.error) throw new Error(data.error)
  return data
}
export async function uploadMedia(file: File, date: string, progress: (value: number) => void): Promise<Media> {
  if (!/^(image|video)\//.test(file.type)) throw new Error('Choose a photo or video.')
  if (file.size > 100 * 1024 * 1024) throw new Error('Please choose a file smaller than 100 MB.')
  const auth = await mediaAction({ action: 'sign', date })
  const form = new FormData()
  form.append('file', file); form.append('fileName', file.name); form.append('folder', auth.folder)
  for (const key of ['token', 'signature', 'expire', 'publicKey']) form.append(key, String(auth[key]))
  const uploaded = await new Promise<{ fileId: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'https://upload.imagekit.io/api/v1/files/upload')
    xhr.upload.onprogress = event => { if (event.lengthComputable) progress(Math.round(event.loaded / event.total * 90)) }
    xhr.onerror = () => reject(new Error('Upload interrupted. Check your connection and retry.'))
    xhr.onload = () => {
      try { const result = JSON.parse(xhr.responseText); if (xhr.status >= 200 && xhr.status < 300) resolve(result); else reject(new Error(result.message || 'ImageKit rejected this upload.')) }
      catch { reject(new Error('Unexpected upload response. Please retry.')) }
    }
    xhr.send(form)
  })
  // Retrying the save is safe: file_id is unique and the serverless action is idempotent.
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try { const result = await mediaAction({ action: 'save', fileId: uploaded.fileId, date }); progress(100); return result.media }
    catch (error) { lastError = error }
  }
  throw new Error(`Uploaded to ImageKit but saving failed. File ID: ${uploaded.fileId}. ${lastError instanceof Error ? lastError.message : 'Please retry later.'}`)
}
