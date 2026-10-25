import 'dotenv/config'
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const manifestPath = 'src/song-clips.json'
const clips = JSON.parse(await readFile(manifestPath, 'utf8'))
const key = process.env.IMAGEKIT_PRIVATE_KEY
if (!key) throw new Error('IMAGEKIT_PRIVATE_KEY is missing')
for (const clip of clips) {
  if (clip.url.startsWith('https://ik.imagekit.io/') && clip.fileId) continue
  const bytes = await readFile(`public/song-clips/${clip.id}.m4a`)
  const hash = createHash('sha256').update(bytes).digest('hex')
  const name = `${clip.id}-${hash.slice(0, 12)}.m4a`
  const form = new FormData()
  form.append('file', new Blob([bytes], { type: 'audio/mp4' }), name)
  form.append('fileName', name)
  form.append('folder', '/our-world/song-dedications')
  form.append('useUniqueFileName', 'false')
  const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST', headers: { Authorization: 'Basic ' + Buffer.from(key + ':').toString('base64') },
    body: form, signal: AbortSignal.timeout(60000),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(`${clip.id}: ${data.message || response.status}`)
  clip.url = data.url
  clip.fileId = data.fileId
  await writeFile(manifestPath, JSON.stringify(clips, null, 2) + '\n')
  console.log('Uploaded:', clip.id)
}
