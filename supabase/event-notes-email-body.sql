alter table public.events
add column if not exists user_notes text,
add column if not exists email_body text;

update public.events
set email_body = notes
where email_body is null
and notes is not null;
