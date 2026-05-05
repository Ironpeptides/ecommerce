import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/actions/products";
import { ProductClient } from "./product-client";

type RawProduct = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
type RawRelated = Awaited<ReturnType<typeof getRelatedProducts>>[number];

// For related products (simplified product data)


function transformProduct(p: RawProduct) {
  return {
    ...p,
    description:      p.description  ?? "",
    casNumber:        p.casNumber    ?? null,
    formula:          p.formula      ?? null,
    molarMass:        p.molarMass    ?? null,
    category: p.category ? {
      ...p.category,
      description: p.category.description ?? "",
      imageUrl:    p.category.imageUrl    ?? "",
    } : null,
    images:   p.images.map((img) => ({ url: img.url, alt: img.alt ?? "" })),
    variants: p.variants.map((v) => ({
      ...v,
      unit:  v.unit  ?? "",
      sku:   v.sku   ?? "",
    })),
    reviews: p.reviews.map((r) => ({
      id:        r.id,
      rating:    r.rating,
      comment:   r.comment   ?? "",
      userId:    r.userId,
      productId: r.productId,
      createdAt: r.createdAt,
      userName:  r.user?.name ?? "Anonymous",
      userImage: r.user?.image ?? null,
    })),
    batches: p.batches.map((b) => ({
      ...b,
      purity:         b.purity         ?? null,
      coaUrl:         b.coaUrl         ?? null,
      manufacturedAt: b.manufacturedAt ?? null,
      expiryDate:     b.expiryDate     ?? null,
      quantity:       b.quantity       ?? null,
    })),
    certificates: p.certificates ?? [],
  };
}

function transformRelated(p: RawRelated) {
  return {
    ...p,
    description: p.description ?? "",
    casNumber:   p.casNumber   ?? null,
    formula:     p.formula     ?? null,
    category: p.category ? {
      ...p.category,
      description: p.category.description ?? "",
      imageUrl:    p.category.imageUrl    ?? "",
    } : null,
    images:   p.images.map((img) => ({ url: img.url, alt: img.alt ?? "" })),
    variants: p.variants.map((v) => ({ ...v, unit: v.unit ?? "", sku: v.sku ?? "" })),
    reviews:  p.reviews.map((r) => ({
      id: "", rating: r.rating, comment: "", userId: "",
      productId: "", createdAt: new Date(), userName: "",
    })),
    batches:      [],
    certificates: [],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} | Haelolabs`,
    description: product.description?.substring(0, 160) ?? "",
    openGraph: {
      title:       product.name,
      description: product.description?.substring(0, 160) ?? "",
      images:      product.images?.[0]?.url ? [product.images[0].url] : [],
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

  const product  = transformProduct(raw);
  const rawRelated = await getRelatedProducts(raw.id, raw.category?.id ?? null, 4);
  const relatedProducts = rawRelated.map(transformRelated);

  return <ProductClient product={product} relatedProducts={relatedProducts} />;
}