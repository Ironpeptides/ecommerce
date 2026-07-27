import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts, getAllProductSlugs } from "@/actions/products";
import { ProductClient } from "./product-client";

type RawProduct = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
type RawRelated = Awaited<ReturnType<typeof getRelatedProducts>>[number];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://haelolabs.com";
const SITE_NAME = "Haelolabs";

// TODO: confirm actual Prisma field names. `molarMass` / `formula` aren't on
// RawProduct's inferred type — either the schema field is named differently
// (e.g. `molecularWeight`) or the query's select/include isn't returning it.
// Replace this helper once confirmed; don't leave the `any` fallback in long-term.
function getMolecularWeight(p: any): string | null {
  return p.molarMass ?? p.molecularWeight ?? null;
}
function getFormula(p: any): string | null {
  return p.formula ?? p.molecularFormula ?? null;
}

function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated}...`;
}

function transformProduct(p: RawProduct) {
  // Pull purity from the most recent batch (if available)
  const latestBatch = p.batches?.length
    ? p.batches.sort((a: any, b: any) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      )[0]
    : null;

  return {
    ...p,
    description: p.description ?? "",
    casNumber: p.casNumber ?? null,
    molecularFormula: getFormula(p),
    molecularWeight: getMolecularWeight(p),
    purity: latestBatch?.purity ?? null,
    category: p.category
      ? {
          ...p.category,
          description: p.category.description ?? "",
          imageUrl: p.category.imageUrl ?? "",
        }
      : null,
    images: p.images.map((img: any) => ({
      url: img.url,
      // Fallback to product name instead of empty string — empty alt text
      // is a missed image-search and accessibility opportunity.
      alt: img.alt || p.name,
    })),
    variants: p.variants.map((v: any) => ({
      ...v,
      unit: v.unit ?? "",
      sku: v.sku ?? "",
    })),
    reviews: p.reviews.map((r: any) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment ?? "",
      userId: r.userId,
      productId: r.productId,
      createdAt: r.createdAt,
      userName: r.user?.name ?? "Anonymous",
      userImage: r.user?.image ?? null,
    })),
    batches: p.batches.map((b: any) => ({
      ...b,
      purity: b.purity ?? null,
      coaUrl: b.coaUrl ?? null,
      manufacturedAt: b.manufacturedAt ?? null,
      expiryDate: b.expiryDate ?? null,
      quantity: b.quantity ?? null,
    })),
    certificates: p.certificates ?? [],
  };
}

function transformRelated(p: RawRelated) {
  return {
    ...p,
    description: p.description ?? "",
    casNumber: p.casNumber ?? null,
    molecularFormula: getFormula(p),
    molecularWeight: getMolecularWeight(p),
    category: p.category
      ? {
          ...p.category,
          description: p.category.description ?? "",
          imageUrl: p.category.imageUrl ?? "",
        }
      : null,
    images: p.images.map((img: any) => ({ url: img.url, alt: img.alt || p.name })),
    variants: p.variants.map((v: any) => ({ ...v, unit: v.unit ?? "", sku: v.sku ?? "" })),
    reviews: p.reviews.map((r: any) => ({
      id: "",
      rating: r.rating,
      comment: "",
      userId: "",
      productId: "",
      createdAt: new Date(),
      userName: "",
    })),
    batches: [],
    certificates: [],
  };
}

// CRITICAL: Pre-build all product pages at deploy time
export async function generateStaticParams() {
  const products = await getAllProductSlugs();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  const title = `${product.name} | Research Peptide | ${SITE_NAME}`;
  const description = product.description
    ? truncateAtWord(product.description, 155)
    : `Research-grade ${product.name} peptide for laboratory use. Third-party tested.`;

  const canonicalUrl = `${SITE_URL}/product/${slug}`;
  const imageUrl = product.images?.[0]?.url;

  // Long-term out-of-stock products: keep them crawlable (don't 404 good
  // URLs / lose backlinks) but signal not to actively index them, so they
  // don't dilute quality signals or show broken "buy" intent in search.
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: canonicalUrl },
    robots: {
      index: !isOutOfStock,
      follow: true,
      googleBot: {
        index: !isOutOfStock,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: `${product.name} | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: product.name }] : [],
      // "product" isn't just untyped — Next validates og:type at runtime
      // too and throws on unsupported values, so the earlier `as` cast just
      // deferred the failure. "website" is the safe, supported choice, and
      // real product-catalog behavior (price/availability in link previews)
      // needs og:price:amount / og:availability tags that Next's metadata
      // API doesn't expose anyway, so this isn't losing real functionality.
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${SITE_NAME}`,
      description,
      images: imageUrl ? [imageUrl] : [],
      site: "@haelolabs",
      creator: "@haelolabs",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const raw = await getProductBySlug(slug);
  if (!raw) notFound();

  const product = transformProduct(raw);
  const rawRelated = await getRelatedProducts(raw.id, raw.category?.id ?? null, 4);
  const relatedProducts = rawRelated.map(transformRelated);

  // Calculate rating for JSON-LD
  const avgRating = product.reviews.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0;

  // Product Schema markup for rich snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => img.url),
    description: product.description || `Research-grade ${product.name}`,
    sku: product.variants[0]?.sku || product.id,
    brand: { "@type": "Brand", name: SITE_NAME },
    category: product.category?.title,
    // Feeds entity/knowledge-graph understanding better than the old meta
    // keywords tag ever did — Google has ignored meta keywords for years.
    additionalProperty: [
      product.casNumber
        ? { "@type": "PropertyValue", name: "CAS Number", value: product.casNumber }
        : null,
      product.molecularFormula
        ? { "@type": "PropertyValue", name: "Molecular Formula", value: product.molecularFormula }
        : null,
      product.molecularWeight
        ? { "@type": "PropertyValue", name: "Molecular Weight", value: String(product.molecularWeight) }
        : null,
      product.purity
        ? { "@type": "PropertyValue", name: "Purity", value: String(product.purity) }
        : null,
    ].filter(Boolean),
    offers:
      product.variants.length > 0
        ? product.variants.map((v) => ({
            "@type": "Offer",
            url: `${SITE_URL}/product/${slug}`,
            priceCurrency: "USD",
            price: v.price?.toString() || "0",
            // Valid for 1 year from now — adjust if you run shorter pricing
            // cycles. Missing this can quietly disqualify a page from
            // Product rich results even when the rest of the markup is valid.
            priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            availability:
              v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "US",
              returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
              merchantReturnDays: 30,
              returnMethod: "https://schema.org/ReturnByMail",
              returnFees: "https://schema.org/FreeReturn",
            },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "MonetaryAmount",
                currency: "USD",
                value: "0",
              },
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "US",
              },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: {
                  "@type": "QuantitativeValue",
                  minValue: 0,
                  maxValue: 1,
                  unitCode: "d",
                },
                transitTime: {
                  "@type": "QuantitativeValue",
                  minValue: 2,
                  maxValue: 7,
                  unitCode: "d",
                },
              },
            },
          }))
        : [
            {
              "@type": "Offer",
              url: `${SITE_URL}/product/${slug}`,
              priceCurrency: "USD",
              price: product.salePrice?.toString() || "0",
              priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              availability:
                product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                applicableCountry: "US",
                returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                merchantReturnDays: 30,
                returnMethod: "https://schema.org/ReturnByMail",
                returnFees: "https://schema.org/FreeReturn",
              },
            },
          ],
    aggregateRating:
      product.reviews.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: product.reviews.length.toString(),
          }
        : undefined,
  };

  // BreadcrumbList schema — shows Category > Product in the SERP and
  // reinforces site hierarchy to Google. Bigger win on product pages than
  // most sites bother to add.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      product.category
        ? {
            "@type": "ListItem",
            position: 2,
            name: product.category.title,
            item: `${SITE_URL}/category/${product.category.slug}`,
          }
        : null,
      {
        "@type": "ListItem",
        position: product.category ? 3 : 2,
        name: product.name,
        item: `${SITE_URL}/product/${slug}`,
      },
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}