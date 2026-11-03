update public.impression_messages
set body=rtrim(body) || ' ' || chr(128579) || chr(128579), updated_at=now()
where id='892c3582-8c6d-5f3e-834a-9b494fcd9d76'
  and contact_id='food'
  and right(rtrim(body), 2) <> chr(128579) || chr(128579);
