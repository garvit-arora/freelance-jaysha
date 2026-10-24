create table if not exists public.impression_contacts (
 id text primary key default gen_random_uuid()::text,
 name text not null check (length(trim(name)) between 1 and 80),
 label text not null default '' check (length(label) <= 200),
 avatar text not null default '?', color text not null default '#333333',
 avatar_url text not null default '', avatar_file_id text not null default '',
 preview text not null default '', created_at timestamptz not null default now()
);
create table if not exists public.impression_messages (
 id uuid primary key default gen_random_uuid(),
 contact_id text not null references public.impression_contacts(id) on delete cascade,
 sender_id text,
 body text not null check (length(trim(body)) between 1 and 5000),
 photo_url text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz
);
create index if not exists impression_messages_thread on public.impression_messages(contact_id, created_at, id);
alter table public.impression_contacts enable row level security;
alter table public.impression_messages enable row level security;
grant select on public.impression_contacts, public.impression_messages to anon, authenticated;
revoke insert, update, delete on public.impression_contacts from authenticated;
grant insert(name, label, avatar), update(name, label, avatar, preview) on public.impression_contacts to authenticated;
grant insert, update, delete on public.impression_messages to authenticated;
grant all on public.impression_contacts, public.impression_messages to service_role;
alter table public.impression_messages drop constraint if exists impression_messages_sender_id_fkey;
drop policy if exists "Public mock contacts" on public.impression_contacts;
create policy "Public mock contacts" on public.impression_contacts for select using (true);
drop policy if exists "Edit mock contacts" on public.impression_contacts;
create policy "Edit mock contacts" on public.impression_contacts for all to authenticated using (true) with check (true);
drop policy if exists "Public mock messages" on public.impression_messages;
create policy "Public mock messages" on public.impression_messages for select using (true);
drop policy if exists "Edit mock messages" on public.impression_messages;
create policy "Edit mock messages" on public.impression_messages for all to authenticated using (true) with check (true);
create table if not exists public.app_seed_history (name text primary key);
revoke all on public.app_seed_history from anon, authenticated;
do $$ begin
if not exists (select 1 from public.app_seed_history where name = 'impressions-v1') then
insert into public.impression_contacts (id, name, label, avatar, color, preview) values ('lakshya', 'Lakshya', 'Head of the Jaysha fan club', 'L', '#e9d9c8', 'Some people just feel like home.') on conflict (id) do nothing;
insert into public.impression_contacts (id, name, label, avatar, color, preview) values ('group', 'The group chat', 'The unofficial appreciation society', '✦', '#dce6d8', 'Main character energy, honestly.') on conflict (id) do nothing;
insert into public.impression_contacts (id, name, label, avatar, color, preview) values ('food', 'The food committee', 'Very serious research. Very spicy findings.', '🍟', '#f8e3bc', 'A love language, with extra laal mirch.') on conflict (id) do nothing;
insert into public.impression_contacts (id, name, label, avatar, color, preview) values ('dogs', 'Every dog, ever', 'Four paws. Five-star review.', '🐾', '#e3dff2', 'She said “awww baby” again. 10/10.') on conflict (id) do nothing;
insert into public.impression_contacts (id, name, label, avatar, color, preview) values ('details', 'The little things', 'Small moments. Lasting impressions.', '♡', '#f1dce0', 'She remembers the smallest details.') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('efb7882b-952d-5b5a-9337-1a2f6038f1af', 'lakshya', null, 'Okay, honest first impression of Jaysha?', '', '2026-10-24T10:24:01+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('bf4e84b4-eb60-57d3-b618-2922a7ba326a', 'lakshya', 'lakshya', 'A little intimidating. Very pretty. Definitely out of my league.', '', '2026-10-24T10:24:02+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('5e9a7fcd-983f-550a-b511-3c02fb7c947d', 'lakshya', null, 'And now?', '', '2026-10-24T10:25:03+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('e016af57-6e86-546f-b81b-e18498b5e628', 'lakshya', 'lakshya', 'Still very pretty. Still out of my league. But now she steals my fries, so I think we’re doing okay.', '', '2026-10-24T10:25:04+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('279b50f1-1245-5d4a-8d5b-0fdfd0392c0e', 'lakshya', 'lakshya', 'This one has my whole heart. No further questions.', '/bg-post-timeline.jpeg', '2026-10-24T10:26:05+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('c431f64e-f6d5-5f3b-99e1-1fb1313fd7a8', 'lakshya', 'lakshya', 'Some people just feel like home. She’s my person.', '', '2026-10-24T10:27:06+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('52c5de29-7379-5dcb-af6c-a8e3b95a4147', 'lakshya', null, 'Officially the softest thing you’ve ever said 🥹', '', '2026-10-24T10:28:07+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('a7b948a8-2884-540b-b1d3-a76a13fed28e', 'group', null, 'Describe Jaysha in one sentence. Go.', '', '2026-10-24T11:02:01+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('85d45ad7-a7b1-54a4-849f-dc74273c3258', 'group', 'group', 'The friend who says “kuch nahi” and then delivers a six-part documentary.', '', '2026-10-24T11:03:02+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('2cd04d8c-eae0-56b7-beba-475bdad0a01c', 'group', 'group', 'The one who notices you’re quiet before you even notice it yourself.', '', '2026-10-24T11:03:03+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('3a045515-80e1-551e-8cb0-fdcc5b034c4b', 'group', null, 'Okay that’s actually really sweet.', '', '2026-10-24T11:04:04+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('ce9048b7-138b-5f97-af80-1938f3ef4ab1', 'group', 'group', 'She’ll roast you, feed you, check you got home, and then roast you again. Full service friendship.', '', '2026-10-24T11:05:05+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('3c346eb6-b630-58fb-9617-5431bf1cfaf5', 'group', 'group', 'Main character energy, honestly. We’re just happy to be in the credits.', '', '2026-10-24T11:06:06+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('3483b2ff-3562-5e92-a7e9-ffddaa2f02d0', 'food', null, 'What’s her love language?', '', '2026-10-24T12:15:01+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('e95b1b6b-ba75-59fd-b53f-e76a0f90cbde', 'food', 'food', '“Baby, kuch accha sa khilao.”', '', '2026-10-24T12:15:02+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('8d669896-7af7-58a6-bc1b-a441de20dcbc', 'food', 'food', 'And by accha she means something with enough laal mirch to reset your entire personality.', '', '2026-10-24T12:16:03+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('d3170294-0dbf-5edc-9f35-a097d6a1704a', 'food', null, 'McD or a fancy café?', '', '2026-10-24T12:17:04+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('892c3582-8c6d-5f3e-834a-9b494fcd9d76', 'food', 'food', 'Beautiful café. Lovely ambience. Excellent menu. Anyway, where’s the nearest McD?', '', '2026-10-24T12:17:05+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('5ceef6ef-d734-5605-80c2-38e7b76551e9', 'food', 'food', 'A love language, with extra laal mirch. And maybe a little ice cream cone afterward.', '', '2026-10-24T12:18:06+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('553bcef7-6f47-5123-a107-7d8e63f9fcd4', 'dogs', null, 'Any impressions of Jaysha?', '', '2026-10-24T14:01:01+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('22214fcb-4ee5-5309-9309-3e77a9480c23', 'dogs', 'dogs', 'She stopped in the middle of a perfectly normal conversation just to say hello to me.', '', '2026-10-24T14:02:02+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('15cdb40a-cc25-5393-96e7-a8f5ad7f17a7', 'dogs', null, 'Did she call you baby?', '', '2026-10-24T14:02:03+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('625f4502-05c2-50aa-8d65-3d96e1a39409', 'dogs', 'dogs', 'Three times. I have never felt more important.', '', '2026-10-24T14:03:04+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('5c021205-dc72-5541-a4d3-7de7c0fc3f8b', 'dogs', 'dogs', 'Excellent human. Warm heart. Understands the importance of stopping for every dog. Would enthusiastically wag again.', '', '2026-10-24T14:04:05+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('f9788e2e-bc53-5f83-9f51-2660a5956b8d', 'details', null, 'What’s something people might miss about her?', '', '2026-10-24T16:40:01+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('cbf7877b-dedd-557d-9cda-67282e0c5f9c', 'details', 'details', 'How much she notices. A tiny change in your voice. A detail you mentioned weeks ago.', '', '2026-10-24T16:41:02+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('a1be96c5-05c9-522f-ae5f-e53014c5422a', 'details', 'details', 'She makes ordinary things feel like they deserve to be remembered.', '', '2026-10-24T16:42:03+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('a9879aa2-4e6b-5218-b5c0-7dff09b21da7', 'details', null, 'Like her notes and drawings?', '', '2026-10-24T16:42:04+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('979b2426-019b-5399-b8f0-3b4b7b76258a', 'details', 'details', 'Exactly. A little drawing. A handwritten note. Something that says “I was thinking about you” without needing a grand speech.', '', '2026-10-24T16:43:05+05:30') on conflict (id) do nothing;
insert into public.impression_messages (id, contact_id, sender_id, body, photo_url, created_at) values ('dacc8986-cd8e-5346-9efd-f840b18debdc', 'details', 'details', 'She remembers the smallest details. And somehow becomes your favorite detail herself.', '', '2026-10-24T16:44:06+05:30') on conflict (id) do nothing;
insert into public.app_seed_history values ('impressions-v1');
end if;
end $$;
