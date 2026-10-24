import 'dotenv/config'
import { readFile, writeFile, unlink, readdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
const token = process.env.SUPABASE_ACCESS_TOKEN
const url = process.env.VITE_SUPABASE_URL
const ref = url ? new URL(url).hostname.split('.')[0] : ''
if (!token || !ref || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_PUBLIC_KEY) {
  console.error('Set SUPABASE_ACCESS_TOKEN, VITE_SUPABASE_URL, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_PUBLIC_KEY in .env.'); process.exit(1)
}
const migrations = new URL('../supabase/migrations/', import.meta.url)
const sql = (await Promise.all((await readdir(migrations)).filter(name => name.endsWith('.sql')).sort().map(name => readFile(new URL(name, migrations), 'utf8').then(text => text.replace(/^\uFEFF/, ''))))).join('\n')
// Make repeated setup safe without altering existing data or user accounts.
const query = sql.replaceAll('create policy "Read own media"', 'drop policy if exists "Read own media" on public.memory_media;\ncreate policy "Read own media"').replaceAll('create policy "Favorite own media"', 'drop policy if exists "Favorite own media" on public.memory_media;\ncreate policy "Favorite own media"')
const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) })
if (!response.ok) { const detail = await response.json().catch(() => ({})); console.error('Could not apply archive schema:', response.status, detail.message || detail.error || 'Check token and project permissions.'); process.exit(1) }
const secretsFile = new URL('../.env.edge', import.meta.url)
await writeFile(secretsFile, `IMAGEKIT_PUBLIC_KEY=${process.env.IMAGEKIT_PUBLIC_KEY}\nIMAGEKIT_PRIVATE_KEY=${process.env.IMAGEKIT_PRIVATE_KEY}\n`, { mode: 0o600 })
function run(args) {
  const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['--yes', 'supabase', ...args], { stdio: 'inherit', env: { ...process.env, SUPABASE_ACCESS_TOKEN: token }, shell: process.platform === 'win32' })
  if (result.status !== 0) throw new Error('Supabase deployment failed. Check the CLI output above.')
}
try {
  run(['secrets', 'set', '--project-ref', ref, '--env-file', '.env.edge'])
  run(['functions', 'deploy', 'media', '--project-ref', ref, '--no-verify-jwt'])
  console.log('Archive schema and authenticated media function deployed.')
} finally { await unlink(secretsFile).catch(() => {}) }
