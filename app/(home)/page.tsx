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
import ProductsSection from "@/components/home/productsSection";
import CryptoBanner from "@/components/home/cryptoBanner";
import ShippingNotice from "@/components/home/shippingNotice";
import { Review } from "@/types/types";
import { ReviewsMarquee } from "@/components/home/reviews-marquee";

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

    // Static data for reviews

    // inside your Page component (server component)
const reviews: Review[] = [
  {
    id: "1",
    name: "Marie",
    handle: "marie_js",
    platform: "twitter",
    text: "Just received my order. Packaging was 🔥 and the product exceeded expectations. Definitely buying again!",
    likes: 24,
    retweets: 5,
    replies: 2,
    avatarUrl: "https://lh6ptlb953.ufs.sh/f/otE6z0gvCqP3zT4I6pMqYhfyDWqS9PAe15nrBlxHbwVtEUdg",
    date: "2h ago",
  },
  {
    id: "2",
    name: "Jose",
    platform: "facebook",
    text: "Best customer service ever! Will order again.",
    likes: 142,
    comments: 8,
    shares: 3,
    avatarUrl: "https://lh6ptlb953.ufs.sh/f/otE6z0gvCqP3UOwEMbFLOryNz0fkKC81E45URpsHneVZmIqg",
    date: "Yesterday at 6:32 PM",
  },
  {
    id: "3",
    name: "Ani",
    platform: "google",
    rating: 5,
    text: "Absolutely love the quality and fast shipping! Highly recommended.Haelolabs to the world!",
    avatarUrl: "https://lh6ptlb953.ufs.sh/f/otE6z0gvCqP3W23ZsXCa1dQmJEszHpX36hT2qUxDFiuAVrLG",
    date: "2 weeks ago",
  },
];

  return (
    <main className="min-h-screen text-white">
      <Hero />
      <CryptoBanner />
      <ShippingNotice />
      
      <TrustBar />
      {/* Reviews Section */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          What people are saying
        </h2>
        <ReviewsMarquee reviews={reviews} />
      </section>
      <ProductsSection 
        products={products} 
        latestProducts={latestProducts} 
      />

      
    </main>
  );
}