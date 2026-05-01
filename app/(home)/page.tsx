"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Hero from "@/components/hero";
import SectionTitle from "@/components/section/section-title";
import ProductCard from "../../components/cards/product-card";
import ShopCard from "../../components/cards/shop.card";
import TrustBar from "@/components/frontend/trust-bar";
import {
  getProducts,
  getProductVariants,
  getProductBatches,
  getProductCategories,
} from "@/actions/products";
import { getTopShops } from "@/actions/shops";
import { getEvents } from "@/actions/events";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Bitcoin } from "lucide-react";

interface PageState {
  products: any[];
  shops: any[];
  offers: any[];
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: PageState = {
  products: [],
  shops: [],
  offers: [],
  loading: true,
  error: null,
};

// ─── Crypto Banner ────────────────────────────────────────────────────────────

const CryptoBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative mt-6 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-3 text-center">
        {/* Bitcoin icon */}
        <Bitcoin size={16} className="text-amber-400 shrink-0" />

        <p className="text-sm text-amber-200/90">
          <span className="font-semibold text-amber-300">Need help paying with crypto?</span>{" "}
          <Link
            href="/crypto-guide"
            className="underline underline-offset-2 text-amber-400 hover:text-amber-300 transition-colors font-medium"
          >
            Get 15% off when you do →
          </Link>
        </p>

        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400/60 hover:text-amber-400 transition-colors"
          aria-label="Dismiss"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const Page = ({ orgId }: { orgId?: string }) => {
  const router = useRouter();
  const [state, setState] = useState<PageState>(INITIAL_STATE);

  // Single fetch — all data in parallel, products fetched only once
  const fetchAll = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [productsData, variantsData, batchesData, categoriesData, shopsData, eventsData] =
        await Promise.all([
          getProducts(orgId).then((res: any) => res ?? []),
          getProductVariants(orgId).then((res: any) => res ?? []),
          getProductBatches(orgId).then((res: any) => res ?? []),
          getProductCategories(orgId).then((res: any) => res ?? []),
          getTopShops(orgId).then((res: any) => res ?? []),
          getEvents(orgId).then((res: any) => res ?? []),
        ]);

      const enrichedProducts = productsData.map((product: any) => ({
        ...product,
        variants: variantsData.filter((v: any) => v.productId === product.id),
        batches: batchesData.filter((b: any) => b.productId === product.id),
        category: categoriesData.find((c: any) => c.id === product.categoryId),
      }));

      setState({
        products: enrichedProducts,
        shops: shopsData,
        offers: eventsData,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("Error fetching page data:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load page data. Please try again.",
      }));
    }
  }, [orgId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Derived data — computed once, not re-fetched
  const latestProducts = useMemo(
    () =>
      [...state.products]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 8),
    [state.products]
  );

  const skeletons = [...Array(5)].map((_, i) => (
    <div
      key={i}
      className="h-64 bg-white/5 animate-pulse rounded-2xl border border-white/5"
    />
  ));

  return (
    <main className="min-h-screen text-white">
      <Hero />
      {/* Crypto payment banner — sits between Hero and TrustBar */}
      <CryptoBanner />

      <TrustBar />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 space-y-24">
        {/* Suggested Products */}
        <section aria-label="Suggested Products" id="suggested-products">
          <div className="flex items-center justify-between mb-8">
            <SectionTitle title="Suggested for Your Research" />
            <button
              onClick={() => router.push("/products")}
              className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
            >
              View All →
            </button>
          </div>

          {state.loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {skeletons}
            </div>
          ) : state.error ? (
            <div className="flex flex-col items-center gap-3 py-12 text-zinc-500">
              <p>{state.error}</p>
              <button
                onClick={fetchAll}
                className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {state.products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Latest Arrivals */}
        <section aria-label="Latest Arrivals">
          <div className="mb-8">
            <SectionTitle title="Latest Arrivals" />
          </div>

          {state.loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {skeletons}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {latestProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="pb-20" />
    </main>
  );
};

export default Page;