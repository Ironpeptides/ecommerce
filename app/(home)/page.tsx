"use client";

import React from 'react'
import Hero from '@/components/hero'
import SectionTitle from '@/components/section/section-title'
//import { useQuery } from '@tanstack/react-query'
// import axiosInstance from '../../utils/axiosinstance'
import ProductCard from '../../components/cards/product-card'
import ShopCard from '../../components/cards/shop.card';
import TrustBar from '@/components/frontend/trust-bar';


const staticProducts = [
  {
    id: 1,
    title: "BPC-157 5mg",
    slug: "bpc-157-5mg",
    sale_price: 49.99,
    regular_price: 64.99,
    ratings: 4.8,
    totalSales: 120,
    stock: 50,
    images: [{ url: "/images/5-Amino-1MQ-—-10mg-mockup-300x300.jpg" }],
    shop: { id: "shop-1", name: "PureGrade Peptides" },
    category: "Recovery",
  },
  {
    id: 2,
    title: "Thymosin Beta-4",
    slug: "thymosin-beta-4",
    sale_price: 69.99,
    regular_price: 89.99,
    ratings: 4.7,
    totalSales: 98,
    stock: 30,
    images: [{ url: "/images/Aminotadalafil-01-mockup-300x300.webp" }],
    shop: { id: "shop-1", name: "PureGrade Peptides" },
    category: "Recovery",
  },
  {
    id: 3,
    title: "Ipamorelin 2mg",
    slug: "ipamorelin-2mg",
    sale_price: 39.99,
    regular_price: 54.99,
    ratings: 4.6,
    totalSales: 75,
    stock: 4, // triggers "Limited Stock" badge
    images: [{ url: "/images/Acetic-Water-01-mockup-300x300.webp" }],
    shop: { id: "shop-2", name: "BioSynth Labs" },
    category: "Growth",
  },
  {
    id: 4,
    title: "CJC-1295 2mg",
    slug: "cjc-1295-2mg",
    sale_price: 44.99,
    regular_price: 59.99,
    ratings: 4.5,
    totalSales: 60,
    stock: 20,
    images: [{ url: "/images/ACP-105-—-10mg-mockup-300x300.jpg" }],
    shop: { id: "shop-2", name: "BioSynth Labs" },
    category: "Growth",
  },
  {
    id: 5,
    title: "Semax 30mg",
    slug: "semax-30mg",
    sale_price: 54.99,
    regular_price: 69.99,
    ratings: 4.9,
    totalSales: 200,
    stock: 15,
    images: [{ url: "/images/Aminotadalafil-01-mockup-300x300.webp" }],
    shop: { id: "shop-3", name: "AlphaPeptide Co." },
    category: "Cognitive",
  },
  {
    id: 6,
    title: "Selank 5mg",
    slug: "selank-5mg",
    sale_price: 34.99,
    regular_price: 44.99,
    ratings: 4.4,
    totalSales: 45,
    stock: 25,
    images: [{ url: "/images/Bacteriostatic-water-mockup-300x300.webp" }],
    shop: { id: "shop-3", name: "AlphaPeptide Co." },
    category: "Cognitive",
  },
  {
    id: 7,
    title: "PT-141 10mg",
    slug: "pt-141-10mg",
    sale_price: 59.99,
    regular_price: 74.99,
    ratings: 4.6,
    totalSales: 88,
    stock: 10,
    images: [{ url: "/images/bpc-157-Mockup-300x300.webp" }],
    shop: { id: "shop-4", name: "NovaPeptide Store" },
    category: "Wellness",
  },
  {
    id: 8,
    title: "Epithalon 10mg",
    slug: "epithalon-10mg",
    sale_price: 64.99,
    regular_price: 79.99,
    ratings: 4.7,
    totalSales: 110,
    stock: 3, // triggers "Limited Stock" badge
    images: [{ url: "/images/GLOW-01-MOCKUP-1024x1024.jpg" }],
    shop: { id: "shop-4", name: "NovaPeptide Store" },
    category: "Longevity",
  },
];

const staticLatestProducts = [
  {
    id: 9,
    title: "GHK-Cu 50mg",
    slug: "ghk-cu-50mg",
    sale_price: 74.99,
    regular_price: 94.99,
    ratings: 4.8,
    totalSales: 55,
    stock: 18,
    images: [{ url: "/images/GLP-1SG-—-3mg-01-mockup-1024x1024.png" }],
    shop: { id: "shop-1", name: "PureGrade Peptides" },
    category: "Anti-Aging",
  },
  {
    id: 10,
    title: "Hexarelin 2mg",
    slug: "hexarelin-2mg",
    sale_price: 42.99,
    regular_price: 57.99,
    ratings: 4.5,
    totalSales: 33,
    stock: 22,
    images: [{ url: "/images/GLP-2TZ-—-10mg-01-mockup-300x300.jpg" }],
    shop: { id: "shop-2", name: "BioSynth Labs" },
    category: "Growth",
  },
  {
    id: 11,
    title: "DSIP 2mg",
    slug: "dsip-2mg",
    sale_price: 38.99,
    regular_price: 49.99,
    ratings: 4.3,
    totalSales: 28,
    stock: 40,
    images: [{ url: "/images/GLP-3RT-01-mockup-300x300.webp" }],
    shop: { id: "shop-3", name: "AlphaPeptide Co." },
    category: "Sleep",
  },
  {
    id: 12,
    title: "Kisspeptin-10",
    slug: "kisspeptin-10",
    sale_price: 55.99,
    regular_price: 70.99,
    ratings: 4.6,
    totalSales: 41,
    stock: 12,
    images: [{ url: "/images/Acetic-Water-01-mockup-300x300.webp" }],
    shop: { id: "shop-4", name: "NovaPeptide Store" },
    category: "Hormonal",
  },
];


const staticOffers = [
  {
    id: 13,
    title: "BPC-157 + TB-4 Stack",
    slug: "bpc-157-tb-4-stack",
    sale_price: 99.99,
    regular_price: 129.99,
    ratings: 4.9,
    totalSales: 75,
    stock: 8,
    images: [{ url: "/images/Acetic-Water-01-mockup-300x300.webp" }],
    shop: { id: "shop-1", name: "PureGrade Peptides" },
    category: "Bundle",
    ending_date: "2026-05-01T00:00:00.000Z",
  },
  {
    id: 14,
    title: "Cognitive Bundle",
    slug: "cognitive-bundle",
    sale_price: 79.99,
    regular_price: 99.99,
    ratings: 4.7,
    totalSales: 50,
    stock: 5,
    images: [{ url: "/images/ACP-105-—-10mg-mockup-300x300.jpg" }],
    shop: { id: "shop-2", name: "BioSynth Labs" },
    category: "Bundle",
    ending_date: "2026-04-20T00:00:00.000Z",
  },
  {
    id: 15,
    title: "Growth Stack",
    slug: "growth-stack",
    sale_price: 89.99,
    regular_price: 114.99,
    ratings: 4.8,
    totalSales: 63,
    stock: 20,
    images: [{ url: "/images/Aminotadalafil-01-mockup-300x300.webp" }],
    shop: { id: "shop-3", name: "AlphaPeptide Co." },
    category: "Bundle",
    ending_date: "2026-04-30T00:00:00.000Z",
  },
  {
    id: 16,
    title: "Longevity Pack",
    slug: "longevity-pack",
    sale_price: 109.99,
    regular_price: 139.99,
    ratings: 4.9,
    totalSales: 90,
    stock: 3,
    images: [{ url: "/images/Bacteriostatic-water-mockup-300x300.webp" }],
    shop: { id: "shop-4", name: "NovaPeptide Store" },
    category: "Bundle",
    ending_date: "2026-05-15T00:00:00.000Z",
  },
];



const staticShops = [
  { id: 1, name: "PureGrade Peptides",  logo: "/images/onestepwellness.jpg", rating: 4.9, totalProducts: 32 },
  { id: 2, name: "BioSynth Labs",       logo: "/images/wellness2.jpg", rating: 4.8, totalProducts: 24 },
  { id: 3, name: "AlphaPeptide Co.",    logo: "/images/NAD.jpeg", rating: 4.7, totalProducts: 18 },
  { id: 4, name: "NovaPeptide Store",   logo: "/images/GHK.jpeg", rating: 4.6, totalProducts: 15 },
];


// --- End Static Data ---

const page = () => {

  // const {data:products, isLoading,isError} = useQuery({
  //   queryKey: ["products"],
  //   queryFn: async ()=>{
  //     const response = await axiosInstance.get("/product/api/get-all-products?page=1&limit=10")
  //     return response.data.products;
  //   },
  //   staleTime:1000 * 60 * 2,
  // })

  // const {data:latestProducts, isLoading: latestProductsLoading} = useQuery({
  //   queryKey: ["latest-products"],
  //   queryFn: async ()=>{
  //     const response = await axiosInstance.get("/product/api/get-all-products?page=1&limit=10&type=latest")
  //     return response.data.products;
  //   },
  //   staleTime:1000 * 60 * 2,
  // });

  // const {data: shops, isLoading:shopLoading} = useQuery({
  //   queryKey: ["shops"],
  //   queryFn: async()=>{
  //     const res = await axiosInstance.get("/product/api/top-shops");
  //     return res.data.shops;
  //   },
  //   staleTime: 1000 * 60 * 2,
  // })

  // const {data: offers, isLoading: offersLoading} = useQuery({
  //   queryKey: ["offers"],
  //   queryFn: async()=>{
  //     const res = await axiosInstance.get("/product/api/get-all-events?page=1&limit=10");
  //     return res.data.events;
  //   },
  //   staleTime: 1000 * 60 * 2,
  // })

  const products = staticProducts;
  const latestProducts = staticLatestProducts;
  const shops = staticShops;
  const offers = staticOffers;

  const isLoading = false;
  const isError = false;
  const latestProductsLoading = false;
  const shopLoading = false;
  const offersLoading = false;

  return (
    <main className="min-h-screen text-white">
      <Hero />
      <TrustBar />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 space-y-24">

        {/* ── Suggested Products ── */}
        <section aria-label="Suggested Products">
          <div className="flex items-center justify-between mb-8">
            <SectionTitle title="Suggested for Your Research" />
            <button className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors">
              View All →
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-64 bg-white/5 animate-pulse rounded-2xl border border-white/5" />
              ))}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {latestProducts?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ── Partner Labs ── */}
        {/* 
          Key fix: use bg-white/[0.04] with a visible border at white/10
          and a very subtle inner glow so it lifts off the background 
        */}
        <section
          aria-label="Trusted Partners"
          className="relative rounded-3xl border border-white/10 p-8 md:p-12 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {/* subtle corner accent */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/5 blur-[80px]" />

          <div className="mb-10 text-center md:text-left">
            <SectionTitle title="Verified Partner Laboratories" />
            <p className="text-zinc-500 mt-2 text-sm">
              Direct fulfillment from ISO-certified facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {shops?.map((shop: any) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        </section>

        {/* ── Offers ── */}
        <section aria-label="Limited Time Offers">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <div className="flex items-center gap-2">
              {/* live pulse dot */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <SectionTitle title="Current Research Grants & Offers" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {offers?.map((product: any) => (
              <ProductCard key={product.id} product={product} isEvent={true} />
            ))}
          </div>
        </section>

      </div>

      <div className="pb-20" />
    </main>
  );
}

export default page