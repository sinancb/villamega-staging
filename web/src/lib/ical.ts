// Minimal, dependency-free iCal parser for OTA availability feeds
// (Airbnb, Booking.com, villavillam, villasepeti, hepsivilla).
// These feeds are all-day VEVENT lists; we extract UID/DTSTART/DTEND/SUMMARY.

export interface IcalEvent {
  uid: string;
  dtstart: string;  // YYYY-MM-DD
  dtend: string;    // YYYY-MM-DD, exclusive (iCal convention)
  summary: string;
}

/** RFC 5545 line unfolding: a CRLF followed by space/tab continues the line. */
function unfold(raw: string): string[] {
  return raw
    .replace(/\r\n[ \t]/g, '')
    .replace(/\n[ \t]/g, '')
    .split(/\r?\n/)
    .filter(Boolean);
}

/** '20260815' or '20260815T140000Z' → '2026-08-15'. Returns null if malformed. */
function toIsoDate(value: string): string | null {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!m) return null;
  const [, y, mo, d] = m;
  if (Number(mo) < 1 || Number(mo) > 12 || Number(d) < 1 || Number(d) > 31) return null;
  return `${y}-${mo}-${d}`;
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function parseIcal(raw: string): IcalEvent[] {
  const events: IcalEvent[] = [];
  let current: Partial<IcalEvent> | null = null;

  for (const line of unfold(raw)) {
    if (line === 'BEGIN:VEVENT') { current = {}; continue; }
    if (line === 'END:VEVENT') {
      if (current?.dtstart) {
        // Missing DTEND → single-day event per RFC 5545 for VALUE=DATE
        const dtend = current.dtend ?? addDays(current.dtstart, 1);
        events.push({
          uid: current.uid ?? `${current.dtstart}-${current.summary ?? 'event'}`,
          dtstart: current.dtstart,
          dtend,
          summary: current.summary ?? ''
        });
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).split(';')[0].toUpperCase();
    const value = line.slice(colon + 1).trim();

    switch (key) {
      case 'UID': current.uid = value; break;
      case 'SUMMARY': current.summary = value; break;
      case 'DTSTART': current.dtstart = toIsoDate(value) ?? undefined; break;
      case 'DTEND': current.dtend = toIsoDate(value) ?? undefined; break;
    }
  }
  return events;
}

/** Cheap change-detection hash (FNV-1a) so unchanged events skip writes. */
export function eventHash(e: IcalEvent): string {
  const s = `${e.uid}|${e.dtstart}|${e.dtend}|${e.summary}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}
