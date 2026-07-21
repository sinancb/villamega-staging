import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { BLOG_POSTS } from '@/lib/blog';

export function BlogTeaser({ locale, title, readMoreLabel }: {
  locale: Locale; title: string; readMoreLabel: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h2 className="font-display text-3xl font-semibold text-navy">{title}</h2>
      <div className="mb-6 mt-3 h-px w-14 bg-brass" />
      <div className="grid gap-6 md:grid-cols-3">
        {BLOG_POSTS.map((post) => {
          const t = post[locale] ?? post.tr;
          return (
            <Link key={post.slug} href={`/${locale}/blog/${post.slug}`}
              className="group block overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brass/60 hover:shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image} alt="" className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold leading-snug text-navy">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy/70">{t.excerpt}</p>
                <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wide text-brass group-hover:underline">
                  {readMoreLabel} →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
