alter table public.helpdesk_complaints alter column user_id drop not null;
alter table public.helpdesk_requests alter column user_id drop not null;
alter table public.helpdesk_date_bookings alter column user_id drop not null;
alter table public.helpdesk_email_deliveries add column if not exists guest_receipt_hash text;
-- Guest records remain private. Only the server function inserts or reads them.
revoke all on public.helpdesk_complaints,public.helpdesk_requests,public.helpdesk_date_bookings,public.helpdesk_email_deliveries from anon;
create or replace function public.save_guest_helpdesk(p_kind text,p_id uuid,p_values jsonb,p_receipt_hash text) returns uuid
language plpgsql set search_path=public as $$
begin
  if p_kind='complaint' then
    insert into public.helpdesk_complaints(id,user_id,category,incident,severity) values(p_id,null,p_values->>'category',p_values->>'incident',p_values->>'severity');
  elsif p_kind='request' then
    insert into public.helpdesk_requests(id,user_id,category,description,urgency) values(p_id,null,p_values->>'category',p_values->>'description',p_values->>'urgency');
  elsif p_kind='date-booking' then
    insert into public.helpdesk_date_bookings(id,user_id,preferred_date,experience,details) values(p_id,null,(p_values->>'preferred_date')::date,p_values->>'experience',p_values->>'details');
  else raise exception 'Invalid department'; end if;
  update public.helpdesk_email_deliveries set guest_receipt_hash=p_receipt_hash where kind=p_kind and submission_id=p_id;
  return p_id;
end; $$;
revoke all on function public.save_guest_helpdesk(text,uuid,jsonb,text) from public,anon,authenticated;
grant execute on function public.save_guest_helpdesk(text,uuid,jsonb,text) to service_role;
