// app/sitemap.ts
import { MetadataRoute } from "next";
import { getAllBlogSlugs } from "@/actions/blogs";
import { getAllProductSlugs } from "@/actions/products";
import { getAllPeptidesForSitemap } from "@/actions/peptideInfo";
import { PEPTIDE_TOPICS, TOPIC_KEYS, sanitizeText } from "@/lib/peptide-topics";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://haelolabs.com";

  // ---------- static pages ----------
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/blogs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // ---------- dynamic content ----------
  const [productSlugs, blogSlugs, peptides] = await Promise.all([
    getAllProductSlugs(),
    getAllBlogSlugs(),
    getAllPeptidesForSitemap(),
  ]);

  // Product pages
  const productPages: MetadataRoute.Sitemap = productSlugs.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((b) => ({
    url: `${baseUrl}/blogs/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Peptide hub pages — lastModified now reflects the actual last edit,
  // not today's date on every build
  const peptideHubPages: MetadataRoute.Sitemap = peptides.map((p) => ({
    url: `${baseUrl}/peptides/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // Fixed topic pages (dosage, benefits, side-effects, etc.) — only
  // included if they actually have content. A page your own metadata
  // marks noindex (empty field) shouldn't be submitted in the sitemap;
  // that mismatch is a minor negative signal to Google.
  const fixedTopicPages: MetadataRoute.Sitemap = peptides.flatMap((p) =>
    TOPIC_KEYS.filter((topic) => {
      if (topic === "faq") return Array.isArray(p.faq) && p.faq.length > 0;
      const field = PEPTIDE_TOPICS[topic].field as keyof typeof p;
      return Boolean(sanitizeText(p[field] as string | null));
    }).map((topic) => ({
      url: `${baseUrl}/peptides/${p.slug}/${topic}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: topic === "faq" ? 0.6 : 0.75,
    }))
  );

  // Admin-created custom topic pages — same empty-content guard, and
  // each uses its own updatedAt so edits to one topic don't falsely
  // bump every other page's lastModified.
  const customTopicPages: MetadataRoute.Sitemap = peptides.flatMap((p) =>
    p.customTopics
      .filter((t) => Boolean(sanitizeText(t.content)))
      .map((t) => ({
        url: `${baseUrl}/peptides/${p.slug}/${t.topicKey}`,
        lastModified: t.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
  );

  return [
    ...staticPages,
    ...productPages,
    ...blogPages,
    ...peptideHubPages,
    ...fixedTopicPages,
    ...customTopicPages,
  ];
}