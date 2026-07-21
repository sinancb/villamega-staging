export type Locale = 'tr' | 'en';
export const LOCALES: Locale[] = ['tr', 'en'];
export const DEFAULT_LOCALE: Locale = 'tr';

const dict = {
  tr: {
    nav_villas: 'Villalarımız', nav_about: 'Hakkımızda', nav_terms: 'Kiralama Şartları',
    nav_contact: 'İletişim',
    hero_eyebrow: 'Fethiye · Kaş · Kalkan',
    hero_title: 'Akdeniz\'de Hayalinizdeki Villa',
    hero_sub: 'Fethiye, Kaş ve Kalkan\'ın en seçkin korunaklı villalarında unutulmaz bir tatil.',
    hero_cta: 'Villaları Keşfedin',
    hero_slides: [
      { tag: 'Mavi Lagün', caption: 'Ölüdeniz\'in eşsiz turkuaz koyu' },
      { tag: 'Babadağ', caption: 'Gökyüzünden Ölüdeniz manzarası' },
      { tag: 'Çam Ormanları', caption: 'Akdeniz çamlarıyla çevrili koylar' }
    ],
    villa_types_title: 'Villa Tiplerine Göre Keşfedin',
    search_region: 'Bölge', search_villa_type: 'Villa Tipi',
    search_dates: 'Giriş - Çıkış Tarihi', search_guests: 'Misafir',
    search_select: 'Seçiniz', search_any_type: 'Tüm Tipler',
    search_pick_dates: 'Tarih seçin', search_button: 'Ara', search_guest_count: 'Misafir Sayısı',
    regions_title: 'Bölgeler',
    featured_title: 'Öne Çıkan Villalar',
    all_villas: 'Tüm Villalar',
    per_night: 'gecelik', from_price: 'Bugünkü gecelik fiyat',
    guests: 'Kişi', bedrooms: 'Yatak Odası', bathrooms: 'Banyo', min_stay: 'Min. Konaklama',
    nights_suffix: 'Gece', view_details: 'Detayları İncele',
    filter_region: 'Bölge', filter_all: 'Tümü', filter_capacity: 'Kişi sayısı',
    calendar_title: 'Müsaitlik Takvimi', price_table: 'Sezon Fiyatları',
    season: 'Sezon', date_range: 'Tarih Aralığı', nightly: 'Gecelik',
    amenities_title: 'Özellikler',
    gallery_more_photos: 'Fotoğraf Daha', gallery_close: 'Kapat',
    booking_title: 'Rezervasyon Talebi',
    checkin: 'Giriş Tarihi', checkout: 'Çıkış Tarihi', select_dates: 'Takvimden tarih seçin',
    accommodation: 'Konaklama Tutarı', cleaning: 'Temizlik Ücreti',
    summary: 'REZERVASYON ÖZETİ', prepayment: 'Ön Ödeme', due_checkin: 'Girişte Kalan',
    total: 'Toplam Tutar', damage_deposit: 'Hasar Depozitosu',
    deposit_note: 'Hasar depozitosu villaya girişte ekstra olarak alınır ve çıkışta hasar olmaması durumunda iade edilir.',
    first_name: 'Ad', last_name: 'Soyad', phone: 'Telefon',
    submit_request: 'Rezervasyon Talebi Gönder', submitting: 'Gönderiliyor…',
    success_title: 'Talebiniz alındı!',
    success_body: 'Ekibimiz en kısa sürede sizi arayarak rezervasyonunuzu netleştirecek.',
    err_min_stay: 'Bu tarihler için en az {n} gece konaklama gerekiyor.',
    err_unavailable: 'Seçtiğiniz tarihler dolu. Lütfen farklı tarihler deneyin.',
    err_unpriced: 'Seçtiğiniz tarihler henüz satışa açık değil.',
    err_invalid_phone: 'Lütfen geçerli bir telefon numarası girin.',
    err_generic: 'Bir sorun oluştu. Lütfen tekrar deneyin veya bizi arayın.',
    footer_tag: 'Fethiye, Kaş ve Kalkan\'da seçkin villa kiralama.',
    legend_available: 'Müsait', legend_blocked: 'Dolu'
  },
  en: {
    nav_villas: 'Our Villas', nav_about: 'About Us', nav_terms: 'Rental Terms',
    nav_contact: 'Contact',
    hero_eyebrow: 'Fethiye · Kaş · Kalkan',
    hero_title: 'Your Dream Villa on the Mediterranean',
    hero_sub: 'Unforgettable holidays in the finest secluded villas of Fethiye, Kaş and Kalkan.',
    hero_cta: 'Explore Villas',
    hero_slides: [
      { tag: 'Blue Lagoon', caption: 'Ölüdeniz\'s iconic turquoise cove' },
      { tag: 'Babadağ', caption: 'The bay, seen from the sky' },
      { tag: 'Pine Forests', caption: 'Coves framed by Mediterranean pine' }
    ],
    villa_types_title: 'Explore by Villa Type',
    search_region: 'Region', search_villa_type: 'Villa Type',
    search_dates: 'Check-in - Check-out', search_guests: 'Guests',
    search_select: 'Select', search_any_type: 'All Types',
    search_pick_dates: 'Pick dates', search_button: 'Search', search_guest_count: 'Guest Count',
    regions_title: 'Regions',
    featured_title: 'Featured Villas',
    all_villas: 'All Villas',
    per_night: 'per night', from_price: 'Tonight\'s nightly rate',
    guests: 'Guests', bedrooms: 'Bedrooms', bathrooms: 'Bathrooms', min_stay: 'Min. Stay',
    nights_suffix: 'Nights', view_details: 'View Details',
    filter_region: 'Region', filter_all: 'All', filter_capacity: 'Guests',
    calendar_title: 'Availability', price_table: 'Seasonal Prices',
    season: 'Season', date_range: 'Dates', nightly: 'Nightly',
    amenities_title: 'Amenities',
    gallery_more_photos: 'More Photos', gallery_close: 'Close',
    booking_title: 'Availability Request',
    checkin: 'Check-in', checkout: 'Check-out', select_dates: 'Pick dates on the calendar',
    accommodation: 'Accommodation', cleaning: 'Cleaning Fee',
    summary: 'RESERVATION SUMMARY', prepayment: 'Prepayment', due_checkin: 'Due at Check-in',
    total: 'Total', damage_deposit: 'Damage Deposit',
    deposit_note: 'The damage deposit is collected at check-in and refunded at check-out if no damage has occurred.',
    first_name: 'First Name', last_name: 'Last Name', phone: 'Phone',
    submit_request: 'Send Availability Request', submitting: 'Sending…',
    success_title: 'Request received!',
    success_body: 'Our team will call you shortly to finalise your reservation.',
    err_min_stay: 'These dates require a minimum stay of {n} nights.',
    err_unavailable: 'The selected dates are taken. Please try different dates.',
    err_unpriced: 'The selected dates are not yet open for booking.',
    err_invalid_phone: 'Please enter a valid phone number.',
    err_generic: 'Something went wrong. Please try again or call us.',
    footer_tag: 'Curated villa rentals in Fethiye, Kaş and Kalkan.',
    legend_available: 'Available', legend_blocked: 'Booked'
  }
};

export type Dict = (typeof dict)['tr'];
export const t = (locale: Locale): Dict => dict[locale] ?? dict.tr;

export const REGION_LABEL: Record<Locale, Record<string, string>> = {
  tr: { fethiye: 'Fethiye', kas: 'Kaş', kalkan: 'Kalkan' },
  en: { fethiye: 'Fethiye', kas: 'Kaş', kalkan: 'Kalkan' }
};
