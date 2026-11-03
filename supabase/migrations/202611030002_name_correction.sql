update public.impression_messages set body=regexp_replace(body,'\mSingh\M','Singyan','gi') where body ~* '\mSingh\M';
update public.impression_contacts set name=regexp_replace(name,'\mSingh\M','Singyan','gi') where name ~* '\mSingh\M';
