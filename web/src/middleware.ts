import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Refreshes the Supabase session and guards /admin.
// Role checks (admin/editor) happen in the admin layout — RLS is the real wall;
// this just keeps anonymous visitors out of the shell.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isLogin = request.nextUrl.pathname === '/admin/login';

  if (isAdminPath && !isLogin && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  if (isLogin && user) {
    return NextResponse.redirect(new URL('/admin/talepler', request.url));
  }
  return response;
}

export const config = { matcher: ['/admin/:path*'] };
