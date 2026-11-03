begin;
alter table public.helpdesk_date_bookings drop constraint if exists helpdesk_date_bookings_experience_check;
update public.helpdesk_date_bookings set experience = case experience
when 'Coffee date' then 'Café Date'
when 'Dinner date' then 'Fine Dining Date'
when 'Movie night' then 'Movie Date'
when 'A day out' then 'Outdoor Date'
when 'An adventure' then 'Adventure Date'
when 'Surprise me' then 'Surprise Date'
else experience end;
alter table public.helpdesk_date_bookings add constraint helpdesk_date_bookings_experience_check check (experience in ('Fine Dining Date','Café Date','Movie Date','Adventure Date','Shopping Date','Romantic Getaway','Outdoor Date','Activity Date','Night Out','At-Home Date','Surprise Date','Quality Time Date'));
commit;
