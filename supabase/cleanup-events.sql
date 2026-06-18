-- Darden Recruiting OS cleanup
-- Use this once after deploying the smarter importer.
-- It removes obvious bad/non-event rows and collapses duplicate imports.

delete from public.events
where
  lower(title) like '%congrats on your darden fort%'
  or lower(title) like '%forté fellowship%'
  or lower(title) like '%forte fellowship%'
  or lower(title) like '%receipt%'
  or lower(title) like '%invoice%'
  or lower(title) like '%verification code%'
  or lower(title) like '%password reset%';

delete from public.events
where
  notes ilike '%<p>%'
  and (
    lower(title) like '%reminder%'
    or lower(title) like '%congrats%'
    or lower(title) like '%newsletter%'
  );

with ranked as (
  select
    id,
    row_number() over (
      partition by
        lower(trim(company)),
        regexp_replace(lower(trim(title)), '^(re:|fw:|fwd:|reminder:|24 hour reminder:)\s*', ''),
        coalesce(date::text, ''),
        coalesce(start_time::text, '')
      order by
        case when status = 'Registered' then 0 else 1 end,
        case when meeting_link is not null and meeting_link <> '' then 0 else 1 end,
        updated_at desc nulls last,
        created_at desc nulls last
    ) as rn
  from public.events
)
delete from public.events e
using ranked r
where e.id = r.id
and r.rn > 1;

select company, title, date, start_time, count(*)
from public.events
group by company, title, date, start_time
having count(*) > 1
order by count(*) desc;
