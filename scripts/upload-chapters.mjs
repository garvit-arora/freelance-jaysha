import 'dotenv/config'
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
const manifestPath = new URL('../src/chapter-media.json', import.meta.url)
let manifest = JSON.parse(await readFile(manifestPath, 'utf8').catch(() => '{}'))
const key = process.env.IMAGEKIT_PRIVATE_KEY
if (!key) throw new Error('IMAGEKIT_PRIVATE_KEY is missing from .env')
const files = [
 ['chapter1','public/chapters/first-chapter.PNG','image'],['chapter2','public/chapters/second-chapter.PNG','image'],['chapter3','public/chapters/chapter3.PNG','image'],['chapter4','public/chapters/chapter4.jpg','image'],
 ...['chapter5','v1','v2','v3','chapter7'].flatMap(name => [[name,`.tools/chapter-media/${name}.mp4`,'video'],[`${name}Poster`,`.tools/chapter-media/${name}-poster.jpg`,'image']]),
]
const only = process.argv.find(value => value.startsWith('--only='))?.slice(7)
if (only && !files.some(([id]) => id === only)) throw new Error('Unknown chapter media ID: ' + only)
for (const [id,path,kind] of files) {
 if (only && id !== only) continue
 const bytes = await readFile(new URL('../'+path, import.meta.url)), hash = createHash('sha256').update(bytes).digest('hex')
 if (manifest[id]?.hash === hash) { console.log('Already uploaded:',id); continue }
 const form = new FormData()
 form.append('file',new Blob([bytes]),path.split('/').at(-1));form.append('fileName',id+'-'+hash.slice(0,12)+(kind==='video'?'.mp4':path.toLowerCase().endsWith('.png')?'.png':'.jpg'))
 form.append('folder','/our-world/romeo');form.append('useUniqueFileName','false')
 const response = await fetch('https://upload.imagekit.io/api/v1/files/upload',{method:'POST',headers:{Authorization:'Basic '+Buffer.from(key+':').toString('base64')},body:form,signal:AbortSignal.timeout(300000)})
 const data=await response.json()
 if(!response.ok) throw new Error(`${id}: ${data.message || response.status}`)
 manifest[id]={url:data.url,fileId:data.fileId,kind,hash,bytes:bytes.length}
 await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n')
 console.log('Uploaded:',id,Math.round(bytes.length/1024)+' KB')
}
