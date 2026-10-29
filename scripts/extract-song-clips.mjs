import 'dotenv/config'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
const ffmpeg = process.env.FFMPEG_PATH || '.tools/python/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
const source = 'public/song-videos.MP4'
const boundaries = [0,22,50,98,111,134,155,181,203,245,291,320,342,371,387,408,462,493,510,546,560,588,613,622,678,714]
const existing = JSON.parse(await readFile('src/song-clips.json', 'utf8').catch(() => '[]'))
const clips = []
await mkdir('public/song-clips', { recursive: true })
for (let index = 0; index < boundaries.length; index++) {
  // Skip the first two seconds of every segment, without shifting its end.
  const start = boundaries[index] + 2, end = boundaries[index + 1]
  const path = `public/song-clips/song-${index + 1}.m4a`
  const args = ['-hide_banner','-loglevel','error','-y','-ss',String(start),'-i',source]
  if (end) args.push('-t',String(end - start))
  args.push('-vn','-map','0:a:0','-c:a','aac','-b:a','160k','-movflags','+faststart',path)
  const result = spawnSync(ffmpeg, args, { encoding:'utf8', windowsHide:true })
  if (result.status !== 0) throw new Error(result.stderr || 'Audio extraction failed')
  const bytes = await readFile(path)
  const hash = createHash('sha256').update(bytes).digest('hex')
  const hosted = existing.find(clip => clip.hash === hash && clip.fileId)
  clips.push(hosted || { id:`song-${index + 1}`, start, end:end ?? null, url:`/song-clips/song-${index + 1}.m4a`, hash, bytes:bytes.length })
  console.log('Extracted song',index + 1)
}
await writeFile('src/song-clips.json',JSON.stringify(clips,null,2)+'\n')
