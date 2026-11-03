import 'dotenv/config'
import { writeFile, unlink } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
const token = process.env.SUPABASE_ACCESS_TOKEN
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
if (!token || !url) throw new Error('Supabase access token and URL are required')
const ref = new URL(url).hostname.split('.')[0]
function run(args) {
  const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['--yes','supabase',...args], { stdio:'inherit',shell:process.platform === 'win32',env:{ ...process.env,SUPABASE_ACCESS_TOKEN:token } })
  if (result.status !== 0) throw new Error('Helpdesk email deployment failed')
}
const endpoint = process.env.FORMSPARK_HELPDESK_URL
if (endpoint) {
  if (!/^https:\/\/submit-form\.com\/[A-Za-z0-9_-]+$/.test(endpoint) || endpoint.endsWith('/echo')) throw new Error('Invalid Formspark action URL')
  const file = '.env.helpdesk.edge'
  try {
    await writeFile(file,`FORMSPARK_HELPDESK_URL=${endpoint}\n`, { mode:0o600 })
    run(['secrets','set','--project-ref',ref,'--env-file',file,'--yes'])
  } finally { await unlink(file).catch(() => {}) }
} else console.log('Formspark action URL is not set yet. Emails will remain pending.')
run(['functions','deploy','helpdesk-email','--project-ref',ref,'--no-verify-jwt','--yes'])

run(['functions','deploy','helpdesk-submit','--project-ref',ref,'--no-verify-jwt','--yes'])
