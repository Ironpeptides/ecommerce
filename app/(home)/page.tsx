"use client";

import React, { useEffect, useState } from 'react'
import Hero from '@/components/hero'
import SectionTitle from '@/components/section/section-title'
import ProductCard from '../../components/cards/product-card'
import ShopCard from '../../components/cards/shop.card';
import TrustBar from '@/components/frontend/trust-bar';
import { getProducts, getProductVariants, getProductBatches, getProductCategories } from "@/actions/products"; // Adjust import path as needed
import { getTopShops } from "@/actions/shops";
import { getEvents } from "@/actions/events";


// Skeleton Loader Component
const SkeletonCard = () => (
  <div className="group relative rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden animate-pulse">
    <div className="aspect-square bg-white/5" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-white/5 rounded w-3/4" />
      <div className="h-3 bg-white/5 rounded w-1/2" />
      <div className="h-4 bg-white/5 rounded w-1/4" />
    </div>
  </div>
);

const SkeletonGrid = ({ count = 5 }: { count?: number }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
    {[...Array(count)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// Error State Component
const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="text-red-400/80 mb-3">
      <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <p className="text-zinc-400 text-sm">{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="mt-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-zinc-300"
      >
        Try Again
      </button>
    )}
  </div>
);

const Page = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState({
    products: true,
    latest: true,
    shops: true,
    offers: true
  });
  
  const [error, setError] = useState({
    products: null as string | null,
    latest: null as string | null,
    shops: null as string | null,
    offers: null as string | null
  });

  const orgId = process.env.NEXT_PUBLIC_ORG_ID || 'default-org-id'; // Adjust as needed

  // Fetch products with variants, batches, and categories
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(prev => ({ ...prev, products: true }));
        const [productsData, variantsData, batchesData, categoriesData] = await Promise.all([
          getProducts(orgId).then((res) => res ?? []),
          getProductVariants(orgId).then((res) => res ?? []),
          getProductBatches(orgId).then((res) => res ?? []),
          getProductCategories(orgId).then((res) => res ?? []),
        ]);
        
        // Enrich products with variants, batches, and categories
        const enrichedProducts = productsData.map((product: any) => ({
          ...product,
          variants: variantsData.filter((v: any) => v.productId === product.id),
          batches: batchesData.filter((b: any) => b.productId === product.id),
          category: categoriesData.find((c: any) => c.id === product.categoryId),
        }));
        
        setProducts(enrichedProducts);
        setError(prev => ({ ...prev, products: null }));
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(prev => ({ ...prev, products: 'Failed to load products' }));
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };

    fetchProducts();
  }, [orgId]);

  // Fetch latest products
  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        setLoading(prev => ({ ...prev, latest: true }));
        // Assuming you have a getLatestProducts function
        // If not, you can filter products by date
        const allProducts = await getProducts(orgId).then((res) => res ?? []);
        const latest = allProducts
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8);
        
        setLatestProducts(latest);
        setError(prev => ({ ...prev, latest: null }));
      } catch (err) {
        console.error('Error fetching latest products:', err);
        setError(prev => ({ ...prev, latest: 'Failed to load latest products' }));
        // Keep static fallback
        
      } finally {
        setLoading(prev => ({ ...prev, latest: false }));
      }
    };

    fetchLatestProducts();
  }, [orgId]);

  // Fetch top shops
  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(prev => ({ ...prev, shops: true }));
        const shopsData = await getTopShops(orgId).then((res) => res ?? []);
        setShops(shopsData);
        setError(prev => ({ ...prev, shops: null }));
      } catch (err) {
        console.error('Error fetching shops:', err);
        setError(prev => ({ ...prev, shops: 'Failed to load shops' }));
      } finally {
        setLoading(prev => ({ ...prev, shops: false }));
      }
    };

    fetchShops();
  }, [orgId]);

  // Fetch events/offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(prev => ({ ...prev, offers: true }));
        const eventsData = await getEvents(orgId).then((res) => res ?? []);
        setOffers(eventsData);
        setError(prev => ({ ...prev, offers: null }));
      } catch (err) {
        console.error('Error fetching offers:', err);
        setError(prev => ({ ...prev, offers: 'Failed to load offers' }));
        
      } finally {
        setLoading(prev => ({ ...prev, offers: false }));
      }
    };

    fetchOffers();
  }, [orgId]);

  // Retry handlers
  const retryProducts = () => {
    setLoading(prev => ({ ...prev, products: true }));
    // Re-run the fetch effect by forcing re-fetch
    const fetchProducts = async () => {
      try {
        const [productsData, variantsData, batchesData, categoriesData] = await Promise.all([
          getProducts(orgId).then((res) => res ?? []),
          getProductVariants(orgId).then((res) => res ?? []),
          getProductBatches(orgId).then((res) => res ?? []),
          getProductCategories(orgId).then((res) => res ?? []),
        ]);
        
        const enrichedProducts = productsData.map((product: any) => ({
          ...product,
          variants: variantsData.filter((v: any) => v.productId === product.id),
          batches: batchesData.filter((b: any) => b.productId === product.id),
          category: categoriesData.find((c: any) => c.id === product.categoryId),
        }));
        
        setProducts(enrichedProducts);
        setError(prev => ({ ...prev, products: null }));
      } catch (err) {
        setError(prev => ({ ...prev, products: 'Failed to load products' }));
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };
    fetchProducts();
  };

  const retryShops = () => {
    setLoading(prev => ({ ...prev, shops: true }));
    const fetchShops = async () => {
      try {
        const shopsData = await getTopShops(orgId).then((res) => res ?? []);
        setShops( shopsData);
        setError(prev => ({ ...prev, shops: null }));
      } catch (err) {
        setError(prev => ({ ...prev, shops: 'Failed to load shops' }));
      } finally {
        setLoading(prev => ({ ...prev, shops: false }));
      }
    };
    fetchShops();
  };

  // Smooth scroll handler
  const handleViewAll = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="min-h-screen text-white">
      <Hero />
      <TrustBar />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 space-y-24">
        {/* ── Suggested Products ── */}
        <section aria-label="Suggested Products" id="suggested-products">
          <div className="flex items-center justify-between mb-8">
            <SectionTitle title="Suggested for Your Research" />
            <button 
              onClick={() => handleViewAll('suggested-products')}
              className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-all duration-200 hover:translate-x-0.5 group flex items-center gap-1"
            >
              View All 
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </div>

          {loading.products ? (
            <SkeletonGrid count={5} />
          ) : error.products ? (
            <ErrorState message={error.products} onRetry={retryProducts} />
          ) : products?.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">No products available at the moment.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {products?.map((product: any, index: number) => (
                <div 
                  key={product.id || index} 
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Divider ── */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* ── Latest Arrivals ── */}
        <section aria-label="Latest Arrivals" id="latest-arrivals">
          <div className="mb-8">
            <SectionTitle title="Latest Arrivals" />
          </div>
          
          {loading.latest ? (
            <SkeletonGrid count={4} />
          ) : error.latest ? (
            <ErrorState message={error.latest} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {latestProducts?.map((product: any, index: number) => (
                <div 
                  key={product.id || index} 
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Partner Labs ── */}
        <section
          aria-label="Trusted Partners"
          className="relative rounded-3xl border border-white/10 p-8 md:p-12 overflow-hidden transition-all duration-300 hover:border-white/20"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/5 blur-[80px]" />

          <div className="mb-10 text-center md:text-left">
            <SectionTitle title="Verified Partner Laboratories" />
            <p className="text-zinc-500 mt-2 text-sm">
              Direct fulfillment from ISO-certified facilities.
            </p>
          </div>

          {loading.shops ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white/5 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : error.shops ? (
            <ErrorState message={error.shops} onRetry={retryShops} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {shops?.map((shop: any, index: number) => (
                <div 
                  key={shop.id || index} 
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ShopCard shop={shop} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Offers ── */}
        <section aria-label="Limited Time Offers" id="offers">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <SectionTitle title="Current Research Grants & Offers" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {loading.offers ? (
            <SkeletonGrid count={4} />
          ) : error.offers ? (
            <ErrorState message={error.offers} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {offers?.map((product: any, index: number) => (
                <div 
                  key={product.id || index} 
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} isEvent={true} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="pb-20" />

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </main>
  );
}

export default Page;