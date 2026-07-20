export const tl = (n: number) =>
  '₺' + new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n);

export const trDate = (iso: string) =>
  new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')));

export const STATUS_TR: Record<string, string> = {
  yeni: 'Yeni', iletisimde: 'İletişimde', onaylandi: 'Onaylandı',
  iptal: 'İptal', tamamlandi: 'Tamamlandı'
};
export const PAYMENT_TR: Record<string, string> = {
  yok: 'Ödeme yok', kapora_linki_gonderildi: 'Kapora linki gönderildi',
  kapora_alindi: 'Kapora alındı', tamamlandi: 'Ödeme tamamlandı'
};
export const REGION_TR: Record<string, string> = {
  fethiye: 'Fethiye', kas: 'Kaş', kalkan: 'Kalkan'
};
