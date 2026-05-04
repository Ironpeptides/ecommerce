// app/page.tsx
// NO "use client" - this is now a server component

import Hero from "@/components/hero";
import TrustBar from "@/components/frontend/trust-bar";
import {
  getProducts,
  getProductVariants,
  getProductBatches,
  getProductCategories,
} from "@/actions/products";
import { getTopShops } from "@/actions/shops";
import { getEvents } from "@/actions/events";
import ProductsSection from "@/components/home/productsSection";
import CryptoBanner from "@/components/home/cryptoBanner";
import ShippingNotice from "@/components/home/shippingNotice";

// Data fetches on the server — no loading skeleton, no useEffect
export default async function Page({ searchParams }: { searchParams?: any }) {
  const orgId = undefined;

  const [productsData, variantsData, batchesData, categoriesData] =
    await Promise.all([
      getProducts(orgId).then((res: any) => res ?? []),
      getProductVariants(orgId).then((res: any) => res ?? []),
      getProductBatches(orgId).then((res: any) => res ?? []),
      getProductCategories(orgId).then((res: any) => res ?? []),
    ]);

  const products = productsData.map((product: any) => ({
    ...product,
    variants: variantsData.filter((v: any) => v.productId === product.id),
    batches: batchesData.filter((b: any) => b.productId === product.id),
    category: categoriesData.find((c: any) => c.id === product.categoryId),
  }));

  const latestProducts = [...products]
    .sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 8);

  return (
    <main className="min-h-screen text-white">
      <Hero />
      <CryptoBanner />
      <ShippingNotice />
      <TrustBar />
      <ProductsSection 
        products={products} 
        latestProducts={latestProducts} 
      />
    </main>
  );
}