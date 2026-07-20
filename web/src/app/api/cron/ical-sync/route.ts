import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { parseIcal, eventHash } from '@/lib/ical';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const FETCH_TIMEOUT_MS = 15_000;
const ALERT_THRESHOLD = 3; // consecutive failures before the team is emailed

async function fetchFeed(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Villamega-Sync/1.0' },
      cache: 'no-store'
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.text();
  } finally {
    clearTimeout(timer);
  }
}

async function alertTeam(subject: string, body: string) {
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFY_TO) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM,
      to: [process.env.NOTIFY_TO],
      subject,
      html: `<p>${body}</p>`
    })
  }).catch(() => { /* alerting must never crash the sync */ });
}

export async function GET(request: Request) {
  // Vercel Cron sends Authorization: Bearer CRON_SECRET
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = supabaseService();
  const { data: feeds, error: feedsError } = await supabase
    .from('ical_feeds')
    .select('id, villa_id, platform, url, error_count, villas(slug)');
  if (feedsError) {
    return NextResponse.json({ ok: false, error: feedsError.message }, { status: 500 });
  }

  const report: Record<string, unknown>[] = [];

  for (const feed of feeds ?? []) {
    const slug = (feed as any).villas?.slug ?? feed.villa_id;
    try {
      const raw = await fetchFeed(feed.url);
      const events = parseIcal(raw);

      // Upsert current events (change-detected via raw_hash)
      if (events.length > 0) {
        const rows = events.map((e) => ({
          feed_id: feed.id,
          uid: e.uid,
          dtstart: e.dtstart,
          dtend: e.dtend,
          summary: e.summary,
          raw_hash: eventHash(e),
          updated_at: new Date().toISOString()
        }));
        const { error } = await supabase
          .from('ical_events')
          .upsert(rows, { onConflict: 'feed_id,uid' });
        if (error) throw new Error(`upsert: ${error.message}`);
      }

      // Remove events the source no longer publishes (cancellations).
      // Runs ONLY after a successful fetch+parse — a dead feed never wipes data.
      const liveUids = events.map((e) => e.uid);
      const del = supabase.from('ical_events').delete().eq('feed_id', feed.id);
      const { error: delError } = liveUids.length > 0
        ? await del.not('uid', 'in', `(${liveUids.map((u) => `"${u.replaceAll('"', '')}"`).join(',')})`)
        : await del;
      if (delError) throw new Error(`prune: ${delError.message}`);

      // Flag overlaps with confirmed reservations
      const { data: conflictCount } = await supabase
        .rpc('detect_conflicts', { p_villa_id: feed.villa_id });

      await supabase.from('ical_feeds').update({
        last_synced_at: new Date().toISOString(),
        last_status: 'ok',
        error_count: 0
      }).eq('id', feed.id);

      report.push({ feed: `${slug}/${feed.platform}`, events: events.length, conflicts: conflictCount ?? 0 });

      if ((conflictCount ?? 0) > 0) {
        await alertTeam(
          `Takvim çakışması: ${slug}`,
          `${feed.platform} takviminden gelen ${conflictCount} kayıt onaylı bir rezervasyonla çakışıyor. Panelden kontrol edin: /admin/cakismalar`
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const nextCount = (feed.error_count ?? 0) + 1;
      await supabase.from('ical_feeds').update({
        last_status: `error: ${message.slice(0, 200)}`,
        error_count: nextCount
      }).eq('id', feed.id);
      report.push({ feed: `${slug}/${feed.platform}`, error: message });

      if (nextCount === ALERT_THRESHOLD) {
        await alertTeam(
          `Takvim eşitlenemiyor: ${slug} / ${feed.platform}`,
          `Bu takvim art arda ${nextCount} kez eşitlenemedi (${message}). Adres değişmiş olabilir — panelden kontrol edin.`
        );
      }
    }
  }

  return NextResponse.json({ ok: true, synced: report });
}
