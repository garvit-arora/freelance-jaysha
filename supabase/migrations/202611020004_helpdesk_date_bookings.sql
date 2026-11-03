create table if not exists public.helpdesk_date_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  preferred_date date not null,
  experience text not null check (experience in ('Coffee date','Dinner date','Movie night','A day out','An adventure','Surprise me')),
  details text not null default '' check (length(details) <= 2000),
  created_at timestamptz not null default now()
);
alter table public.helpdesk_date_bookings enable row level security;
revoke all on public.helpdesk_date_bookings from anon, authenticated;
grant select, insert on public.helpdesk_date_bookings to authenticated;
grant all on public.helpdesk_date_bookings to service_role;
drop policy if exists "Submit own date booking" on public.helpdesk_date_bookings;
create policy "Submit own date booking" on public.helpdesk_date_bookings for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Read own date booking" on public.helpdesk_date_bookings;
create policy "Read own date booking" on public.helpdesk_date_bookings for select to authenticated using (user_id = (select auth.uid()));
