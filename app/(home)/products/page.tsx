import { searchProducts, getFilterOptions } from "@/actions/products";
import { ProductsClient, type Filters, type SortBy } from "./productsClient";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://haelolabs.com";
const SITE_NAME = "Haelolabs";
const VALID_SORTS = new Set<string>(["newest", "rating", "price_asc", "price_desc", "popular"]);

function parseSortBy(value: string | undefined): SortBy {
  return (value && VALID_SORTS.has(value) ? value : "newest") as SortBy;
}

function parseParam(params: Record<string, string | string[] | undefined>, key: string) {
  const v = params[key];
  return typeof v === "string" ? v : undefined;
}

// Number parsing was reading params.minPrice/maxPrice/rating/page directly,
// which silently produced NaN if a param ever arrived as an array
// (?minPrice=1&minPrice=2). Route everything through parseParam first.
function parseNumberParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): number | undefined {
  const raw = parseParam(params, key);
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function humanize(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Filtered/searched views are thin, near-duplicate content relative to the
// base listing — noindex them (but still follow, so link equity flows and
// products remain crawlable) rather than relying on canonical alone to
// keep them out of the index.
function hasActiveFilters(params: Record<string, string | string[] | undefined>): boolean {
  return Boolean(
    parseParam(params, "q") ||
      parseParam(params, "categories") ||
      parseParam(params, "minPrice") ||
      parseParam(params, "maxPrice") ||
      parseParam(params, "inStock") ||
      parseParam(params, "rating")
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const page = parseNumberParam(params, "page") ?? 1;
  const query = parseParam(params, "q");
  const categoriesParam = parseParam(params, "categories");
  const firstCategory = categoriesParam?.split(",").filter(Boolean)[0];
  const filtered = hasActiveFilters(params);

  const baseTitle = "Research Peptides | Premium Lab-Grade Compounds";
  let title = `${baseTitle} | ${SITE_NAME}`;
  let description =
    "Browse our catalog of research-grade peptides. Third-party tested for purity and identity. BPC-157, TB-500, GHK-Cu, and more. Strictly for laboratory research use.";

  if (query) {
    title = `"${query}" Search Results | ${SITE_NAME}`;
    description = `Search results for "${query}" — research-grade peptides, third-party tested for purity and identity. Strictly for laboratory research use.`;
  } else if (firstCategory) {
    const categoryName = humanize(firstCategory);
    title = `${categoryName} Research Peptides | ${SITE_NAME}`;
    description = `Browse ${categoryName} research peptides. Third-party tested for purity and identity. Strictly for laboratory research use.`;
  }

  // Pagination pages 2+ contain genuinely different products, so they get
  // their own self-referencing canonical and an indication of page number —
  // consolidating them to page 1 (as the old static export did) tells
  // Google not to bother indexing the rest of the catalog.
  if (page > 1 && !filtered) {
    title = `${title} | Page ${page}`;
  }

  const canonicalUrl =
    page > 1 && !filtered ? `${SITE_URL}/products?page=${page}` : `${SITE_URL}/products`;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: canonicalUrl },
    robots: {
      index: !filtered,
      follow: true,
      googleBot: {
        index: !filtered,
        follow: true,
        "max-snippet": -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const initialFilters: Filters = {
    categories: parseParam(params, "categories")?.split(",").filter(Boolean) ?? [],
    minPrice: parseNumberParam(params, "minPrice"),
    maxPrice: parseNumberParam(params, "maxPrice"),
    inStock: parseParam(params, "inStock") === "true",
    minRating: parseNumberParam(params, "rating"),
    sortBy: parseSortBy(parseParam(params, "sort")),
  };

  const query = parseParam(params, "q") ?? "";
  const page = parseNumberParam(params, "page") ?? 1;

  let results: Awaited<ReturnType<typeof searchProducts>>;
  let filterOptions: Awaited<ReturnType<typeof getFilterOptions>>;

  try {
    [results, filterOptions] = await Promise.all([
      searchProducts({ query, ...initialFilters, page }),
      getFilterOptions(),
    ]);
  } catch (err) {
    // Degrade gracefully instead of a hard 500 — an empty, still-navigable
    // catalog page beats an error screen, and this keeps the page crawlable.
    console.error("Failed to load products page data:", err);
    results = { products: [], total: 0, page, totalPages: 0, hasMore: false } satisfies Awaited<
      ReturnType<typeof searchProducts>
    >;
    filterOptions = { categories: [], priceRange: { min: 0, max: 0 } } as Awaited<
      ReturnType<typeof getFilterOptions>
    >;
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Research Peptides", item: `${SITE_URL}/products` },
    ],
  };

  // CollectionPage + ItemList mirrors the pattern already used on the blog
  // listing page, giving the catalog a shot at rich results too.
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Research Peptides",
    description:
      "Browse our catalog of research-grade peptides. Third-party tested for purity and identity.",
    url: `${SITE_URL}/products`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: results.products.slice(0, 24).map((product: any, i: number) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/product/${product.slug}`,
        name: product.name,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <ProductsClient
        initialResults={results}
        filterOptions={filterOptions}
        initialQuery={query}
        initialFilters={initialFilters}
      />
    </>
  );
}