"use client";
import { useMemo } from "react";
import Link from "next/link";
import ProductCard from "@/components/cards/product-card";
import SectionTitle from "@/components/section/section-title";

const MadeInUSABadge = () => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-gray-300 select-none">
    🇺🇸 <span>Made in USA</span>
  </span>
);

export default function ProductsSection({ products, latestProducts }: { 
  products: any[], 
  latestProducts: any[] 
}) {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 space-y-24">
      
      <section aria-label="Suggested Products" id="suggested-products">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <SectionTitle title="Suggested for Your Research" />
            <MadeInUSABadge />
          </div>
          <Link
            href="/products"
            className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <section aria-label="Latest Arrivals">
        <div className="mb-8">
          <SectionTitle title="Latest Arrivals" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {latestProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <div className="pb-20" />
    </div>
  );
}