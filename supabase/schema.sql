-- GTask — one table. Run this in the Supabase SQL editor.

create table if not exists public.submissions (
  id              uuid primary key,
  created_at      timestamptz not null default now(),
  answers         jsonb       not null,
  report          jsonb       not null,
  -- flattened for readability in the Supabase table view
  readiness       smallint    not null,
  band            text        not null,
  archetype       text        not null,
  baseline        smallint,
  target          smallint,
  gap             smallint,
  weeks           smallint,
  hours_per_week  numeric(4,1)
);

create index if not exists submissions_created_at_idx on public.submissions (created_at desc);

alter table public.submissions enable row level security;

-- Writes and reads go through the server with the service-role key, which
-- bypasses RLS. No policy is granted to anon, so the table is not readable
-- from the browser.
