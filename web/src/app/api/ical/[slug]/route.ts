import { supabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Per-villa export feed: /api/ical/villa-defne.ics
// Publishes ONLY confirmed reservations + manual blocks (via get_export_ranges)
// so imported events never echo back out to other platforms.
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug.replace(/\.ics$/, '');
  const supabase = supabaseServer();
  const { data: ranges, error } = await supabase.rpc('get_export_ranges', { p_slug: slug });

  if (error || !ranges) {
    return new NextResponse('Not found', { status: 404 });
  }

  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Villamega//Availability//TR',
    'CALSCALE:GREGORIAN',
    ...ranges.flatMap((r: any, i: number) => [
      'BEGIN:VEVENT',
      `UID:${slug}-${r.start_date}-${i}@villamega.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${r.start_date.replaceAll('-', '')}`,
      `DTEND;VALUE=DATE:${r.end_date.replaceAll('-', '')}`,
      'SUMMARY:Villamega (Not available)',
      'END:VEVENT'
    ]),
    'END:VCALENDAR'
  ];

  return new NextResponse(lines.join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  });
}
