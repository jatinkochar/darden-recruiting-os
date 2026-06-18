-- Stronger cleanup for Darden Recruiting OS.
-- Run this in Supabase SQL Editor after deploying the frontend dedupe patch.

delete from public.events
where
  lower(title) like '%congrats on your darden fort%'
  or lower(title) like '%forté fellowship%'
  or lower(title) like '%forte fellowship%'
  or lower(title) like '%receipt%'
  or lower(title) like '%invoice%'
  or lower(title) like '%verification code%'
  or lower(title) like '%password reset%';

delete from public.events bad
where lower(bad.title) like '%confirmed to attend%'
and exists (
  select 1
  from public.events good
  where good.id <> bad.id
    and lower(good.company) = lower(bad.company)
    and coalesce(good.date::text, '') = coalesce(bad.date::text, '')
    and coalesce(good.start_time::text, '') = coalesce(bad.start_time::text, '')
    and lower(good.title) not like '%confirmed to attend%'
);

delete from public.events bad
where lower(bad.title) like '%reminder%'
and exists (
  select 1
  from public.events good
  where good.id <> bad.id
    and lower(good.company) = lower(bad.company)
    and coalesce(good.date::text, '') = coalesce(bad.date::text, '')
    and coalesce(good.start_time::text, '') = coalesce(bad.start_time::text, '')
    and lower(good.title) not like '%reminder%'
);

with ranked as (
  select
    id,
    row_number() over (
      partition by
        lower(trim(company)),
        coalesce(date::text, ''),
        coalesce(start_time::text, ''),
        coalesce(nullif(meeting_link, ''), '')
      order by
        case when status = 'Registered' then 0 else 1 end,
        case when passcode is not null and passcode <> '' then 0 else 1 end,
        case when lower(title) like '%confirmed to attend%' then 1 else 0 end,
        case when lower(title) like '%reminder%' then 1 else 0 end,
        updated_at desc nulls last,
        created_at desc nulls last
    ) as rn
  from public.events
  where meeting_link is not null and meeting_link <> ''
)
delete from public.events e
using ranked r
where e.id = r.id
and r.rn > 1;

select company, date, start_time, count(*) as count, array_agg(title) as titles
from public.events
group by company, date, start_time
having count(*) > 1
order by count(*) desc, date;
