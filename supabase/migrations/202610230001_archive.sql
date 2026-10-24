create table if not exists public.memory_media (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  memory_date text not null check (memory_date ~ '^\d{2}-\d{2}-\d{4}$'),
  file_id text not null unique,
  url text not null check (url like 'https://%'),
  thumbnail_url text not null default '',
  name text not null,
  kind text not null check (kind in ('image', 'video')),
  favorite boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists memory_media_owner_date on public.memory_media(owner_id, memory_date);
alter table public.memory_media enable row level security;
revoke all on public.memory_media from anon;
revoke all on public.memory_media from authenticated;
grant select on public.memory_media to authenticated;
grant update(favorite) on public.memory_media to authenticated;
create policy "Read own media" on public.memory_media for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Favorite own media" on public.memory_media for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
