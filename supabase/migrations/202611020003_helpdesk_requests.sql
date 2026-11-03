create table if not exists public.helpdesk_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('Attention & Affection','Emotional Support','Quality Time','Date Night Requests','Romantic Gestures','Gifts & Treats','Communication & Connection','Personal Favour','Special Occasions','Adventures & Experiences','Surprise Me','Other Requests')),
  description text not null check (length(trim(description)) between 1 and 5000),
  urgency text not null check (urgency in ('As soon as possible','Whenever you’re free','Just putting it out there')),
  created_at timestamptz not null default now()
);
alter table public.helpdesk_requests enable row level security;
revoke all on public.helpdesk_requests from anon, authenticated;
grant select, insert on public.helpdesk_requests to authenticated;
grant all on public.helpdesk_requests to service_role;
drop policy if exists "Submit own request" on public.helpdesk_requests;
create policy "Submit own request" on public.helpdesk_requests for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Read own request" on public.helpdesk_requests;
create policy "Read own request" on public.helpdesk_requests for select to authenticated using (user_id = (select auth.uid()));
