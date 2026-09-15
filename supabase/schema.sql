-- GTask — one table. Run this in the Supabase SQL editor.
-- For an existing database, run supabase/migrations/002_session_and_refine.sql instead.

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
  hours_per_week  numeric(4,1),
  -- 002: how the check was taken (never affects the score)
  session         jsonb,
  focus           text,
  total_ms        integer,
  tab_leaves      smallint,
  -- 002: optional result-page answers
  refinements     jsonb,
  accuracy        smallint
);

-- keep older databases in step (no-ops on a fresh table)
alter table public.submissions add column if not exists session      jsonb;
alter table public.submissions add column if not exists refinements  jsonb;
alter table public.submissions add column if not exists focus        text;
alter table public.submissions add column if not exists total_ms     integer;
alter table public.submissions add column if not exists tab_leaves   smallint;
alter table public.submissions add column if not exists accuracy     smallint;

create index if not exists submissions_created_at_idx on public.submissions (created_at desc);

alter table public.submissions enable row level security;

-- Writes and reads go through the server with the service-role key, which
-- bypasses RLS. No policy is granted to anon, so the table is not readable
-- from the browser.
