update public.impression_contacts set name=regexp_replace(name,'\mLakshay\M','Lakshya','gi') where name ~* '\mLakshay\M';
update public.impression_messages set body=regexp_replace(body,'\mLakshay\M','Lakshya','gi') where body ~* '\mLakshay\M';
