/* Inserts one row, reads it back, deletes it. Proves the credentials and table work. */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2];
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const id = crypto.randomUUID();

const row = {
  id,
  answers: ['t_2m', 'b_mid', 'h_mid', 'f_math', 'g_1400'],
  report: { note: 'connection test' },
  readiness: 1, band: 'foundation', archetype: 'Connection test',
  baseline: 1090, target: 1400, gap: 310, weeks: 7, hours_per_week: 3.5,
};

const ins = await db.from('submissions').insert(row);
if (ins.error) { console.error('Insert failed:', ins.error.message); process.exit(1); }

const sel = await db.from('submissions').select('id').eq('id', id).maybeSingle();
if (sel.error || !sel.data) { console.error('Read-back failed:', sel.error?.message ?? 'row not found'); process.exit(1); }

await db.from('submissions').delete().eq('id', id);
console.log('Supabase is connected: insert, read and delete all worked.');
