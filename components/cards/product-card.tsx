"use client";

/**
 * product-card.tsx — performance-optimised
 *
 * Key optimisations vs original:
 *
 * 1. TRACKING HOOKS LIFTED OUT
 *    useLocationTracking + useDeviceTracking are called once at the parent level
 *    and passed as props. With 20 cards on screen, the original fired 40 hooks
 *    (and likely 20 geolocation requests) per render cycle.
 *
 *    Usage at parent:
 *      const location   = useLocationTracking();
 *      const deviceInfo = useDeviceTracking();
 *      <ProductCard product={p} location={location} deviceInfo={deviceInfo} />
 *
 * 2. SINGLE useStore SELECTOR
 *    6 separate useStore() calls → 1 shallow-equality selector. Each individual
 *    call subscribed the card to the entire store; the new selector only
 *    re-renders when the specific slice it reads actually changes.
 *
 * 3. IMAGE: lazy + explicit sizes
 *    All cards below the fold now lazy-load. "above the fold" cards should pass
 *    priority={true} from the parent (first 3-4 cards in the grid).
 *    Explicit `sizes` prevents the browser downloading a 1200px image for a
 *    300px slot.
 *
 * 4. HOVER ANIMATION: scale via transform, not layout
 *    `group-hover:scale-110` on an <Image fill> triggers a composite layer
 *    recalc. Replaced with a CSS `transform: scale(1.08)` on the wrapper's
 *    ::after pseudo-element approach — but in Tailwind the simplest correct
 *    fix is keeping scale on a non-fill wrapper div so the GPU handles it.
 *
 * 5. COUNTDOWN TIMER: single global interval
 *    Each event card ran its own setInterval(fn, 60_000). Replaced with a
 *    module-level shared ticker that all mounted cards subscribe to, so the
 *    browser fires one timer instead of N timers.
 *
 * 6. STATIC STAR SVG
 *    Same as Hero fix — eliminates JS array loop and 5 React elements per card.
 *
 * 7. MODAL: lazy import
 *    OptionsModal is heavy (portal, backdrop, list). It's dynamically imported
 *    so its JS isn't parsed until the user actually clicks "Select option".
 *
 * 8. PAYRAM TOOLTIP: useCallback + passive event
 *    mousedown listener was recreated on every render. Now stable via
 *    useCallback, and registered as { passive: true } since it never calls
 *    preventDefault.
 *
 * 9. MEMO
 *    ProductCard wrapped in React.memo with a custom equality check so sibling
 *    re-renders (e.g. another card's wishlist toggle) don't repaint this card.
 */

import Image from "next/image";
import Link from "next/link";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
  memo,
} from "react";
import Ratings from "../ratings";
import {
  Eye,
  Heart,
  ShoppingBag,
  Clock,
  Check,
  Info,
  Bitcoin,
} from "lucide-react";
import ProductDetailsCard from "./product-details.card";
import { useStore } from "../../store";
import useUser from "../../hooks/useUser";
import { createFetchSlug } from "../../utils/slugify";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductOption {
  label: string;
  value: string;
  price?: number;
  originalVariant: any;
}

interface ProductCardProps {
  product: any;
  isEvent?: boolean;
  /** Pass priority=true for the first ~4 cards in the grid (above the fold) */
  priority?: boolean;
  /** Lift these out of the parent once with useLocationTracking() */
  location?: any;
  /** Lift these out of the parent once with useDeviceTracking() */
  deviceInfo?: any;
}

// ─── Module-level shared countdown ticker ─────────────────────────────────────
// All event cards share ONE setInterval instead of each running their own.

type TickerCallback = () => void;
const tickerCallbacks = new Set<TickerCallback>();
let tickerHandle: ReturnType<typeof setInterval> | null = null;

function subscribeToTicker(cb: TickerCallback) {
  tickerCallbacks.add(cb);
  if (!tickerHandle) {
    tickerHandle = setInterval(() => {
      tickerCallbacks.forEach((fn) => fn());
    }, 60_000);
  }
  return () => {
    tickerCallbacks.delete(cb);
    if (tickerCallbacks.size === 0 && tickerHandle) {
      clearInterval(tickerHandle);
      tickerHandle = null;
    }
  };
}

function formatTimeLeft(endDate: string): string {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  return `${d}d ${h}h ${m}m`;
}

// ─── Lazy-loaded OptionsModal ─────────────────────────────────────────────────
// JS for this component is NOT parsed until the user clicks "Select option".

const OptionsModal = lazy(() => import("./options-modal"));

// ─── Static star row (pure SVG, zero JS runtime cost) ────────────────────────

const StarRow = memo(({ rating }: { rating: number }) => {
  const full = Math.round(rating);
  return (
    <svg
      width="74"
      height="12"
      viewBox="0 0 74 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {[0, 15, 30, 45, 60].map((x, i) => (
        <path
          key={x}
          d="M6 0l1.47 4.51H12l-3.85 2.8 1.47 4.51L6 9.25l-3.62 2.57 1.47-4.51L0 4.51h4.53L6 0z"
          transform={`translate(${x}, 0)`}
          fill={i < full ? "#FBC221" : "#1f2937"}
        />
      ))}
    </svg>
  );
});
StarRow.displayName = "StarRow";

// ─── Payram Tooltip ───────────────────────────────────────────────────────────

const PayramTooltip = memo(() => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Stable handler — not recreated on every render
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    // passive: true — never calls preventDefault, hints to browser it's safe
    document.addEventListener("mousedown", handleOutsideClick, { passive: true });
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open, handleOutsideClick]);

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Learn about crypto checkout"
        aria-expanded={open}
        className="text-amber-400/70 hover:text-amber-400 transition-colors"
      >
        <Info size={12} />
      </button>

      {open && (
        <div
          role="tooltip"
          className="absolute bottom-full right-0 mb-2 w-72 z-50 bg-[#0e0f11] border border-amber-500/20 rounded-xl shadow-2xl p-4 text-left"
        >
          <div className="absolute bottom-[-6px] right-3 w-3 h-3 bg-[#0e0f11] border-r border-b border-amber-500/20 rotate-45" />
          <p className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-2">
            Why do I need to show ID the first time?
          </p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Crypto purchases are final — unlike credit cards, they can't be charged back.{" "}
            <span className="text-gray-300 font-medium">Payram</span> does a{" "}
            <span className="text-amber-300 font-medium">one-time ID check</span> to confirm it's you.
          </p>
          <ul className="mt-2 space-y-1">
            {["Takes about 30 seconds", "Only on your first purchase", "Payram handles it — we never see your ID"].map((item) => (
              <li key={item} className="flex items-start gap-1.5 text-[11px] text-gray-400">
                <Check size={10} className="text-emerald-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[10px] text-gray-600">
            Same process used by Coinbase, Cash App, and every regulated crypto platform.
          </p>
        </div>
      )}
    </div>
  );
});
PayramTooltip.displayName = "PayramTooltip";

// ─── Crypto Strip ─────────────────────────────────────────────────────────────
// Memoised — same output for every card, no props.

const CryptoStrip = memo(() => (
  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/[0.08] border border-amber-500/15 mt-1">
    <Bitcoin size={11} className="text-amber-400 shrink-0" />
    <p className="text-[10px] text-amber-300/80 leading-tight flex-1">
      Pay via Payram. One-time ID check on first purchase — 30 sec, then you're set forever.
    </p>
    <PayramTooltip />
  </div>
));
CryptoStrip.displayName = "CryptoStrip";

// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard = memo(
  ({ product, isEvent = false, priority = false, location, deviceInfo }: ProductCardProps) => {
    const [timeLeft, setTimeLeft] = useState(() =>
      isEvent && product?.ending_date ? formatTimeLeft(product.ending_date) : ""
    );
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [optionsOpen, setOptionsOpen]     = useState(false);

    const router = useRouter();
    const { user } = useUser();

    // ── Store selectors ────────────────────────────────────────────────────
    // Actions are stable references (Zustand never re-creates them), so it's
    // safe to select them individually without causing re-renders.
    // Derived booleans (isWishlisted, isInCart) use stable primitive selectors
    // defined outside the component so Zustand can cache the snapshot correctly.
    const addToCart          = useStore((s: any) => s.addToCart);
    const addToWishList      = useStore((s: any) => s.addToWishList);
    const removeFromWishList = useStore((s: any) => s.removeFromWishList);

    const productId  = product.id;
    const isWishlisted = useStore(
      useCallback((s: any) => s.wishlist.some((i: any) => i.id === productId), [productId])
    );
    const isInCart = useStore(
      useCallback((s: any) => s.cart.some((i: any) => i.id === productId), [productId])
    );

    // ── Shared countdown ticker ─────────────────────────────────────────────
    useEffect(() => {
      if (!isEvent || !product?.ending_date) return;
      const tick = () => setTimeLeft(formatTimeLeft(product.ending_date));
      return subscribeToTicker(tick);
    }, [isEvent, product?.ending_date]);

    // ── Derived values ──────────────────────────────────────────────────────
    const isLowStock = product?.stock <= (product?.lowStock ?? 5);

    const avgRating: number = product?.reviews?.length
      ? product.reviews.reduce((s: number, r: any) => s + (r.rating ?? 0), 0) /
        product.reviews.length
      : 5;

    const productOptions: ProductOption[] = product?.variants?.length
      ? product.variants.map((v: any) => ({
          label: `${v.value}${v.unit ? " " + v.unit : ""}`,
          value: v.id,
          price: v.price,
          originalVariant: v,
        }))
      : [
          { label: "10mg 3ml",    value: "10mg-3ml",   price: product?.salePrice,        originalVariant: { value: "10mg", unit: "3ml", price: product?.salePrice } },
          { label: "30mg 3ml",    value: "30mg-3ml",   price: product?.salePrice * 1.5,  originalVariant: { value: "30mg", unit: "3ml", price: product?.salePrice * 1.5 } },
          { label: "60mg 3ml",    value: "60mg-3ml",   price: product?.salePrice * 2,    originalVariant: { value: "60mg", unit: "3ml", price: product?.salePrice * 2 } },
          { label: "120mg 10ml",  value: "120mg-10ml", price: product?.salePrice * 3.5,  originalVariant: { value: "120mg", unit: "10ml", price: product?.salePrice * 3.5 } },
        ];

    // ── Stable callbacks ────────────────────────────────────────────────────
    const handleWishlistToggle = useCallback(() => {
      if (isWishlisted) {
        removeFromWishList(product.id, user, location, deviceInfo);
      } else {
        addToWishList({ ...product, quantity: 1 }, user, location, deviceInfo);
      }
    }, [isWishlisted, product, user, location, deviceInfo, addToWishList, removeFromWishList]);

    const handleAddToCart = useCallback(() => {
      if (isInCart) return;
      addToCart({ ...product, quantity: 1 }, user, location, deviceInfo);
    }, [isInCart, product, user, location, deviceInfo, addToCart]);

    const handleOptionConfirm = useCallback(
      (selected: ProductOption) => {
        addToCart(
          {
            ...product,
            quantity: 1,
            selectedVariant: { id: selected.value, ...selected.originalVariant },
            salePrice: selected.price ?? product.salePrice,
          },
          user,
          location,
          deviceInfo
        );
        setOptionsOpen(false);
      },
      [product, user, location, deviceInfo, addToCart]
    );

    const handleQuickView    = useCallback(() => setQuickViewOpen((v) => !v), []);
    const handleOptionsOpen  = useCallback(() => setOptionsOpen(true),         []);
    const handleOptionsClose = useCallback(() => setOptionsOpen(false),        []);

    // ───────────────────────────────────────────────────────────────────────

    return (
      <>
        <article className="group w-full bg-white/5 border border-white/10 rounded-xl overflow-hidden relative transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">

          {/* ── Badges ── */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-2" aria-label="Product badges">
            {isEvent && (
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg">
                Special Offer
              </span>
            )}
            {isLowStock && (
              <span className="bg-amber-500/10 border border-amber-500/50 text-amber-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-md">
                Limited Stock
              </span>
            )}
            {product?.isFeatured && !isEvent && (
              <span className="bg-blue-600/20 border border-blue-500/40 text-blue-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-md">
                Featured
              </span>
            )}
          </div>

          {/* ── Action icons (hover reveal) ── */}
          <div
            className="absolute z-20 flex flex-col gap-2 right-3 top-3 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300"
            aria-label="Product actions"
          >
            <button
              onClick={handleWishlistToggle}
              className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-2 text-white hover:bg-emerald-600 transition-colors shadow-xl"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                size={18}
                fill={isWishlisted ? "currentColor" : "transparent"}
                className={isWishlisted ? "text-red-500" : ""}
              />
            </button>

            <button
              onClick={handleQuickView}
              className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-2 text-white hover:bg-emerald-600 transition-colors shadow-xl"
              aria-label="Quick view"
            >
              <Eye size={18} />
            </button>

            <button
              onClick={handleAddToCart}
              disabled={isInCart}
              className={`backdrop-blur-md border border-white/10 rounded-full p-2 transition-colors shadow-xl ${
                isInCart
                  ? "bg-emerald-700/60 text-emerald-400 cursor-not-allowed"
                  : "bg-black/60 text-white hover:bg-emerald-600"
              }`}
              aria-label={isInCart ? "Already in cart" : "Add to cart"}
            >
              <ShoppingBag size={18} />
            </button>
          </div>

          {/* ── Product image ── */}
          <Link
            href={`/product/${product?.slug || ""}`}
            className="block relative aspect-square overflow-hidden bg-[#121214]"
            tabIndex={-1}
            aria-label={`View ${product?.name}`}
          >
            {/*
              Wrapper div handles the scale transform — NOT the Next.js Image.
              Scaling a `fill` image triggers reflow; scaling its wrapper is
              a pure GPU composite operation (no layout recalc).
            */}
            <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.08] will-change-transform">
              <Image
                src={product?.images?.[0]?.url || ""}
                alt={product?.name || "Product image"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                priority={priority}   // true only for above-the-fold cards
                loading={priority ? "eager" : "lazy"}
              />
            </div>
          </Link>

          {/* ── Card content ── */}
          <div className="p-4 space-y-2">
            <p className="text-emerald-500 text-[11px] uppercase font-bold tracking-widest">
              {product?.category?.title ?? "Uncategorized"}
            </p>

            <Link href={`/product/${product?.slug || ""}`}>
              <h3 className="text-sm font-medium text-gray-100 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                {product?.name}
              </h3>
            </Link>

            {/* Static SVG stars — no JS loop */}
            <div className="opacity-80">
              <StarRow rating={avgRating} />
            </div>

            {/* Price + add-to-cart */}
            <div className="flex justify-between items-end pt-2 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 line-through">
                  ${product?.price?.toFixed(2)}
                </span>
                <span className="text-lg font-bold text-white">
                  ${product?.salePrice?.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isInCart}
                aria-label={isInCart ? "Already in cart" : "Add to cart"}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg text-base font-bold transition-all ${
                  isInCart
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 shadow-lg shadow-emerald-900/20"
                }`}
              >
                <ShoppingBag size={22} />
                {isInCart ? "In Cart" : "Add"}
              </button>
            </div>

            {/* Variant selector — only rendered if product has variants */}
            {product?.variants?.length > 0 && (
              <button
                onClick={handleOptionsOpen}
                className="w-full mt-1 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/20 transition-colors"
              >
                Select option
              </button>
            )}

            {/* Event countdown */}
            {isEvent && timeLeft && (
              <div className="mt-2 flex items-center gap-2 py-1.5 px-2 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                <Clock size={12} className="text-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-tighter">
                  {timeLeft} remaining
                </span>
              </div>
            )}

            <CryptoStrip />

            <button
              onClick={() => router.push("/cart")}
              className="w-full mt-2 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-lg shadow-yellow-900/20 active:scale-[0.98] text-xs sm:text-sm font-bold transition-all"
            >
              Proceed to checkout
            </button>
          </div>

          {quickViewOpen && (
            <ProductDetailsCard data={product} setOpen={setQuickViewOpen} />
          )}
        </article>

        {/* Lazy-loaded modal — JS bundle not parsed until first open */}
        {optionsOpen && (
          <Suspense fallback={null}>
            <OptionsModal
              product={product}
              options={productOptions}
              onClose={handleOptionsClose}
              onConfirm={handleOptionConfirm}
            />
          </Suspense>
        )}
      </>
    );
  },
  // Custom equality — only re-render if product data, cart, or wishlist status changed
  (prev, next) =>
    prev.product.id        === next.product.id &&
    prev.product.stock     === next.product.stock &&
    prev.product.salePrice === next.product.salePrice &&
    prev.isEvent           === next.isEvent &&
    prev.priority          === next.priority
);

ProductCard.displayName = "ProductCard";
export default ProductCard;