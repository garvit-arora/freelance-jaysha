import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { originalVideoUrl } from '../shared/media-delivery.mjs'
const manifest = JSON.parse(await readFile(new URL('../src/chapter-media.json', import.meta.url), 'utf8'))
await Promise.all(Object.entries(manifest).map(async ([id, asset]) => {
 const response = await fetch(asset.kind === 'video' ? originalVideoUrl(asset.url) : asset.url, { method: 'HEAD', signal: AbortSignal.timeout(30000) })
 assert.ok(response.ok, `${id}: HTTP ${response.status}`)
 assert.ok(response.headers.get('content-type')?.startsWith(asset.kind === 'video' ? 'video/' : 'image/'), `${id}: invalid content type`)
 console.log('PASS hosted chapter asset:', id)
}))
const range = await fetch(originalVideoUrl(manifest.chapter7.url), { headers: { Range: 'bytes=0-1023' }, signal: AbortSignal.timeout(30000) })
assert.equal(range.status, 206, 'Chapter 7 must support partial video requests')
await range.body.cancel()
console.log('PASS Chapter 7 byte-range playback support')
