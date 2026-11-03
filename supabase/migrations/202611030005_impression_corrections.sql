begin;

update public.impression_messages
set body='Okay, honest first impression of Jaysha: a little intimidating, very pretty, definitely out of my league.', sender_id='lakshya', updated_at=now()
where id='efb7882b-952d-5b5a-9337-1a2f6038f1af' and contact_id='lakshya';

update public.impression_messages
set body='Still very pretty. Still out of my league. But now I get to call her mine. Still not entirely sure how that happened.', updated_at=now()
where id='bf4e84b4-eb60-57d3-b618-2922a7ba326a' and contact_id='lakshya';

update public.impression_messages
set body=replace(body, 'Understands the importance of stopping for every dog. ', ''), updated_at=now()
where contact_id='dogs' and body like '%Understands the importance of stopping for every dog.%';

delete from public.impression_messages
where contact_id='food' and body like 'A love language, with extra%';

update public.impression_contacts
set preview='Very serious research. Very spicy findings.'
where id='food' and preview like 'A love language, with extra%';

commit;
