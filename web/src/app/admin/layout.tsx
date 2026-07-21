import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const NAV = [
  { href: '/admin/talepler', label: 'Rezervasyonlar' },
  { href: '/admin/villa-talepleri', label: 'Villa Talepleri' },
  { href: '/admin/villalar', label: 'Villalar' },
  { href: '/admin/cakismalar', label: 'Çakışmalar' }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // middleware already redirects; this covers direct layout rendering of /admin/login
    return <>{children}</>;
  }

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single();

  if (!profile || !['admin', 'editor'].includes(profile.role)) {
    // Owners land here if they try the staff panel
    redirect('/admin/login?err=yetki');
  }

  const { count: openConflicts } = await supabase
    .from('conflicts')
    .select('id', { count: 'exact', head: true })
    .is('resolved_at', null);

  // villa_requests lands with migration 009 — count stays null (no badge) until then.
  const { count: newVillaRequests } = await supabase
    .from('villa_requests')
    .select('id', { count: 'exact', head: true })
    .eq('handled', false);

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 bg-pine-900 text-white">
        <div className="border-b border-pine-700 px-5 py-5">
          <div className="text-lg font-semibold tracking-tight">Villa Yönetim</div>
          <div className="mt-0.5 text-xs text-teal-100/60">{profile.full_name}</div>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-teal-50/90 hover:bg-pine-700">
              <span>{item.label}</span>
              {item.href === '/admin/cakismalar' && (openConflicts ?? 0) > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {openConflicts}
                </span>
              )}
              {item.href === '/admin/villa-talepleri' && (newVillaRequests ?? 0) > 0 && (
                <span className="rounded-full bg-aegean-500 px-2 py-0.5 text-xs font-bold text-white">
                  {newVillaRequests}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <form action="/admin/cikis" method="post" className="p-3">
          <button className="w-full rounded-md px-3 py-2 text-left text-sm text-teal-50/60 hover:bg-pine-700">
            Çıkış yap
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
