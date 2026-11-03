begin;
delete from public.impression_messages where contact_id='lakshya' and id not in ('efb7882b-952d-5b5a-9337-1a2f6038f1af','bf4e84b4-eb60-57d3-b618-2922a7ba326a');
update public.impression_messages set body='Still very pretty. Still out of my league. But now I get to call her mine. Still not entirely sure how that happened.', photo_url='', updated_at=now() where id='bf4e84b4-eb60-57d3-b618-2922a7ba326a' and contact_id='lakshya';
commit;
