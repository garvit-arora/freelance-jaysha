begin;
alter table public.helpdesk_complaints drop constraint if exists helpdesk_complaints_category_check;
update public.helpdesk_complaints set category = case category
when 'Not enough attention' then 'Attention & Affection'
when 'Late replies' then 'Communication Issues'
when 'Forgot something important' then 'Memory & Forgetfulness'
when 'Unfair teasing' then 'Teasing & Arguments'
when 'Other' then 'Other Serious Allegations'
else category end;
alter table public.helpdesk_complaints add constraint helpdesk_complaints_category_check check (category in ('Attention & Affection','Communication Issues','Boyfriend Behaviour','Date Night Negligence','Emotional Support','Memory & Forgetfulness','Romance Deficiency','Time Management','Teasing & Arguments','Reassurance & Insecurities','Food & Snack Related Crimes','Other Serious Allegations'));
commit;
