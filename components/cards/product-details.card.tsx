"use client";

/**
 * product-details-card.tsx — performance-optimised
 *
 * Key optimisations vs original:
 *
 * 1. LOCATION & DEVICE TRACKING LIFTED OUT
 *    useLocationTracking + useDeviceTracking are called once at the parent level
 *    (ProductCard) and passed as props. The modal no longer fires its own hooks.
 *    Parent usage:
 *      const location   = useLocationTracking();
 *      const deviceInfo = useDeviceTracking();
 *      <ProductDetailsCard data={product} setOpen={...} location={location} deviceInfo={deviceInfo} />
 *
 * 2. STORE SELECTORS OPTIMISED
 *    Boolean selectors (isWishlisted, isInCart) use stable useCallback selectors,
 *    avoiding re-renders when array contents change but the condition stays the same.
 *    Action selectors are stable references; no unnecessary subscriptions.
 *
 * 3. STATIC STAR SVG
 *    Replaces the generic <Ratings /> component with a pure SVG that avoids
 *    React element overhead and JS loops for every star.
 *
 * 4. COMPUTED VALUES MEMOISED
 *    avgRating, latestBatch, effectivePrice, effectiveStock, savings – all
 *    wrapped in useMemo. estimatedDelivery is lazily initialised once.
 *
 * 5. ALL HANDLERS ARE STABLE
 *    onClick, onChange, and navigation callbacks are wrapped in useCallback,
 *    preventing child re-renders (e.g. the image carousel buttons).
 *
 * 6. REACT.MEMO WITH CUSTOM COMPARATOR
 *    The entire modal is wrapped in React.memo; it only re-renders when props
 *    (data.id, setOpen, location, deviceInfo) actually change.
 *
 * 7. MODAL CLOSE PROPAGATION FIX
 *    The outer backdrop's onClick and the inner stopPropagation handler are
 *    stable references, preventing unnecessary function creation on every render.
 */

import Image from "next/image";
import Link from "next/link";
import React, {
  useState,
  useCallback,
  useMemo,
  memo,
} from "react";
import {
  Heart,
  X,
  Minus,
  Plus,
  Shield,
  Truck,
  RotateCcw,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Tag,
  Package,
  MessageCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import CartIcon from "../../app/assets/svgs/cart-icon";
import { useStore } from "../../store";
import useUser from "../../hooks/useUser";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductDetailsCardProps {
  data: any;
  setOpen: (open: boolean) => void;
  /** lifted from parent via useLocationTracking */
  location?: any;
  /** lifted from parent via useDeviceTracking */
  deviceInfo?: any;
}

// ─── Static star row ──────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatPrice = (price: number) =>
  price?.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// ─── ProductDetailsCard ─────────────────────────────────────────────────────

const ProductDetailsCard = memo(
  ({ data, setOpen, location, deviceInfo }: ProductDetailsCardProps) => {
    const [activeImage, setActiveImage] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState<any>(
      data?.variants?.[0] ?? null
    );
    const [quantity, setQuantity] = useState(1);

    const router = useRouter();
    const { user } = useUser();

    // ── Store selectors ───────────────────────────────────────────────────
    // Actions are stable references; no need to memoize selectors.
    const addToCart = useStore((s: any) => s.addToCart);
    const addToWishList = useStore((s: any) => s.addToWishList);
    const removeFromWishList = useStore((s: any) => s.removeFromWishList);

    const productId = data.id;
    const isWishlisted = useStore(
      useCallback(
        (s: any) => s.wishlist.some((item: any) => item.id === productId),
        [productId]
      )
    );
    const isInCart = useStore(
      useCallback(
        (s: any) => s.cart.some((item: any) => item.id === productId),
        [productId]
      )
    );

    // ── Derived values (memoised) ────────────────────────────────────────

    const effectivePrice = useMemo(
      () => selectedVariant?.price ?? data?.salePrice,
      [selectedVariant, data?.salePrice]
    );

    const regularPrice = data?.price;
    const savings = useMemo(
      () =>
        regularPrice && regularPrice > effectivePrice
          ? regularPrice - effectivePrice
          : null,
      [regularPrice, effectivePrice]
    );

    const effectiveStock = useMemo(
      () => selectedVariant?.stock ?? data?.stock ?? 0,
      [selectedVariant, data?.stock]
    );

    const avgRating: number | null = useMemo(() => {
      if (!data?.reviews?.length) return null;
      const sum = data.reviews.reduce(
        (s: number, r: any) => s + (r.rating ?? 0),
        0
      );
      return sum / data.reviews.length;
    }, [data?.reviews]);

    const latestBatch = useMemo(() => {
      if (!data?.batches?.length) return null;
      return [...data.batches].sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
    }, [data?.batches]);

    const [estimatedDelivery] = useState(() => {
      const d = new Date();
      d.setDate(d.getDate() + 5);
      return d;
    });

    const productName = data?.name ?? "";

    // ── Stable callbacks ─────────────────────────────────────────────────

    const nextImage = useCallback(
      () =>
        setActiveImage((prev) => (prev + 1) % (data?.images?.length || 1)),
      [data?.images?.length]
    );
    const prevImage = useCallback(
      () =>
        setActiveImage(
          (prev) =>
            (prev - 1 + (data?.images?.length || 1)) %
            (data?.images?.length || 1)
        ),
      [data?.images?.length]
    );

    const handleAddToCart = useCallback(() => {
      addToCart(
        {
          ...data,
          quantity,
          selectedVariant,
          salePrice: effectivePrice,
        },
        user,
        location,
        deviceInfo
      );
    }, [data, quantity, selectedVariant, effectivePrice, user, location, deviceInfo, addToCart]);

    const handleWishlistToggle = useCallback(() => {
      if (isWishlisted) {
        removeFromWishList(data.id, user, location, deviceInfo);
      } else {
        addToWishList({ ...data, quantity }, user, location, deviceInfo);
      }
    }, [isWishlisted, data, quantity, user, location, deviceInfo, addToWishList, removeFromWishList]);

    const handleCheckout = useCallback(() => {
      handleAddToCart();
      setOpen(false);
      router.push("/cart");
    }, [handleAddToCart, setOpen, router]);

    // Stable backdrop click & stop propagation
    const closeModal = useCallback(() => setOpen(false), [setOpen]);
    const stopPropagation = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

    const handleSupportClick = useCallback(
      () =>
        router.push(
          `/support?productId=${data?.id}&productName=${encodeURIComponent(
            productName
          )}&price=${data?.salePrice ?? ""}`
        ),
      [router, data?.id, productName, data?.salePrice]
    );

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto"
        onClick={closeModal}
      >
        <div
          className="w-[95%] md:w-[85%] lg:w-[80%] xl:w-[70%] my-8 h-auto max-h-[90vh] overflow-y-auto bg-[#121214] border border-white/10 rounded-2xl shadow-2xl"
          onClick={stopPropagation}
        >
          {/* Sticky Header */}
          <div className="sticky top-0 bg-[#121214] border-b border-white/10 px-6 py-4 rounded-t-2xl z-10">
            <button
              className="absolute right-4 top-4 p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
              onClick={closeModal}
            >
              <X size={24} className="text-gray-400 hover:text-white" />
            </button>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* ── Left Column: Images ── */}
              <div className="lg:w-1/2">
                <div className="relative bg-black/30 rounded-xl overflow-hidden border border-white/10 group">
                  <Image
                    src={
                      data?.images?.[activeImage]?.url ||
                      "/placeholder-product.jpg"
                    }
                    alt={
                      data?.images?.[activeImage]?.alt || productName || "Product image"
                    }
                    width={600}
                    height={600}
                    className="w-full h-auto object-contain p-4 transition-transform duration-300"
                    priority
                  />

                  {data?.images?.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-2 text-white hover:bg-emerald-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-2 text-white hover:bg-emerald-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        aria-label="Next image"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-300">
                        {activeImage + 1} / {data?.images?.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {data?.images?.length > 1 && (
                  <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                    {data.images.map((image: any, index: number) => (
                      <div
                        key={index}
                        onClick={() => setActiveImage(index)}
                        className={`cursor-pointer border-2 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${
                          activeImage === index
                            ? "border-emerald-500 shadow-md"
                            : "border-transparent hover:border-white/20"
                        }`}
                      >
                        <Image
                          src={image?.url}
                          alt={image?.alt || `Image ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Batch / Lab Info ── */}
                {latestBatch && (
                  <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                    <p className="text-xs uppercase tracking-widest text-emerald-500 font-bold mb-3 flex items-center gap-2">
                      <FlaskConical size={12} /> Lab Batch Info
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Batch No.</p>
                        <p className="text-gray-200 font-medium">
                          {latestBatch.batchNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Purity</p>
                        <p className="text-emerald-400 font-bold">
                          {latestBatch.purity}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Manufactured</p>
                        <p className="text-gray-200">
                          {new Date(latestBatch.manufacturedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expiry</p>
                        <p className="text-gray-200">
                          {new Date(latestBatch.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {latestBatch.coaUrl && (
                      <a
                        href={latestBatch.coaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
                      >
                        View Certificate of Analysis →
                      </a>
                    )}
                  </div>
                )}

                {/* Certificates */}
                {data?.certificates?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.certificates.map((cert: any, i: number) => (
                      <a
                        key={cert.id}
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                      >
                        <Shield size={12} /> Certificate {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Right Column: Product Details ── */}
              <div className="lg:w-1/2">
                {/* Support Header */}
                <div className="border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full w-12 h-12 flex items-center justify-center shadow-md">
                        <MessageCircle size={24} fill="white" color="white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-100">
                          Customer Support
                        </h4>
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle size={14} className="text-emerald-500" />
                          <span className="text-xs text-gray-400">
                            Online 24/7
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md"
                      onClick={handleSupportClick}
                    >
                      <MessageCircle size={18} />
                      Chat with Support
                    </button>
                  </div>
                </div>

                {/* Category pill */}
                {data?.category?.title && (
                  <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest font-bold text-emerald-500 mb-2">
                    <Tag size={11} /> {data.category.title}
                  </span>
                )}

                <h2 className="text-2xl md:text-3xl font-bold text-gray-100 mb-3 leading-tight">
                  {productName}
                </h2>

                <p className="text-gray-400 leading-relaxed mb-4">
                  {data?.description}
                </p>

                {/* Chemical/scientific metadata */}
                {(data?.sku || data?.molarMass || data?.casNumber || data?.formula) && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {data.sku && (
                      <span className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-gray-400">
                        <span className="text-gray-500">SKU:</span> {data.sku}
                      </span>
                    )}
                    {data.molarMass && (
                      <span className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-gray-400">
                        <span className="text-gray-500">Molar Mass:</span>{" "}
                        {data.molarMass}
                      </span>
                    )}
                    {data.casNumber && (
                      <span className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-gray-400">
                        <span className="text-gray-500">CAS:</span>{" "}
                        {data.casNumber}
                      </span>
                    )}
                    {data.formula && (
                      <span className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-gray-400">
                        <span className="text-gray-500">Formula:</span>{" "}
                        {data.formula}
                      </span>
                    )}
                  </div>
                )}

                {/* Ratings — static SVG stars */}
                {avgRating != null && (
                  <div className="mb-4">
                    <StarRow rating={avgRating} />
                    <p className="text-xs text-gray-500 mt-1">
                      {data.reviews.length} review
                      {data.reviews.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}

                {/* ── Variants ── */}
                {data?.variants?.length > 0 && (
                  <div className="mb-5">
                    <p className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <Package size={14} className="text-emerald-500" /> Choose Quantity
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.variants.map((variant: any) => {
                        const isSelected = selectedVariant?.id === variant.id;
                        return (
                          <button
                            key={variant.id}
                            onClick={() => setSelectedVariant(variant)}
                            className={`flex flex-col items-start px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                                : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10"
                            }`}
                          >
                            <span className="font-bold">
                              {variant.value}
                              {variant.unit ? ` ${variant.unit}` : ""}
                            </span>
                            <span
                              className={`text-xs mt-0.5 ${
                                isSelected ? "text-emerald-500" : "text-gray-500"
                              }`}
                            >
                              ${formatPrice(variant.price)}
                            </span>
                            {variant.stock <= 5 && (
                              <span className="text-[10px] text-amber-500 mt-0.5">
                                {variant.stock} left
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Price ── */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl font-bold text-white">
                      ${formatPrice(effectivePrice)}
                    </span>
                    {savings && (
                      <>
                        <span className="text-lg text-gray-500 line-through">
                          ${formatPrice(regularPrice)}
                        </span>
                        <span className="bg-emerald-500/20 text-emerald-400 text-sm font-semibold px-2 py-1 rounded-lg border border-emerald-500/30">
                          Save ${formatPrice(savings)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* ── Stock Status ── */}
                <div className="mb-5">
                  {effectiveStock > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-emerald-400 font-semibold">In Stock</span>
                      <span className="text-sm text-gray-500">
                        ({effectiveStock} available)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-red-400 font-semibold">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* ── Quantity + Actions ── */}
                <div className="space-y-3 mb-6">
                  {/* Quantity picker */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-xl border border-white/10 overflow-hidden">
                      <button
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
                        onClick={() =>
                          setQuantity((prev) => Math.max(1, prev - 1))
                        }
                        disabled={quantity <= 1}
                      >
                        <Minus size={16} className="text-gray-400" />
                      </button>
                      <span className="w-12 text-center font-medium text-gray-200">
                        {quantity}
                      </span>
                      <button
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 transition-colors"
                        onClick={() => setQuantity((prev) => prev + 1)}
                      >
                        <Plus size={16} className="text-gray-400" />
                      </button>
                    </div>

                    {/* Wishlist */}
                    <button
                      className="p-3 rounded-xl border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-200 group"
                      onClick={handleWishlistToggle}
                    >
                      <Heart
                        size={22}
                        className={`transition-colors duration-200 ${
                          isWishlisted
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400 group-hover:text-red-500"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Add to Cart — yellow */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isInCart || effectiveStock === 0}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      isInCart || effectiveStock === 0
                        ? "bg-gray-800 cursor-not-allowed text-gray-500"
                        : "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-lg shadow-yellow-900/20 active:scale-[0.98]"
                    }`}
                  >
                    <CartIcon />
                    {isInCart ? "Added to Cart" : "Add to Cart"}
                  </button>

                  {/* Proceed to Checkout */}
                  <button
                    onClick={handleCheckout}
                    disabled={effectiveStock === 0}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      effectiveStock === 0
                        ? "bg-gray-800 cursor-not-allowed text-gray-500"
                        : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                    }`}
                  >
                    Proceed to Checkout →
                  </button>
                </div>

                {/* ── Delivery & Policies ── */}
                <div className="bg-white/5 rounded-xl p-4 space-y-3 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Truck size={20} className="text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">
                        Estimated Delivery
                      </p>
                      <p className="text-sm text-gray-500">
                        {estimatedDelivery.toDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RotateCcw size={20} className="text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">
                        Easy Returns
                      </p>
                      <p className="text-sm text-gray-500">
                        30-day return policy
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">
                        Secure Checkout
                      </p>
                      <p className="text-sm text-gray-500">
                        100% secure payment
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
  // Custom equality – only re-render if the product ID or critical references change
  (prev, next) =>
    prev.data.id === next.data.id &&
    prev.setOpen === next.setOpen &&
    prev.location === next.location &&
    prev.deviceInfo === next.deviceInfo
);

ProductDetailsCard.displayName = "ProductDetailsCard";
export default ProductDetailsCard;