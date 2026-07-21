import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { findBlogPost, BLOG_POSTS } from '@/lib/blog';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: {
  params: { locale: Locale; slug: string };
}): Promise<Metadata> {
  const post = findBlogPost(params.slug);
  const t = post?.[params.locale] ?? post?.tr;
  return { title: t?.title ?? 'Villamega', description: t?.excerpt };
}

export default function BlogPostPage({ params }: {
  params: { locale: Locale; slug: string };
}) {
  const post = findBlogPost(params.slug);
  if (!post) notFound();
  const t = post[params.locale] ?? post.tr;

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <Link href={`/${params.locale}`} className="text-sm font-semibold text-navy/60 hover:text-navy">
        ← {params.locale === 'tr' ? 'Anasayfa' : 'Home'}
      </Link>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={post.image} alt="" className="mt-5 aspect-[2/1] w-full rounded-2xl object-cover" />
      <h1 className="font-display mt-8 text-4xl font-semibold leading-tight text-navy">{t.title}</h1>
      <div className="mt-2 h-px w-14 bg-brass" />
      <div className="mt-8 space-y-5 text-navy/80">
        {t.body.map((para, i) => (
          <p key={i} className={i === 0 ? 'font-display text-lg italic leading-relaxed text-navy/90' : 'leading-relaxed'}>
            {para}
          </p>
        ))}
      </div>
    </article>
  );
}
