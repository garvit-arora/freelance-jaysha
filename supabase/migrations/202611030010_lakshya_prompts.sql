begin;
update public.impression_messages set sender_id='lakshya',sender_name=null,updated_at=now()
where contact_id='lakshya' and id in ('efb7882b-952d-5b5a-9337-1a2f6038f1af','bf4e84b4-eb60-57d3-b618-2922a7ba326a');

insert into public.impression_messages(id,contact_id,sender_id,body,photo_url,created_at)
select '5147dc72-e5ab-482e-8990-99482dd3a612'::uuid,'lakshya',null,'Okay, honest first impression of Jaysha?','',created_at-interval '1 second'
from public.impression_messages where id='efb7882b-952d-5b5a-9337-1a2f6038f1af' and contact_id='lakshya'
on conflict(id) do update set body=excluded.body,sender_id=null,sender_name=null,created_at=excluded.created_at;

insert into public.impression_messages(id,contact_id,sender_id,body,photo_url,created_at)
select '5e9a7fcd-983f-550a-b511-3c02fb7c947d'::uuid,'lakshya',null,'And now?','',created_at-interval '0.5 seconds'
from public.impression_messages where id='bf4e84b4-eb60-57d3-b618-2922a7ba326a' and contact_id='lakshya'
on conflict(id) do update set body=excluded.body,sender_id=null,sender_name=null,created_at=excluded.created_at;
commit;
