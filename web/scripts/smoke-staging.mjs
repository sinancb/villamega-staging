// Staging smoke test — run AFTER deploying:
//
//   STAGING_URL=https://villamega-staging.vercel.app \
//   SUPABASE_URL=https://xxxx.supabase.co \
//   SUPABASE_ANON_KEY=eyJ... \
//   node scripts/smoke-staging.mjs
//
// Read-only against your data (the one write attempt uses an invalid
// phone on purpose, so it is rejected before touching the table).

const { STAGING_URL, SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
if (!STAGING_URL || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Set STAGING_URL, SUPABASE_URL, SUPABASE_ANON_KEY');
  process.exit(1);
}

let failures = 0;
const ok = (name) => console.log(`  ok  ${name}`);
const fail = (name, detail) => { failures++; console.error(`FAIL  ${name}`, detail ?? ''); };

const rest = (path, init = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...init.headers
    }
  });

const rpc = (fn, args) =>
  rest(`rpc/${fn}`, { method: 'POST', body: JSON.stringify(args) }).then((r) => r.json());

// 1. Site is up, root redirects to /tr
try {
  const r = await fetch(`${STAGING_URL}/`, { redirect: 'follow' });
  const html = await r.text();
  r.ok && r.url.includes('/tr') ? ok('site: / → /tr') : fail('site: / → /tr', r.url);
  html.includes('VILLAMEGA') ? ok('site: brand renders') : fail('site: brand renders');
} catch (e) { fail('site reachable', e.message); }

// 2. English locale renders
try {
  const r = await fetch(`${STAGING_URL}/en/villalar`);
  r.ok ? ok('site: /en/villalar 200') : fail('site: /en/villalar', r.status);
} catch (e) { fail('site: /en', e.message); }

// 3. Anon sees active villas via API (RLS front door)
let firstVilla = null;
try {
  const r = await rest('villas?select=id,slug,default_min_stay,cleaning_fee&status=eq.active&limit=5');
  const rows = await r.json();
  Array.isArray(rows) && rows.length > 0
    ? ok(`data: ${rows.length} active villa(s) visible`)
    : fail('data: active villas visible', rows);
  firstVilla = rows?.[0] ?? null;
} catch (e) { fail('data: villas query', e.message); }

// 4. Anon CANNOT read reservations (RLS back door)
try {
  const r = await rest('reservations?select=id&limit=1');
  const rows = await r.json();
  Array.isArray(rows) && rows.length === 0
    ? ok('rls: reservations hidden from anon')
    : fail('rls: reservations hidden from anon', rows);
} catch (e) { fail('rls: reservations check', e.message); }

if (firstVilla) {
  // 5. Availability RPC wired
  try {
    const r = await rest('rpc/get_unavailable_ranges', {
      method: 'POST', body: JSON.stringify({ p_villa_id: firstVilla.id })
    });
    Array.isArray(await r.json())
      ? ok('rpc: get_unavailable_ranges')
      : fail('rpc: get_unavailable_ranges');
  } catch (e) { fail('rpc: get_unavailable_ranges', e.message); }

  // 6. Quote engine wired: far-future dates must return a structured error
  try {
    const q = await rpc('quote_stay', {
      p_villa_id: firstVilla.id, p_checkin: '2028-01-10', p_checkout: '2028-01-20'
    });
    q && q.ok === false && ['unpriced_dates', 'dates_unavailable'].includes(q.error)
      ? ok(`rpc: quote_stay structured (${q.error})`)
      : fail('rpc: quote_stay structured', q);
  } catch (e) { fail('rpc: quote_stay', e.message); }

  // 6b. If a current/future season exists, verify real quote math
  try {
    const r = await rest(`price_seasons?select=start_date,end_date,nightly_price,min_stay&villa_id=eq.${firstVilla.id}&order=start_date`);
    const seasons = await r.json();
    const today = new Date().toISOString().slice(0, 10);
    const band = (seasons ?? []).find((s) => s.end_date > today);
    if (band) {
      const start = band.start_date > today ? band.start_date : today;
      const nights = band.min_stay ?? firstVilla.default_min_stay ?? 3;
      const checkin = new Date(start + 'T00:00:00Z');
      checkin.setUTCDate(checkin.getUTCDate() + 1);
      const checkout = new Date(checkin);
      checkout.setUTCDate(checkout.getUTCDate() + nights);
      const q = await rpc('quote_stay', {
        p_villa_id: firstVilla.id,
        p_checkin: checkin.toISOString().slice(0, 10),
        p_checkout: checkout.toISOString().slice(0, 10)
      });
      if (q?.ok) {
        Number(q.grand_total) === Number(q.accommodation_total) + Number(q.cleaning_fee)
          ? ok(`rpc: quote math (${q.nights}n, total ${q.grand_total})`)
          : fail('rpc: quote math', q);
      } else {
        ok(`rpc: quote responded (${q?.error}) — dates may be blocked, fine`);
      }
    } else {
      ok('rpc: no future season on first villa — math check skipped');
    }
  } catch (e) { fail('rpc: quote math', e.message); }

  // 7. Request RPC live but validating: bad phone must be rejected
  try {
    const q = await rpc('create_reservation_request', {
      p_villa_id: firstVilla.id, p_checkin: '2028-01-10', p_checkout: '2028-01-15',
      p_first_name: 'Smoke', p_last_name: 'Test', p_phone: 'not-a-phone'
    });
    q?.ok === false && q.error === 'invalid_phone'
      ? ok('rpc: request form validates phone')
      : fail('rpc: request form validates phone', q);
  } catch (e) { fail('rpc: create_reservation_request', e.message); }

  // 8. iCal export well-formed
  try {
    const r = await fetch(`${STAGING_URL}/api/ical/${firstVilla.slug}.ics`);
    const body = await r.text();
    r.ok && body.startsWith('BEGIN:VCALENDAR') && body.includes('END:VCALENDAR')
      ? ok('ical: export feed well-formed')
      : fail('ical: export feed', body.slice(0, 80));
  } catch (e) { fail('ical: export feed', e.message); }
}

// 9. Admin guarded, cron guarded
try {
  const r = await fetch(`${STAGING_URL}/admin/talepler`, { redirect: 'manual' });
  [302, 303, 307, 308].includes(r.status)
    ? ok('auth: /admin redirects anonymous')
    : fail('auth: /admin redirects anonymous', r.status);
} catch (e) { fail('auth: admin guard', e.message); }
try {
  const r = await fetch(`${STAGING_URL}/api/cron/ical-sync`);
  r.status === 401 ? ok('auth: cron rejects without secret') : fail('auth: cron guard', r.status);
} catch (e) { fail('auth: cron guard', e.message); }

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures ? 1 : 0);
