"use client";

import React, { useState, useEffect } from 'react'
import Hero from '@/components/hero'
import SectionTitle from '@/components/section/section-title'
import ProductCard from '../../components/cards/product-card'
import ShopCard from '../../components/cards/shop.card';
import TrustBar from '@/components/frontend/trust-bar';
import { getProducts, getProductVariants, getProductBatches, getProductCategories } from "@/actions/products"; // Adjust import path as needed
import { getTopShops } from "@/actions/shops";
import { getEvents } from "@/actions/events"; 
const page = ({ orgId }: { orgId?: string }) => {

  const [products, setProducts] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    products: true,
    latest: true,
    shops: true,
    offers: true,
  });
  const [error, setError] = useState<{ products: string | null; latest: string | null; shops: string | null; offers: string | null }>({
    products: null,
    latest: null,
    shops: null,
    offers: null,
  });

  // Fetch suggested products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(prev => ({ ...prev, products: true }));
        const [productsData, variantsData, batchesData, categoriesData] = await Promise.all([
          getProducts(orgId).then((res: any) => res ?? []),
          getProductVariants(orgId).then((res: any) => res ?? []),
          getProductBatches(orgId).then((res: any) => res ?? []),
          getProductCategories(orgId).then((res: any) => res ?? []),
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
        const allProducts = await getProducts(orgId).then((res: any) => res ?? []);
        const latest = allProducts
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8);
        setLatestProducts(latest);
        setError(prev => ({ ...prev, latest: null }));
      } catch (err) {
        console.error('Error fetching latest products:', err);
        setError(prev => ({ ...prev, latest: 'Failed to load latest products' }));
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
        const shopsData = await getTopShops(orgId).then((res: any) => res ?? []);
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
        const eventsData = await getEvents(orgId).then((res: any) => res ?? []);
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
    const fetchProducts = async () => {
      try {
        const [productsData, variantsData, batchesData, categoriesData] = await Promise.all([
          getProducts(orgId).then((res: any) => res ?? []),
          getProductVariants(orgId).then((res: any) => res ?? []),
          getProductBatches(orgId).then((res: any) => res ?? []),
          getProductCategories(orgId).then((res: any) => res ?? []),
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
        const shopsData = await getTopShops(orgId).then((res: any) => res ?? []);
        setShops(shopsData);
        setError(prev => ({ ...prev, shops: null }));
      } catch (err) {
        setError(prev => ({ ...prev, shops: 'Failed to load shops' }));
      } finally {
        setLoading(prev => ({ ...prev, shops: false }));
      }
    };
    fetchShops();
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
            <button className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors">
              View All →
            </button>
          </div>

          {loading.products ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-64 bg-white/5 animate-pulse rounded-2xl border border-white/5" />
              ))}
            </div>
          ) : error.products ? (
            <div className="flex flex-col items-center gap-3 py-12 text-zinc-500">
              <p>{error.products}</p>
              <button
                onClick={retryProducts}
                className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {products?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* ── Divider ── */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* ── Latest Arrivals ── */}
        <section aria-label="Latest Arrivals">
          <div className="mb-8">
            <SectionTitle title="Latest Arrivals" />
          </div>
          {loading.latest ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-64 bg-white/5 animate-pulse rounded-2xl border border-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {latestProducts?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* ── Partner Labs ── */}
        {/* <section
          aria-label="Trusted Partners"
          className="relative rounded-3xl border border-white/10 p-8 md:p-12 overflow-hidden"
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
                <div key={i} className="h-32 bg-white/5 animate-pulse rounded-2xl border border-white/5" />
              ))}
            </div>
          ) : error.shops ? (
            <div className="flex flex-col items-center gap-3 py-8 text-zinc-500">
              <p>{error.shops}</p>
              <button
                onClick={retryShops}
                className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {shops?.map((shop: any) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
        </section>
 */}
        {/* ── Offers ── */}
        {/* <section aria-label="Limited Time Offers">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-white/5 animate-pulse rounded-2xl border border-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {offers?.map((product: any) => (
                <ProductCard key={product.id} product={product} isEvent={true} />
              ))}
            </div>
          )}
        </section> */}

      </div>

      <div className="pb-20" />
    </main>
  );
}

export default page;