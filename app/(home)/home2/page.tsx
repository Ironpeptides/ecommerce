"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Hero from '@/components/hero'
import SectionTitle from '@/components/section/section-title'
import ProductCard from '../../../components/cards/product-card2'
import ShopCard from '../../../components/cards/shop.card';
import TrustBar from '@/components/frontend/trust-bar';
import { getProducts, getProductVariants, getProductBatches, getProductCategories } from "@/actions/products";
import { getTopShops } from "@/actions/shops";
import { getEvents } from "@/actions/events";

/* ─────────────────────────────────────────────
   Bento grid size patterns — cycles every 6 cards
   On desktop: alternates large (col-span-2) & standard
   On mobile: always full width
───────────────────────────────────────────── */
const BENTO_PATTERNS = [
  "col-span-1 md:col-span-2", // wide
  "col-span-1 md:col-span-1", // standard
  "col-span-1 md:col-span-1", // standard
  "col-span-1 md:col-span-2", // wide
  "col-span-1 md:col-span-1", // standard
  "col-span-1 md:col-span-1", // standard
];

const getBentoClass = (index: number) =>
  BENTO_PATTERNS[index % BENTO_PATTERNS.length];

/* ─────────────────────────────────────────────
   Intersection Observer hook for reveal animations
───────────────────────────────────────────── */
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ─────────────────────────────────────────────
   Skeleton card
───────────────────────────────────────────── */
const SkeletonCard = ({ wide = false }: { wide?: boolean }) => (
  <div
    className={`${wide ? "md:col-span-2" : ""} col-span-1 rounded-3xl overflow-hidden bg-white/[0.03] border border-white/[0.06] animate-pulse`}
    style={{ minHeight: "340px" }}
  />
);

/* ─────────────────────────────────────────────
   Animated section wrapper
───────────────────────────────────────────── */
const RevealSection = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Bento product grid
───────────────────────────────────────────── */
const BentoProductGrid = ({
  products,
  loading,
  error,
  onRetry,
}: {
  products: any[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} wide={i % 3 === 0} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-zinc-500">
        <p className="text-sm">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2 rounded-full border border-emerald-500/30 text-emerald-400 text-sm hover:bg-emerald-500/10 transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
      {products.map((product: any, i: number) => {
        const isWide = getBentoClass(i).includes("col-span-2");
        return (
          <RevealSection
            key={product.id}
            delay={Math.min(i * 60, 300)}
            className={`${getBentoClass(i)} group`}
          >
            <div
              className={`
                relative overflow-hidden rounded-3xl h-full
                border border-white/[0.07]
                bg-gradient-to-b from-white/[0.04] to-transparent
                shadow-[0_2px_40px_rgba(0,0,0,0.3)]
                transition-all duration-500 ease-out
                hover:border-white/[0.14]
                hover:shadow-[0_8px_60px_rgba(0,0,0,0.45)]
                hover:-translate-y-1
              `}
            >
              {/* Subtle shine on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent z-10" />
              <ProductCard product={product} isWide={isWide} />
            </div>
          </RevealSection>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Elegant divider
───────────────────────────────────────────── */
const Divider = () => (
  <div className="relative h-px my-2">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/20" />
  </div>
);

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
const page = ({ orgId }: { orgId?: string }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    products: true,
    latest: true,
    shops: true,
  });
  const [error, setError] = useState<{
    products: string | null;
    latest: string | null;
    shops: string | null;
  }>({
    products: null,
    latest: null,
    shops: null,
  });

  /* ── Fetch helpers (memoized to avoid re-creation) ── */
  const fetchEnrichedProducts = useCallback(async () => {
    setLoading(prev => ({ ...prev, products: true }));
    try {
      const [productsData, variantsData, batchesData, categoriesData] = await Promise.all([
        getProducts(orgId).then((res: any) => res ?? []),
        getProductVariants(orgId).then((res: any) => res ?? []),
        getProductBatches(orgId).then((res: any) => res ?? []),
        getProductCategories(orgId).then((res: any) => res ?? []),
      ]);
      const enriched = productsData.map((product: any) => ({
        ...product,
        variants: variantsData.filter((v: any) => v.productId === product.id),
        batches: batchesData.filter((b: any) => b.productId === product.id),
        category: categoriesData.find((c: any) => c.id === product.categoryId),
      }));
      setProducts(enriched);
      setError(prev => ({ ...prev, products: null }));
    } catch {
      setError(prev => ({ ...prev, products: 'Failed to load products' }));
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  }, [orgId]);

  const fetchLatestProducts = useCallback(async () => {
    setLoading(prev => ({ ...prev, latest: true }));
    try {
      const all = await getProducts(orgId).then((res: any) => res ?? []);
      const latest = [...all]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8);
      setLatestProducts(latest);
      setError(prev => ({ ...prev, latest: null }));
    } catch {
      setError(prev => ({ ...prev, latest: 'Failed to load latest products' }));
    } finally {
      setLoading(prev => ({ ...prev, latest: false }));
    }
  }, [orgId]);

  const fetchShops = useCallback(async () => {
    setLoading(prev => ({ ...prev, shops: true }));
    try {
      const shopsData = await getTopShops(orgId).then((res: any) => res ?? []);
      setShops(shopsData);
      setError(prev => ({ ...prev, shops: null }));
    } catch {
      setError(prev => ({ ...prev, shops: 'Failed to load shops' }));
    } finally {
      setLoading(prev => ({ ...prev, shops: false }));
    }
  }, [orgId]);

  /* ── Single parallel fetch on mount ── */
  useEffect(() => {
    fetchEnrichedProducts();
    fetchLatestProducts();
    fetchShops();
  }, [fetchEnrichedProducts, fetchLatestProducts, fetchShops]);

  return (
    <main className="min-h-screen text-white">
      <Hero />
      <TrustBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20 lg:space-y-28">

        {/* ── Suggested Products ── */}
        <section aria-label="Suggested Products" id="suggested-products">
          <RevealSection>
            <div className="flex items-end justify-between mb-10 md:mb-14">
              <div>
                <p className="text-xs tracking-[0.25em] uppercase text-emerald-400/70 mb-2 font-medium">
                  Curated
                </p>
                <SectionTitle title="Suggested for Your Research" />
              </div>
              <a
                href="/products"
                className="hidden sm:inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors duration-300 group"
              >
                View all
                <span className="inline-block translate-x-0 group-hover:translate-x-1 transition-transform duration-300">
                  →
                </span>
              </a>
            </div>
          </RevealSection>

          <BentoProductGrid
            products={products}
            loading={loading.products}
            error={error.products}
            onRetry={fetchEnrichedProducts}
          />

          {/* Mobile "view all" */}
          <RevealSection className="mt-8 flex sm:hidden justify-center">
            <a
              href="/products"
              className="px-6 py-3 rounded-full border border-white/10 text-sm text-zinc-300 hover:border-emerald-500/40 hover:text-white transition-all duration-300"
            >
              View all products →
            </a>
          </RevealSection>
        </section>

        <Divider />

        {/* ── Latest Arrivals ── */}
        <section aria-label="Latest Arrivals">
          <RevealSection>
            <div className="flex items-end justify-between mb-10 md:mb-14">
              <div>
                <p className="text-xs tracking-[0.25em] uppercase text-emerald-400/70 mb-2 font-medium">
                  Fresh In
                </p>
                <SectionTitle title="Latest Arrivals" />
              </div>
              <a
                href="/products?sort=newest"
                className="hidden sm:inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors duration-300 group"
              >
                See newest
                <span className="inline-block translate-x-0 group-hover:translate-x-1 transition-transform duration-300">
                  →
                </span>
              </a>
            </div>
          </RevealSection>

          <BentoProductGrid
            products={latestProducts}
            loading={loading.latest}
            error={error.latest}
          />

          <RevealSection className="mt-8 flex sm:hidden justify-center">
            <a
              href="/products?sort=newest"
              className="px-6 py-3 rounded-full border border-white/10 text-sm text-zinc-300 hover:border-emerald-500/40 hover:text-white transition-all duration-300"
            >
              See all new arrivals →
            </a>
          </RevealSection>
        </section>

      </div>

      <div className="pb-20" />
    </main>
  );
};

export default page;