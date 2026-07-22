/** @type {import('next').NextConfig} */
export default {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }] },
  async redirects() {
    // A page.tsx calling redirect('/tr') here got statically prerendered
    // without ever baking a Location header into the output (Next 14.2
    // static-export quirk) — a config-level redirect is handled by the
    // routing layer directly and always emits a correct 307.
    return [{ source: '/', destination: '/tr', permanent: false }];
  }
};
