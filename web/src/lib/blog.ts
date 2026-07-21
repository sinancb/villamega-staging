export type BlogPost = {
  slug: string;
  image: string;
  tr: { title: string; excerpt: string; body: string[] };
  en: { title: string; excerpt: string; body: string[] };
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'fethiyede-yapilacak-aktiviteler',
    image: '/blog/activities.svg',
    tr: {
      title: 'Fethiye\'de Yapılacak Aktiviteler Listesi',
      excerpt: 'Yamaç paraşütünden tekne turlarına, Fethiye tatilinizi unutulmaz kılacak aktiviteler.',
      body: [
        'Fethiye, Akdeniz\'in en hareketli tatil beldelerinden biri olmasının yanı sıra doğa tutkunları için de eşsiz bir oyun alanı. Villanızın havuzundan kalkıp bir günlüğüne maceraya atılmak isterseniz, işte listemiz.',
        'Babadağ\'dan Yamaç Paraşütü: Ölüdeniz\'in üzerinde, 1.960 metreden Akdeniz\'e süzülmek Fethiye\'nin amblemi haline geldi. Turkuaz koyu ve çam ormanlarını kuşbakışı görmenin başka bir yolu yok.',
        'Tekne Turu ile 12 Ada: Günü Göcek ve Fethiye açıklarındaki koylarda geçirin, her durakta serin sulara atlayın, öğle yemeğinizi güvertede yiyin.',
        'Kelebekler Vadisi: Sadece tekneyle ulaşılabilen bu vadi, dik kayalıklarla çevrili gizli bir plaj ve doğa yürüyüşü rotası sunuyor.',
        'Saklıkent Kanyonu: Türkiye\'nin en uzun kanyonlarından birinde serin sularda yürüyüş yapıp ardından ahşap platformlarda alabalık eşliğinde öğle yemeği yiyebilirsiniz.',
        'Likya Yolu\'nda Kısa Bir Bölüm: Antik Likya medeniyetinin kalıntıları arasında, çam kokulu patikalarda birkaç saatlik bir yürüyüş, tatilinize tarih katar.'
      ]
    },
    en: {
      title: 'Things to Do in Fethiye: The Complete List',
      excerpt: 'From paragliding to boat tours, the activities that make a Fethiye holiday unforgettable.',
      body: [
        'Fethiye is one of the Mediterranean\'s liveliest holiday towns, and a playground for nature lovers besides. If you feel like trading your villa pool for a day of adventure, here\'s our list.',
        'Paragliding from Babadağ: Gliding over the Mediterranean from 1,960 metres above Ölüdeniz has become Fethiye\'s signature experience — there\'s no other way to see the turquoise bay and pine forests from above.',
        '12 Islands Boat Tour: Spend the day hopping between coves off Göcek and Fethiye, diving into cool water at every stop, lunch served on deck.',
        'Butterfly Valley: Reachable only by boat, this valley is a hidden beach and hiking trail wrapped in sheer cliffs.',
        'Saklıkent Canyon: Wade through cool water in one of Turkey\'s longest canyons, then lunch on wooden platforms with fresh trout.',
        'A Stretch of the Lycian Way: A few hours on pine-scented trails among the ruins of ancient Lycia adds a little history to your holiday.'
      ]
    }
  },
  {
    slug: 'fethiyede-gidilmesi-gereken-koylar',
    image: '/blog/coves.svg',
    tr: {
      title: 'Fethiye\'de Mutlaka Gitmeniz Gereken Koylar',
      excerpt: 'Turkuaz suları ve çam ormanlarıyla Fethiye\'nin saklı kalmış en güzel koyları.',
      body: [
        'Fethiye\'nin kıyı şeridi, her biri kendine has bir karaktere sahip koylarla dolu. İşte tekneyle ya da karayoluyla ulaşabileceğiniz favorilerimiz.',
        'Ölüdeniz Mavi Lagün: Sakin, turkuaz sularıyla dünyaca ünlü. Sabah erken saatlerde gidip kalabalık öncesi tadını çıkarmanızı öneririz.',
        'Gemiler Koyu: Ölüdeniz\'e komşu ama çok daha sakin, batık bir geminin enkazının da görülebildiği berrak sularıyla dalış tutkunlarının favorisi.',
        'Kabak Koyu: Likya Yolu üzerinde, sadece yürüyerek ya da tekneyle ulaşılan, doğal kalmış bir koy. Günü burada geçirmek şehrin gürültüsünden tam bir kaçış.',
        'Katrancı Koyu: Aile dostu, sığ ve sakin suları ile küçük çocuklu tatilciler için ideal.',
        'Günlükbaşı: Yerel halkın tercih ettiği, turistik yoğunluktan uzak, otantik bir koy deneyimi arıyorsanız buraya uğrayın.'
      ]
    },
    en: {
      title: 'Coves You Must Visit in Fethiye',
      excerpt: 'Turquoise water and pine forests — Fethiye\'s most beautiful hidden coves.',
      body: [
        'Fethiye\'s coastline is lined with coves, each with its own character. Here are our favourites, reachable by boat or by road.',
        'Ölüdeniz Blue Lagoon: World-famous for its calm turquoise water. Go early morning to enjoy it before the crowds arrive.',
        'Gemiler Cove: Next door to Ölüdeniz but far quieter, with clear water and a sunken wreck that makes it a favourite among divers.',
        'Kabak Cove: On the Lycian Way, reachable only on foot or by boat, and still wonderfully unspoiled. A full day here is a genuine escape from the noise.',
        'Katrancı Cove: Family-friendly, shallow and calm — ideal if you\'re travelling with young children.',
        'Günlükbaşı: A favourite among locals, away from the tourist crowds, for an authentic cove experience.'
      ]
    }
  },
  {
    slug: 'villa-tatilinde-bilmeniz-gereken-7-ipucu',
    image: '/blog/villa-tips.svg',
    tr: {
      title: 'Villa Tatilinde Bilmeniz Gereken 7 İpucu',
      excerpt: 'İlk villa tatilinizden önce okumanız gereken pratik öneriler.',
      body: [
        'Otelden villaya geçiş yapan misafirlerimizden en çok aldığımız soruları derledik — rezervasyondan çıkışa kadar bilmenizde fayda olan yedi nokta.',
        '1. Sezonu erken planlayın: Temmuz-Ağustos gibi yoğun dönemlerde beğendiğiniz villa hızla dolabilir, en az 2-3 ay önceden bakmanızı öneririz.',
        '2. Giriş-çıkış saatlerini netleştirin: Çoğu villada giriş 16:00, çıkış 10:00 civarındadır; uçuş saatinize göre erken giriş/geç çıkış talep edebilirsiniz.',
        '3. Market listesi hazırlayın: Villanız tam donanımlı mutfağa sahipse, ilk gece için hafif bir market alışverişi konaklamanın ilk saatlerini çok kolaylaştırır.',
        '4. Havuz ısıtması gerekiyorsa önceden sorun: İlkbahar ve sonbahar aylarında ısıtmalı havuz seçeneği fark yaratır.',
        '5. Ulaşımı düşünün: Villalar genelde merkeze biraz uzak, sakin bölgelerde; kiralık araç ya da transfer planınızı önceden yapın.',
        '6. Hasar depozitosunu okuyun: Çoğu villada girişte alınıp çıkışta iade edilen bir depozito bulunur, şartlarını rezervasyon öncesi netleştirin.',
        '7. Konak sayısını doğru belirtin: Villanın kapasitesi güvenlik ve konfor için önemlidir, misafir sayınızı rezervasyon sırasında doğru bildirin.'
      ]
    },
    en: {
      title: '7 Tips You Need to Know for a Villa Vacation',
      excerpt: 'Practical advice to read before your first villa holiday.',
      body: [
        'We\'ve rounded up the questions we hear most from guests switching from hotels to villas — seven things worth knowing from booking to check-out.',
        '1. Plan the season early: Popular villas fill up fast during July–August; we recommend booking at least 2-3 months ahead.',
        '2. Confirm check-in/out times: Most villas check in around 16:00 and check out around 10:00 — ask about early check-in or late check-out around your flight times.',
        '3. Plan a grocery list: With a fully equipped kitchen, a light grocery run for the first night makes settling in much easier.',
        '4. Ask about pool heating in advance: In spring and autumn, a heated pool option makes a real difference.',
        '5. Plan your transport: Villas are usually in quieter areas a little outside the centre — arrange a rental car or transfer ahead of time.',
        '6. Read the damage deposit terms: Most villas collect a deposit at check-in, refunded at check-out — confirm the terms before booking.',
        '7. State your guest count accurately: Villa capacity matters for both safety and comfort, so declare your exact party size when booking.'
      ]
    }
  }
];

export function findBlogPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
