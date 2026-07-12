import { getBlogs, getBlogCategories } from "@/actions/blogs";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ChevronRight, BookOpen, Tag } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://haelolabs.com";
const SITE_NAME = "Haelo Labs";
const PAGE_TITLE = "Blog — Insights, Guides & Updates";
const PAGE_DESCRIPTION =
  "Explore our latest articles, research insights, and guides written by our team of experts.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: `${SITE_URL}/blogs` },
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
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/blogs`,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    site: "@haelolabs",
    creator: "@haelolabs",
  },
};

function readingTime(content: string | null): number {
  if (!content) return 1;
  const words = content.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function BlogsPage() {
  const [allBlogs, categories] = await Promise.all([
    getBlogs().then((b) => b ?? []),
    getBlogCategories().then((c) => c ?? []),
  ]);

  // Only show published blogs on the public page
  const blogs = allBlogs.filter((b) => b.published);

  const featured = blogs[0] ?? null;
  const rest = blogs.slice(1);

  // JSON-LD: describes this page as a blog index listing articles (SEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/blogs`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: blogs.slice(0, 20).map((blog, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/blogs/${blog.id}`,
        name: blog.title,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* JSON-LD structured data (SEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Page header ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/8 pt-28 pb-16 px-6">
        {/* subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative max-w-6xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500 mb-5">
            <BookOpen className="h-3.5 w-3.5" />
            Our Journal
          </span>
          <h1
            className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-5"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Stories &amp;
            <br />
            <span className="text-gray-500">Insights</span>
          </h1>
          <p className="text-gray-400 max-w-xl text-lg leading-relaxed">
            Deep-dives, research guides, and expert perspectives — curated for curious minds.
          </p>

          {/* Category filter pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs border border-white/20 text-white bg-white/10 cursor-default">
                All
              </span>
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs border border-white/10 text-gray-400 hover:border-white/25 hover:text-white transition-colors cursor-default"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-20">

        {/* ── Empty state ─────────────────────────────────────────── */}
        {blogs.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-600 text-lg">No articles published yet.</p>
            <p className="text-gray-700 text-sm mt-2">Check back soon.</p>
          </div>
        )}

        {/* ── Featured post ───────────────────────────────────────── */}
        {featured && (
          <Link href={`/blogs/${featured.id}`} className="group block">
            <article className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 bg-white/[0.02] hover:bg-white/[0.04]">
              {/* Image */}
              <div className="relative h-64 md:h-auto overflow-hidden">
                {featured.thumbnail ? (
                  <Image
                    src={featured.thumbnail}
                    alt={featured.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40 md:block hidden" />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1 bg-white text-black text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                    Featured
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 md:p-10 flex flex-col justify-center">
                {featured.categoryTitle && (
                  <span className="text-xs uppercase tracking-widest text-gray-500 mb-3 block">
                    {featured.categoryTitle}
                  </span>
                )}
                <h2
                  className="text-2xl md:text-3xl font-bold leading-snug mb-4 group-hover:text-gray-200 transition-colors"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {featured.title}
                </h2>
                {featured.description && (
                  <p className="text-gray-400 leading-relaxed mb-6 line-clamp-3 text-sm">
                    {featured.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                  {featured.createdAt && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {formatDate(featured.createdAt)}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {readingTime(featured.content ?? null)} min read
                  </span>
                </div>
                <span className="inline-flex items-center gap-2 text-sm text-white font-medium group-hover:gap-3 transition-all">
                  Read article
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </article>
          </Link>
        )}

        {/* ── Rest of posts ───────────────────────────────────────── */}
        {rest.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-10">
              <h2
                className="text-xl font-semibold text-gray-300"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Latest Articles
              </h2>
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-xs text-gray-600">{rest.length} articles</span>
            </div>

            {/* Masonry-style grid: first row has 2 tall cards, rest are standard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((blog, i) => (
                <Link
                  key={blog.id}
                  href={`/blogs/${blog.id}`}
                  className={`group block ${
                    // First two cards span full height (taller)
                    i < 2 ? "sm:row-span-1" : ""
                  }`}
                >
                  <article className="h-full flex flex-col rounded-xl overflow-hidden border border-white/8 hover:border-white/18 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300">
                    {/* Thumbnail */}
                    <div className={`relative overflow-hidden flex-shrink-0 ${i < 2 ? "h-52" : "h-44"}`}>
                      {blog.thumbnail ? (
                        <Image
                          src={blog.thumbnail}
                          alt={blog.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-850 to-zinc-900 flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-zinc-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      {/* Category badge on image */}
                      {blog.categoryTitle && (
                        <div className="absolute bottom-3 left-3">
                          <span className="text-[10px] uppercase tracking-widest bg-black/60 backdrop-blur-sm border border-white/10 text-gray-300 px-2.5 py-1 rounded-full">
                            {blog.categoryTitle}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="flex flex-col flex-1 p-5">
                      <h3
                        className="text-white font-semibold text-base leading-snug mb-2 group-hover:text-gray-200 transition-colors line-clamp-2"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {blog.title}
                      </h3>

                      {blog.description && (
                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                          {blog.description}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/6">
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          {blog.createdAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(blog.createdAt)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {readingTime(blog.content ?? null)} min
                          </span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Newsletter / CTA strip ──────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-8 md:px-14 py-12 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 60% 50%, #fff 0%, transparent 70%)",
            }}
          />
          <p className="text-xs uppercase tracking-[0.2em] text-gray-600 mb-3">Stay in the loop</p>
          <h3
            className="text-2xl md:text-3xl font-bold text-white mb-3"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Never miss an article
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            Get our latest posts delivered straight to your inbox. No spam, unsubscribe anytime.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            Get in touch
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </main>
  );
}