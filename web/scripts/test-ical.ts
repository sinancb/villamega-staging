import { parseIcal, eventHash } from '../src/lib/ical.ts';

let failures = 0;
function check(name: string, cond: boolean, detail?: unknown) {
  if (cond) console.log(`  ok  ${name}`);
  else { failures++; console.error(`FAIL  ${name}`, detail ?? ''); }
}

// 1. Airbnb-style feed: CRLF, VALUE=DATE, folded SUMMARY
const airbnb = [
  'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Airbnb Inc//Hosting Calendar 1.0//EN',
  'BEGIN:VEVENT','DTSTAMP:20260719T120000Z',
  'DTSTART;VALUE=DATE:20260804','DTEND;VALUE=DATE:20260808',
  'UID:1440abc-airbnb@airbnb.com',
  'SUMMARY:Airbnb (Not availa','\tble)',   // folded line
  'END:VEVENT',
  'BEGIN:VEVENT',
  'DTSTART;VALUE=DATE:20260901','DTEND;VALUE=DATE:20260905',
  'UID:1441def-airbnb@airbnb.com','SUMMARY:Reserved','END:VEVENT',
  'END:VCALENDAR'
].join('\r\n');
const a = parseIcal(airbnb);
check('airbnb: two events', a.length === 2, a);
check('airbnb: dates parsed', a[0].dtstart === '2026-08-04' && a[0].dtend === '2026-08-08', a[0]);
check('airbnb: folded summary joined', a[0].summary === 'Airbnb (Not available)', a[0].summary);

// 2. Booking-style: DATE-TIME stamps, LF endings
const booking = [
  'BEGIN:VCALENDAR','BEGIN:VEVENT',
  'DTSTART:20260810T140000Z','DTEND:20260815T100000Z',
  'UID:booking-777','SUMMARY:CLOSED - Not available','END:VEVENT','END:VCALENDAR'
].join('\n');
const b = parseIcal(booking);
check('booking: datetime → date', b[0].dtstart === '2026-08-10' && b[0].dtend === '2026-08-15', b[0]);

// 3. Missing DTEND → one-day event
const noEnd = 'BEGIN:VEVENT\nDTSTART;VALUE=DATE:20261001\nUID:x1\nEND:VEVENT';
const c = parseIcal(noEnd);
check('missing DTEND defaults to +1 day', c[0].dtend === '2026-10-02', c[0]);

// 4. Missing UID → deterministic fallback
const noUid = 'BEGIN:VEVENT\nDTSTART;VALUE=DATE:20261001\nSUMMARY:Blocked\nEND:VEVENT';
check('missing UID gets fallback', parseIcal(noUid)[0].uid === '2026-10-01-Blocked');

// 5. Garbage resilience: malformed dates skipped, junk ignored
const junk = 'BEGIN:VEVENT\nDTSTART:notadate\nUID:bad\nEND:VEVENT\nRANDOMLINE';
check('malformed event dropped', parseIcal(junk).length === 0);

// 6. Month-boundary DTEND math
const eom = parseIcal('BEGIN:VEVENT\nDTSTART;VALUE=DATE:20260731\nUID:e\nEND:VEVENT');
check('July 31 +1 → Aug 1', eom[0].dtend === '2026-08-01', eom[0]);

// 7. Hash stability + sensitivity
const e1 = { uid: 'u', dtstart: '2026-08-01', dtend: '2026-08-05', summary: 's' };
check('hash stable', eventHash(e1) === eventHash({ ...e1 }));
check('hash changes on date change', eventHash(e1) !== eventHash({ ...e1, dtend: '2026-08-06' }));

process.exit(failures ? 1 : 0);
