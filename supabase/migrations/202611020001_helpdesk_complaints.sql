create table if not exists public.helpdesk_complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('Not enough attention','Late replies','Forgot something important','Unfair teasing','Other')),
  incident text not null check (length(trim(incident)) between 1 and 5000),
  severity text not null check (severity in ('Minor inconvenience','Boyfriend needs to fix this immediately','Unacceptable. I want to see the manager.')),
  created_at timestamptz not null default now()
);
alter table public.helpdesk_complaints enable row level security;
revoke all on public.helpdesk_complaints from anon, authenticated;
grant select, insert on public.helpdesk_complaints to authenticated;
grant all on public.helpdesk_complaints to service_role;
drop policy if exists "Submit own complaint" on public.helpdesk_complaints;
create policy "Submit own complaint" on public.helpdesk_complaints for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Read own complaint" on public.helpdesk_complaints;
create policy "Read own complaint" on public.helpdesk_complaints for select to authenticated using (user_id = (select auth.uid()));
