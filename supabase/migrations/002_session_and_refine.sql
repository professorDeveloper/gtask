-- GTask — 002: session stats and result-page refinements.
-- Safe to run more than once. Run in the Supabase SQL editor.
-- Until this runs, the app keeps these values inside report->'_extras'.

alter table public.submissions add column if not exists session      jsonb;
alter table public.submissions add column if not exists refinements  jsonb;
alter table public.submissions add column if not exists focus        text;
alter table public.submissions add column if not exists total_ms     integer;
alter table public.submissions add column if not exists tab_leaves   smallint;
alter table public.submissions add column if not exists accuracy     smallint;

-- make the new columns visible to PostgREST immediately
notify pgrst, 'reload schema';
