alter table public.impression_messages
add column if not exists sender_name text
check (sender_name is null or (length(trim(sender_name)) between 1 and 80));
