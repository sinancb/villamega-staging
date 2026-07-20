-- ============================================================
-- 004_seed.sql — Development seed data
-- 3 villas (Fethiye / Kaş / Kalkan), TR+EN content, 2026 season
-- bands in your three tiers, sample reservation + block + feed.
-- Replace with real data before production; safe to run on a
-- fresh database only.
-- ============================================================

-- ---------- Amenities ----------
insert into amenities (id, icon) values
  ('a0000000-0000-0000-0000-000000000001', 'waves'),        -- özel havuz
  ('a0000000-0000-0000-0000-000000000002', 'wifi'),
  ('a0000000-0000-0000-0000-000000000003', 'snowflake'),    -- klima
  ('a0000000-0000-0000-0000-000000000004', 'car'),          -- otopark
  ('a0000000-0000-0000-0000-000000000005', 'utensils'),     -- tam donanımlı mutfak
  ('a0000000-0000-0000-0000-000000000006', 'shield-check'), -- korunaklı
  ('a0000000-0000-0000-0000-000000000007', 'flame'),        -- barbekü
  ('a0000000-0000-0000-0000-000000000008', 'mountain');     -- deniz/doğa manzarası

insert into amenity_translations (amenity_id, locale, label) values
  ('a0000000-0000-0000-0000-000000000001', 'tr', 'Özel Havuz'),
  ('a0000000-0000-0000-0000-000000000001', 'en', 'Private Pool'),
  ('a0000000-0000-0000-0000-000000000002', 'tr', 'Wi-Fi'),
  ('a0000000-0000-0000-0000-000000000002', 'en', 'Wi-Fi'),
  ('a0000000-0000-0000-0000-000000000003', 'tr', 'Klima'),
  ('a0000000-0000-0000-0000-000000000003', 'en', 'Air Conditioning'),
  ('a0000000-0000-0000-0000-000000000004', 'tr', 'Otopark'),
  ('a0000000-0000-0000-0000-000000000004', 'en', 'Parking'),
  ('a0000000-0000-0000-0000-000000000005', 'tr', 'Tam Donanımlı Mutfak'),
  ('a0000000-0000-0000-0000-000000000005', 'en', 'Fully Equipped Kitchen'),
  ('a0000000-0000-0000-0000-000000000006', 'tr', 'Tam Korunaklı'),
  ('a0000000-0000-0000-0000-000000000006', 'en', 'Fully Secluded'),
  ('a0000000-0000-0000-0000-000000000007', 'tr', 'Barbekü'),
  ('a0000000-0000-0000-0000-000000000007', 'en', 'BBQ'),
  ('a0000000-0000-0000-0000-000000000008', 'tr', 'Doğa Manzarası'),
  ('a0000000-0000-0000-0000-000000000008', 'en', 'Nature View');

-- ---------- Villas ----------
insert into villas (id, slug, region, capacity, bedrooms, bathrooms,
                    default_min_stay, cleaning_fee, deposit_amount, prepayment_pct, status) values
  ('b0000000-0000-0000-0000-000000000001', 'villa-defne', 'fethiye', 8, 4, 4, 3, 3500, 10000, 20, 'active'),
  ('b0000000-0000-0000-0000-000000000002', 'villa-poyraz', 'kas',    6, 3, 3, 3, 3000,  8000, 20, 'active'),
  ('b0000000-0000-0000-0000-000000000003', 'villa-meltem', 'kalkan', 4, 2, 2, 4, 2500,  8000, 20, 'active');

insert into villa_translations (villa_id, locale, title, description, seo_title, seo_desc) values
  ('b0000000-0000-0000-0000-000000000001', 'tr',
   'Villa Defne: Fethiye Ölüdeniz''de Özel Havuzlu Lüks Villa',
   'Ölüdeniz''de, doğa içinde yer alan, tam korunaklı özel havuzlu villa. 8 kişilik geniş yaşam alanı, 4 yatak odası.',
   'Villa Defne | Fethiye Özel Havuzlu Kiralık Villa',
   'Fethiye Ölüdeniz''de 8 kişilik özel havuzlu, tam korunaklı kiralık lüks villa.'),
  ('b0000000-0000-0000-0000-000000000001', 'en',
   'Villa Defne: Luxury Private-Pool Villa in Ölüdeniz, Fethiye',
   'A fully secluded villa with private pool set in nature in Ölüdeniz. Spacious living for 8 guests, 4 bedrooms.',
   'Villa Defne | Private Pool Villa Rental in Fethiye',
   'Fully secluded luxury villa with private pool for 8 guests in Ölüdeniz, Fethiye.'),
  ('b0000000-0000-0000-0000-000000000002', 'tr',
   'Villa Poyraz: Kaş''ta Deniz Manzaralı Özel Havuzlu Villa',
   'Kaş merkeze 10 dakika mesafede, deniz manzaralı, özel havuzlu 6 kişilik villa.',
   'Villa Poyraz | Kaş Deniz Manzaralı Kiralık Villa',
   'Kaş''ta deniz manzaralı, özel havuzlu 6 kişilik kiralık villa.'),
  ('b0000000-0000-0000-0000-000000000002', 'en',
   'Villa Poyraz: Sea-View Private-Pool Villa in Kaş',
   'Sea-view villa with private pool for 6 guests, 10 minutes from Kaş town centre.',
   'Villa Poyraz | Sea View Villa Rental in Kaş',
   'Sea-view villa rental with private pool for 6 guests in Kaş.'),
  ('b0000000-0000-0000-0000-000000000003', 'tr',
   'Villa Meltem: Kalkan''da Balayı Villası',
   'Kalkan''da çiftlere özel, jakuzili ve ısıtmalı havuzlu korunaklı balayı villası.',
   'Villa Meltem | Kalkan Balayı Villası',
   'Kalkan''da jakuzili, ısıtmalı havuzlu korunaklı balayı villası.'),
  ('b0000000-0000-0000-0000-000000000003', 'en',
   'Villa Meltem: Honeymoon Villa in Kalkan',
   'Secluded honeymoon villa in Kalkan with jacuzzi and heated pool, designed for couples.',
   'Villa Meltem | Honeymoon Villa in Kalkan',
   'Secluded honeymoon villa with heated pool and jacuzzi in Kalkan.');

insert into villa_amenities (villa_id, amenity_id)
select v.id, a.id from villas v cross join amenities a
where not (v.slug = 'villa-meltem' and a.icon = 'car');  -- Meltem has no parking, for testing filters

insert into villa_photos (villa_id, storage_path, alt_text, sort_order) values
  ('b0000000-0000-0000-0000-000000000001', 'villas/villa-defne/01.webp', 'Villa Defne havuz', 0),
  ('b0000000-0000-0000-0000-000000000001', 'villas/villa-defne/02.webp', 'Villa Defne salon', 1),
  ('b0000000-0000-0000-0000-000000000002', 'villas/villa-poyraz/01.webp', 'Villa Poyraz deniz manzarası', 0),
  ('b0000000-0000-0000-0000-000000000003', 'villas/villa-meltem/01.webp', 'Villa Meltem jakuzi', 0);

-- ---------- 2026 season bands (three tiers per villa) ----------
-- Tier 3: May & October · Tier 2: June & September · Tier 1: July & August
insert into price_seasons (villa_id, label, start_date, end_date, nightly_price, min_stay)
select v.id, s.label, s.sd, s.ed, s.base * v.mult, s.ms
from (values
  ('Mayıs 2026',    date '2026-05-01', date '2026-05-31',  8000, 3),
  ('Haziran 2026',  date '2026-06-01', date '2026-06-30', 12000, 3),
  ('Pik Yaz 2026',  date '2026-07-01', date '2026-08-31', 18000, 7),
  ('Eylül 2026',    date '2026-09-01', date '2026-09-30', 12000, 3),
  ('Ekim 2026',     date '2026-10-01', date '2026-10-31',  8000, 3)
) as s(label, sd, ed, base, ms)
cross join (values
  ('b0000000-0000-0000-0000-000000000001'::uuid, 1.2),
  ('b0000000-0000-0000-0000-000000000002'::uuid, 1.0),
  ('b0000000-0000-0000-0000-000000000003'::uuid, 0.8)
) as v(id, mult);

-- ---------- Sample operational data ----------
insert into reservations (villa_id, status, guest_first_name, guest_last_name,
                          guest_phone, checkin, checkout,
                          accommodation_total, cleaning_fee, grand_total,
                          payment_status, source) values
  ('b0000000-0000-0000-0000-000000000001', 'onaylandi', 'Şevket', 'Badem',
   '+90 555 111 22 33', '2026-07-30', '2026-08-06',
   151200, 3500, 154700, 'kapora_alindi', 'telefon'),
  ('b0000000-0000-0000-0000-000000000002', 'yeni', 'Onur', 'Meşeci',
   '+90 555 444 55 66', '2026-08-10', '2026-08-17',
   126000, 3000, 129000, 'yok', 'site');

insert into calendar_blocks (villa_id, start_date, end_date, reason) values
  ('b0000000-0000-0000-0000-000000000003', '2026-08-01', '2026-08-07', 'Mal sahibi kullanımı');

insert into ical_feeds (villa_id, platform, url) values
  ('b0000000-0000-0000-0000-000000000001', 'airbnb',
   'https://www.airbnb.com/calendar/ical/EXAMPLE.ics?s=placeholder');

-- ---------- CMS pages ----------
insert into pages (id, slug) values
  ('c0000000-0000-0000-0000-000000000001', 'hakkimizda'),
  ('c0000000-0000-0000-0000-000000000002', 'kiralama-sartlari');

insert into page_translations (page_id, locale, title, body) values
  ('c0000000-0000-0000-0000-000000000001', 'tr', 'Hakkımızda', 'Ortaca merkezli villa kiralama acentesiyiz...'),
  ('c0000000-0000-0000-0000-000000000001', 'en', 'About Us', 'We are a villa rental agency based in Ortaca...'),
  ('c0000000-0000-0000-0000-000000000002', 'tr', 'Kiralama Şartları', 'Rezervasyon ve kiralama koşulları...'),
  ('c0000000-0000-0000-0000-000000000002', 'en', 'Rental Terms', 'Reservation and rental conditions...');
