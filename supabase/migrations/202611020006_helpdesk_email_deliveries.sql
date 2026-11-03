create table if not exists public.helpdesk_email_deliveries (
  kind text not null check (kind in ('complaint','request','date-booking')),
  submission_id uuid not null,
  status text not null default 'pending' check (status in ('pending','sending','sent','failed')),
  attempts integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (kind, submission_id)
);
alter table public.helpdesk_email_deliveries enable row level security;
revoke all on public.helpdesk_email_deliveries from anon, authenticated;
grant all on public.helpdesk_email_deliveries to service_role;
create or replace function public.queue_helpdesk_email() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  insert into public.helpdesk_email_deliveries(kind,submission_id) values (TG_ARGV[0],new.id) on conflict do nothing;
  return new;
end; $$;
revoke all on function public.queue_helpdesk_email() from public;
drop trigger if exists queue_complaint_email on public.helpdesk_complaints;
create trigger queue_complaint_email after insert on public.helpdesk_complaints for each row execute function public.queue_helpdesk_email('complaint');
drop trigger if exists queue_request_email on public.helpdesk_requests;
create trigger queue_request_email after insert on public.helpdesk_requests for each row execute function public.queue_helpdesk_email('request');
drop trigger if exists queue_booking_email on public.helpdesk_date_bookings;
create trigger queue_booking_email after insert on public.helpdesk_date_bookings for each row execute function public.queue_helpdesk_email('date-booking');
