export type ReservationStatus = 'yeni' | 'iletisimde' | 'onaylandi' | 'iptal' | 'tamamlandi';
export type PaymentStatus = 'yok' | 'kapora_linki_gonderildi' | 'kapora_alindi' | 'tamamlandi';
export type VillaStatus = 'draft' | 'active' | 'hidden';
export type Region = 'fethiye' | 'kas' | 'kalkan';
export type Locale = 'tr' | 'en';

export interface Villa {
  id: string; slug: string; region: Region; capacity: number; bedrooms: number;
  bathrooms: number; default_min_stay: number; cleaning_fee: number;
  deposit_amount: number; prepayment_pct: number; status: VillaStatus;
  owner_id: string | null; tourism_license_no: string | null;
}
export interface VillaTranslation {
  villa_id: string; locale: Locale; title: string; description: string;
  seo_title: string | null; seo_desc: string | null;
}
export interface Reservation {
  id: string; villa_id: string; status: ReservationStatus;
  guest_first_name: string; guest_last_name: string; guest_phone: string;
  checkin: string; checkout: string; nights: number;
  accommodation_total: number; cleaning_fee: number; grand_total: number;
  payment_status: PaymentStatus; source: string; notes: string | null; created_at: string;
}
export interface PriceSeason {
  id: string; villa_id: string; label: string | null; start_date: string;
  end_date: string; nightly_price: number; min_stay: number | null;
}
export interface VillaPhoto {
  id: string; villa_id: string; storage_path: string; alt_text: string | null; sort_order: number;
}
export interface IcalFeed {
  id: string; villa_id: string; platform: string; url: string;
  last_synced_at: string | null; last_status: string | null; error_count: number;
}
