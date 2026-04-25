// app/product/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/actions/products";
import { ProductClient } from "./product-client";

// Define proper types that match your Prisma schema with null handling
type ProductWithRelations = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

// Transform the product to ensure string fields are never null
function transformProduct(product: ProductWithRelations) {
  return {
    ...product,
    description: product.description || "",
    category: product.category ? {
      ...product.category,
      description: product.category.description || "",
      imageUrl: product.category.imageUrl || "",
    } : null,
    images: product.images.map((img: any) => ({
      ...img,
      alt: img.alt || "",
    })),
    reviews: product.reviews.map((review: any) => ({
      ...review,
      comment: review.comment || "",
    })),
  };
}

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }
  
  return {
    title: `${product.name} | [Site Name]`,
    description: product.description?.substring(0, 160) || "",
    openGraph: {
      title: product.name,
      description: product.description?.substring(0, 160) || "",
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Fetch product using your action
  const rawProduct = await getProductBySlug(slug);
  
  if (!rawProduct) {
    notFound();
  }
  
  // Transform the product to handle null values
  const product = transformProduct(rawProduct);
  
  // Fetch related products
  const relatedProducts = await getRelatedProducts(product.id, product.category?.id || null, 4);
  
  // Transform related products (convert null descriptions to empty strings)
  const transformedRelatedProducts = relatedProducts.map((p: any) => ({
    ...p,
    description: p.description || "",
    category: p.category ? {
      ...p.category,
      description: p.category.description || "",
      imageUrl: p.category.imageUrl || "",
    } : null,
  }));
  
  return <ProductClient product={product} relatedProducts={transformedRelatedProducts} />;
}