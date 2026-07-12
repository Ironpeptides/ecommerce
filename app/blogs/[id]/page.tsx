import { getBlogById, getRelatedBlogs } from "@/actions/blogs";
import { getReactions } from "@/actions/reactions";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Tag, ArrowLeft, ArrowRight, User } from "lucide-react";
import type { Metadata } from "next";
import BlogReactions from "@/components/blogs/blogReactions";

type Props = {
  params: Promise<{ id: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://haelolabs.com";
const SITE_NAME = "Haelo Labs";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const blog = await getBlogById(id);

  if (!blog) {
    return {
      title: "Blog Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description = blog.description ?? undefined;
  const canonicalUrl = `${SITE_URL}/blogs/${id}`;
  const ogImages = blog.thumbnail
    ? [{ url: blog.thumbnail, width: 1200, height: 630, alt: blog.title }]
    : [];

  // Simple keyword extraction from category + title, dedup'd.
  const keywords = Array.from(
    new Set(
      [blog.categoryTitle, ...blog.title.split(/\s+/)]
        .filter(Boolean)
        .map((k) => (k as string).toLowerCase())
    )
  );

  return {
    title: blog.title,
    description,
    keywords: keywords.length ? keywords : undefined,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: canonicalUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: blog.title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: ogImages,
      type: "article",
      locale: "en_US",
      publishedTime: new Date(blog.createdAt).toISOString(),
      modifiedTime: new Date(blog.createdAt).toISOString(),
      authors: blog.authorName ? [blog.authorName] : undefined,
      ...(blog.categoryTitle && { section: blog.categoryTitle }),
      tags: keywords.length ? keywords : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description,
      images: blog.thumbnail ? [blog.thumbnail] : [],
      site: "@haelolabs",
      creator: "@haelolabs",
    },
  };
}

function readingTime(content: string | null): number {
  if (!content) return 1;
  const wordCount = content.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage({ params }: Props) {
  const { id } = await params;

  const blog = await getBlogById(id);
  if (!blog) notFound();

  const [related, initialReactions] = await Promise.all([
    getRelatedBlogs(id).catch(() => []),
    getReactions(id),
  ]);

  const mins = readingTime(blog.content);
  const isoDate = new Date(blog.createdAt).toISOString();
  const canonicalUrl = `${SITE_URL}/blogs/${id}`;

  // JSON-LD structured data for richer SEO / Google snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.description ?? undefined,
    image: blog.thumbnail ? [blog.thumbnail] : undefined,
    datePublished: isoDate,
    dateModified: isoDate,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    articleSection: blog.categoryTitle ?? undefined,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    author: blog.authorName
      ? {
          "@type": "Person",
          name: blog.authorName,
          ...(blog.authorTitle && { jobTitle: blog.authorTitle }),
        }
      : undefined,
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* JSON-LD structured data (SEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article aria-labelledby="blog-title">
        {/* ── Hero ── */}
        <header className="relative w-full h-[58vh] min-h-[420px] max-h-[680px] overflow-hidden">
          {blog.thumbnail ? (
            <Image
              src={blog.thumbnail}
              alt={blog.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/20" />

          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20">
            <Link
              href="/blogs"
              aria-label="Back to all blogs"
              className="inline-flex items-center gap-2 text-sm text-gray-200 hover:text-white transition-colors bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 sm:px-4 py-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">All Blogs</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 px-4 sm:px-6 md:px-12 lg:px-24 pb-8 sm:pb-12 md:pb-16">
            <div className="max-w-4xl">
              {blog.categoryTitle && (
                <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-widest text-gray-200 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1 mb-4">
                  <Tag className="h-3 w-3" />
                  {blog.categoryTitle}
                </span>
              )}
              <h1
                id="blog-title"
                className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-4 sm:mb-5 max-w-4xl text-center"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {blog.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-300">
                {blog.authorName && (
                  <span className="flex items-center gap-2">
                    {blog.authorImage ? (
                      <Image
                        src={blog.authorImage}
                        alt={blog.authorName}
                        width={28}
                        height={28}
                        className="rounded-full object-cover border border-white/20"
                      />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        <User className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <span className="font-medium text-white">{blog.authorName}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  <time dateTime={isoDate}>{formatDate(blog.createdAt)}</time>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {mins} min read
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Body ── */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-14 md:py-16">
          {blog.description && (
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed border-l-2 border-white/30 pl-4 sm:pl-5 mb-10 sm:mb-12 italic">
              {blog.description}
            </p>
          )}

          {blog.content ? (
            <div
              className="blog-prose"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          ) : (
            <p className="text-gray-500 italic">This article has no content yet.</p>
          )}

          {/* ── Reactions ── */}
          <div className="mt-12">
            <BlogReactions blogId={id} initialReactions={initialReactions} />
          </div>

          {/* ── Author card ── */}
          {blog.authorName && (
            <aside
              className="mt-12 border-t border-white/10 pt-10"
              aria-label="About the author"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
                {blog.authorImage ? (
                  <Image
                    src={blog.authorImage}
                    alt={blog.authorName}
                    width={64}
                    height={64}
                    className="rounded-full object-cover border-2 border-white/20 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">
                    Written by
                  </p>
                  <p className="text-lg font-semibold text-white">{blog.authorName}</p>
                  {blog.authorTitle && (
                    <p className="text-sm text-gray-400 mt-0.5">{blog.authorTitle}</p>
                  )}
                </div>
              </div>
            </aside>
          )}
        </div>
      </article>

      {/* ── Related Blogs ── */}
      {related.length > 0 && (
        <section
          aria-label="Related articles"
          className="border-t border-white/10 bg-zinc-950 py-12 sm:py-16 px-4 sm:px-6 md:px-10"
        >
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 sm:mb-8"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              More in <span className="text-gray-400">{blog.categoryTitle}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {related.map((rb) => (
                <Link
                  key={rb.id}
                  href={`/blogs/${rb.id}`}
                  className="group flex flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/25 hover:bg-white/[0.07] transition-all"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {rb.thumbnail ? (
                      <Image
                        src={rb.thumbnail}
                        alt={rb.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    {rb.categoryTitle && (
                      <span className="text-[11px] text-gray-500 uppercase tracking-widest mb-2 block">
                        {rb.categoryTitle}
                      </span>
                    )}
                    <h3
                      className="text-white font-semibold text-base leading-snug group-hover:text-gray-200 transition-colors line-clamp-2 mb-3"
                      style={{ fontFamily: "'Georgia', serif" }}
                    >
                      {rb.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-auto group-hover:text-white group-hover:gap-2 transition-all">
                      Read article <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        .blog-prose { color: #d1d5db; font-size: 1.0625rem; line-height: 1.85; font-family: Georgia, 'Times New Roman', serif; }
        @media (max-width: 640px) {
          .blog-prose { font-size: 1rem; line-height: 1.8; }
        }
        .blog-prose > *:first-child { margin-top: 0; }
        .blog-prose h1, .blog-prose h2, .blog-prose h3, .blog-prose h4 { font-family: Georgia, serif; color: #ffffff; margin-top: 2.5rem; margin-bottom: 1rem; line-height: 1.3; font-weight: 700; letter-spacing: -0.02em; scroll-margin-top: 2rem; }
        .blog-prose h1 { font-size: 1.875rem; }
        .blog-prose h2 { font-size: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem; }
        .blog-prose h3 { font-size: 1.25rem; }
        @media (min-width: 640px) {
          .blog-prose h1 { font-size: 2rem; }
          .blog-prose h2 { font-size: 1.6rem; }
        }
        .blog-prose p  { margin-bottom: 1.5rem; }
        .blog-prose a  { color: #e5e7eb; text-decoration: underline; text-underline-offset: 3px; transition: color 0.2s; word-break: break-word; }
        .blog-prose a:hover { color: #ffffff; }
        .blog-prose strong { color: #ffffff; font-weight: 600; }
        .blog-prose em { color: #9ca3af; }
        .blog-prose blockquote { border-left: 3px solid rgba(255,255,255,0.2); padding-left: 1.25rem; margin: 2rem 0; color: #9ca3af; font-style: italic; font-size: 1.1rem; }
        .blog-prose ul, .blog-prose ol { margin: 1.5rem 0; padding-left: 1.5rem; }
        .blog-prose li { margin-bottom: 0.5rem; }
        .blog-prose ul li { list-style-type: disc; }
        .blog-prose ol li { list-style-type: decimal; }
        .blog-prose img { width: 100%; height: auto; border-radius: 0.75rem; margin: 2rem 0; border: 1px solid rgba(255,255,255,0.08); }
        .blog-prose figure { margin: 2rem 0; }
        .blog-prose figcaption { text-align: center; font-size: 0.875rem; color: #9ca3af; margin-top: 0.75rem; font-style: italic; }
        .blog-prose pre { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.5rem; padding: 1.25rem; overflow-x: auto; margin: 2rem 0; font-size: 0.875rem; -webkit-overflow-scrolling: touch; }
        .blog-prose code { font-family: 'Courier New', monospace; background: rgba(255,255,255,0.08); padding: 0.15em 0.4em; border-radius: 0.25rem; font-size: 0.875em; color: #e5e7eb; word-break: break-word; }
        .blog-prose pre code { background: transparent; padding: 0; word-break: normal; }
        .blog-prose hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 3rem 0; }
        .blog-prose table { width: 100%; border-collapse: collapse; margin: 2rem 0; font-size: 0.9rem; display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        @media (min-width: 768px) { .blog-prose table { display: table; } }
        .blog-prose th { text-align: left; padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.15); color: #ffffff; font-weight: 600; white-space: nowrap; }
        .blog-prose td { padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.07); }
      `}</style>
    </main>
  );
}