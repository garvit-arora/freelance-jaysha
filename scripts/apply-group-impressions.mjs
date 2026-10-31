import 'dotenv/config'
import { readFile, writeFile } from 'node:fs/promises'
const entries = JSON.parse(await readFile('src/group-impressions.json', 'utf8'))
const quote = value => "'" + value.replaceAll("'", "''") + "'"
const seed = await readFile('supabase/migrations/202610240002_impressions.sql', 'utf8')
const seededGroupIds = [...seed.matchAll(/insert into public\.impression_messages[^\n]+values \('([^']+)', 'group'/g)].map(match => match[1])
let query = `do $migration$ begin
if not exists (select 1 from public.app_seed_history where name = 'real-group-impressions-20261031') then
update public.impression_contacts set name='Lakshay' where id='lakshya';
update public.impression_contacts set name='The group chat', label='Friends describing Jaysha in their own words' where id='group';
delete from public.impression_messages where id in (${seededGroupIds.map(quote).join(',')});
delete from public.impression_contacts where id='details';\n`
for (const [index, entry] of entries.entries()) {
  query += `insert into public.impression_contacts(id,name,label,avatar) values (${quote(entry.id)},${quote(entry.name)},'Group member',${quote(entry.name[0])}) on conflict(id) do update set name=excluded.name;\n`
  query += `insert into public.impression_messages(contact_id,sender_id,body,created_at) values ('group',${quote(entry.id)},${quote(entry.body)},'2026-10-31T11:00:00+05:30'::timestamptz + interval '${index} seconds');\n`
}
query += `insert into public.app_seed_history(name) values ('real-group-impressions-20261031');
end if; end $migration$;`
await writeFile('supabase/migrations/202610310001_real_group_impressions.sql', query + '\n')
if (process.argv.includes('--prepare-only')) process.exit(0)
const token = process.env.SUPABASE_ACCESS_TOKEN
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
if (!token || !url) throw new Error('Supabase access token and project URL are required')
const ref = new URL(url).hostname.split('.')[0]
const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, { method:'POST', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body:JSON.stringify({ query }) })
if (!response.ok) throw new Error(`Group update failed (${response.status})`)
console.log('Saved supplied group messages and removed The little things chat.')
const verification = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method:'POST', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
  body:JSON.stringify({ query: `select (select count(*) from public.impression_messages where contact_id='group') as group_messages, (select count(*) from public.impression_contacts where id='details') as removed_chat;` }),
})
if (!verification.ok) throw new Error('Could not verify the group update')
const [counts] = await verification.json()
if (Number(counts.group_messages) < entries.length || Number(counts.removed_chat) !== 0) throw new Error('Group verification failed')
console.log(`Verified ${counts.group_messages} group messages; removed chat count: ${counts.removed_chat}.`)
