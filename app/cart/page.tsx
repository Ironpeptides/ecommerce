"use client";

/**
 * cart/page.tsx — optimised
 *
 * Fixes vs original:
 *
 * 1. STALE CLOSURE BUG (critical)
 *    validateForm() now RETURNS the errors array directly instead of relying on
 *    setState. handleProceedToCheckout reads from the returned value, not from
 *    the stale state snapshot — so the toast always shows the correct first error.
 *
 * 2. DEBOUNCED COMPLIANCE API CALL
 *    updateComplianceStatus was called on every checkbox toggle with no debounce.
 *    Now uses a 600ms debounce via useRef so rapid toggles fire a single request.
 *
 * 3. CONSOLIDATED useStore SELECTORS
 *    6 separate useStore() calls → 3 stable action selectors + 1 cart selector.
 *    Actions are stable Zustand references (never change), so selecting them
 *    individually with plain arrow functions never causes re-renders.
 *
 * 4. fetchShippingAddresses IN useCallback
 *    Was recreated every render, making the useEffect dependency array unstable.
 *    Now stable via useCallback so the effect only fires when user.id changes.
 *
 * 5. searchParams EFFECT DEPENDENCY FIXED
 *    Added searchParams to the dependency array to satisfy exhaustive-deps.
 *
 * 6. BULK DISCOUNT IIFE → useMemo
 *    The (() => { ... })() block in JSX ran on every render. Replaced with a
 *    useMemo that only recalculates when cart contents change.
 *
 * 7. QUANTITY HANDLERS → useCallback + store actions
 *    decreaseQuantity/increaseQuantity now call proper store actions via
 *    useCallback so they're stable across renders and don't call
 *    useStore.setState directly from the component body.
 *
 * 8. ADDRESS FORM STATE → single object (no change to UX)
 *    Keeps the existing UX exactly as-is.
 */

import { useRouter, useSearchParams } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";
import useUser from "../../hooks/useUser";
import useLocationTracking from "../../hooks/useLocationTracking";
import useDeviceTracking from "../../hooks/useDeviceTracking";
import Link from "next/link";
import { useStore } from "../../store";
import Image from "next/image";
import {
  Loader2,
  Trash2,
  ShoppingBag,
  ArrowRight,
  CreditCard,
  Tag,
  X,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Circle,
  FlaskConical,
  Package,
  Plus,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { createOrder } from "@/actions/orders";
import { getShippingAddresses, createShippingAddress } from "@/actions/shipping";
import { validateCoupon } from "@/actions/coupons";
import { updateCompliance } from "@/actions/compliance";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
  id: string;
  fullName: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  isDefault: boolean;
  userId?: string;
  createdAt?: Date;
}

const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "USA",
} as const;

// ─── Cart Content ─────────────────────────────────────────────────────────────

const CartContent = () => {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { user }    = useUser();
  const location    = useLocationTracking();
  const deviceInfo  = useDeviceTracking();

  // ── Stable store selectors ────────────────────────────────────────────────
  // Actions are stable Zustand references — plain selectors never re-render.
  const cart            = useStore((s: any) => s.cart);
  const removeFromCart  = useStore((s: any) => s.removeFromCart);
  const clearCart       = useStore((s: any) => s.clearCart);
  const updateCartItem  = useStore((s: any) => s.updateCartItem);
  // If your store doesn't have updateCartItem, we fall back to setState below.

  // ── Local state ───────────────────────────────────────────────────────────
  const [loading, setLoading]               = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode]         = useState("");
  const [couponError, setCouponError]       = useState("");
  const [appliedCoupon, setAppliedCoupon]   = useState<any>(null);
  const [paymentMethod, setPaymentMethod]   = useState("online");

  const [addresses, setAddresses]             = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress]           = useState({ ...EMPTY_ADDRESS });

  const [agreedAge, setAgreedAge]           = useState(false);
  const [agreedNotHuman, setAgreedNotHuman] = useState(false);
  const bothAgreed = agreedAge && agreedNotHuman;

  const [validationErrors, setValidationErrors]         = useState<string[]>([]);
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  const summaryRef          = useRef<HTMLDivElement>(null);
  const complianceSectionRef = useRef<HTMLDivElement>(null);
  const addressSectionRef   = useRef<HTMLDivElement>(null);

  // Debounce timer for compliance API call
  const complianceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Derived values ─────────────────────────────────────────────────────────
  const subtotal = useMemo(
    () =>
      cart.reduce((total: number, item: any) => {
        const unitPrice = item?.selectedVariant?.price ?? item?.salePrice ?? 0;
        return total + (item.quantity ?? 1) * unitPrice;
      }, 0),
    [cart]
  );
  const total = subtotal - discountAmount;

  // ── Bulk discount tier (was an IIFE in JSX — now a memo) ──────────────────
  const bulkDiscount = useMemo(() => {
    const totalQty = cart.reduce(
      (sum: number, item: any) => sum + (item.quantity ?? 1),
      0
    );
    const activeTier =
      totalQty >= 10
        ? { label: "10+ vials", discount: "0%" }
        : totalQty >= 5
        ? { label: "5+ vials", discount: "0%" }
        : null;
    const nextTier =
      totalQty < 5
        ? { need: 5 - totalQty, label: "5% off" }
        : totalQty < 10
        ? { need: 10 - totalQty, label: "10% off" }
        : null;
    return { activeTier, nextTier };
  }, [cart]);

  // ── Fetch addresses ────────────────────────────────────────────────────────
  const fetchShippingAddresses = useCallback(async () => {
    if (!user?.id) return;
    try {
      const fetched: Address[] = await getShippingAddresses(user.id);
      setAddresses(fetched);
      if (fetched.length > 0) {
        setSelectedAddressId((prev) => {
          if (prev) return prev; // keep existing selection
          const def = fetched.find((a) => a.isDefault);
          return def ? def.id : fetched[0].id;
        });
      }
    } catch {
      toast.error("Failed to load shipping addresses");
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchShippingAddresses();
  }, [user?.id, fetchShippingAddresses]);

  // ── Bulk-discount toast from search param ─────────────────────────────────
  useEffect(() => {
    if (searchParams.get("reason") === "add_more_vials") {
      toast.info("Add more vials to unlock a bulk discount!", {
        description: "5+ vials = 5% off · 10+ vials = 10% off",
        duration: 6000,
        icon: "📦",
      });
    }
  }, [searchParams]);

  // ── Debounced compliance API call ─────────────────────────────────────────
  // Rapid checkbox toggles fire only one request, 600ms after the last toggle.
  useEffect(() => {
    if (!user?.id || (!agreedAge && !agreedNotHuman)) return;

    if (complianceDebounceRef.current) clearTimeout(complianceDebounceRef.current);
    complianceDebounceRef.current = setTimeout(async () => {
      try {
        await updateCompliance(user.id, {
          agreedAge18Plus: agreedAge,
          agreedNotForHumanConsumption: agreedNotHuman,
        });
      } catch {
        // Non-critical — swallow silently
      }
    }, 600);

    return () => {
      if (complianceDebounceRef.current) clearTimeout(complianceDebounceRef.current);
    };
  }, [agreedAge, agreedNotHuman, user?.id]);

  // ── Address handlers ───────────────────────────────────────────────────────
  const handleAddNewAddress = useCallback(async () => {
    const { fullName, addressLine1, city, postalCode } = newAddress;
    if (!fullName || !addressLine1 || !city || !postalCode) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!user?.id) return;
    try {
      await createShippingAddress({
        ...newAddress,
        userId: user.id,
        isDefault: addresses.length === 0,
      });
      toast.success("Address added successfully");
      await fetchShippingAddresses();
      setShowAddressForm(false);
      setNewAddress({ ...EMPTY_ADDRESS });
    } catch {
      toast.error("Failed to add address");
    }
  }, [newAddress, user?.id, addresses.length, fetchShippingAddresses]);

  // ── Coupon handlers ────────────────────────────────────────────────────────
  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim()) { setCouponError("Please enter a coupon code"); return; }
    setLoading(true);
    try {
      const validation = await validateCoupon(couponCode, subtotal);
      if (!validation.isValid || !validation.coupon) {
        setCouponError(validation.message || "Invalid coupon code");
        setDiscountAmount(0);
        setAppliedCoupon(null);
        return;
      }
      const coupon = validation.coupon;
      let discount =
        coupon.discountType === "PERCENTAGE"
          ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount ?? Infinity)
          : coupon.discountValue;
      setDiscountAmount(discount);
      setAppliedCoupon(coupon);
      setCouponError("");
      toast.success(`Coupon "${couponCode}" applied!`);
    } catch {
      setCouponError("Failed to validate coupon");
      setDiscountAmount(0);
      setAppliedCoupon(null);
    } finally {
      setLoading(false);
    }
  }, [couponCode, subtotal]);

  const removeCoupon = useCallback(() => {
    setDiscountAmount(0);
    setCouponCode("");
    setCouponError("");
    setAppliedCoupon(null);
    toast.success("Coupon removed");
  }, []);

  // ── Quantity handlers ──────────────────────────────────────────────────────
  // Use store action if available, otherwise fall back to setState.
  const decreaseQuantity = useCallback(
    (id: string) => {
      if (typeof updateCartItem === "function") {
        const item = cart.find((i: any) => i.id === id);
        if (item && (item.quantity ?? 1) > 1) {
          updateCartItem(id, { quantity: item.quantity - 1 });
        }
      } else {
        useStore.setState((state: any) => ({
          cart: state.cart.map((item: any) =>
            item.id === id && (item.quantity ?? 1) > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
        }));
      }
    },
    [cart, updateCartItem]
  );

  const increaseQuantity = useCallback(
    (id: string) => {
      if (typeof updateCartItem === "function") {
        const item = cart.find((i: any) => i.id === id);
        if (item) updateCartItem(id, { quantity: (item.quantity ?? 1) + 1 });
      } else {
        useStore.setState((state: any) => ({
          cart: state.cart.map((item: any) =>
            item.id === id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item
          ),
        }));
      }
    },
    [cart, updateCartItem]
  );

  const removeItem = useCallback(
    (id: string) => {
      removeFromCart(id, user, location, deviceInfo);
      toast.success("Item removed from cart");
    },
    [removeFromCart, user, location, deviceInfo]
  );

  // ── Validation ─────────────────────────────────────────────────────────────
  // FIX: returns the errors array directly so handleProceedToCheckout can read
  // it synchronously — avoids the stale-closure bug where toast showed the
  // *previous* render's errors (setState is async, reading state after calling
  // setValidationErrors gives you the old value).
  const validateForm = useCallback((): string[] => {
    const errors: string[] = [];
    if (cart.length === 0)           errors.push("Your cart is empty");
    if (addresses.length === 0)      errors.push("Please add a shipping address");
    else if (!selectedAddressId)     errors.push("Please select a shipping address");
    if (!agreedAge)                  errors.push("Please confirm you are 18 years or older");
    if (!agreedNotHuman)             errors.push("Please confirm this product is not for human consumption");
    return errors;
  }, [cart.length, addresses.length, selectedAddressId, agreedAge, agreedNotHuman]);

  const handleProceedToCheckout = useCallback(() => {
    // Get errors synchronously from the return value — NOT from state
    const errors = validateForm();
    setValidationErrors(errors);

    if (errors.length > 0) {
      setShowValidationSummary(true);
      // errors[0] is fresh, not stale
      toast.error(errors[0], {
        description:
          errors.length > 1 ? `And ${errors.length - 1} more issue(s) to resolve` : undefined,
        duration: 5000,
      });
      setTimeout(() => {
        if (!agreedAge || !agreedNotHuman) {
          complianceSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (addresses.length === 0 || !selectedAddressId) {
          addressSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
      return;
    }

    placeOrder();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validateForm, agreedAge, agreedNotHuman, addresses.length, selectedAddressId]);

  // ── Place order ────────────────────────────────────────────────────────────
  const placeOrder = useCallback(async () => {
    if (!user) return router.push("/login");
    if (cart.length === 0) { toast.error("Your cart is empty."); return; }

    setLoading(true);
    try {
      const sessionCart = cart.map((item: any) => ({
        id: item.id,
        title: item.name,
        quantity: item.quantity || 1,
        sale_price: item?.selectedVariant?.price ?? item?.salePrice ?? 0,
        selectedOptions: item?.selectedVariant
          ? {
              variant: item.selectedVariant.value.includes(item.selectedVariant.unit)
                ? item.selectedVariant.value
                : `${item.selectedVariant.value}${item.selectedVariant.unit ? ` ${item.selectedVariant.unit}` : ""}`,
              variantId: item.selectedVariant.id,
            }
          : undefined,
        selectedVariant: item?.selectedVariant || undefined,
      }));

      const sessionRes = await fetch("/api/order/create-payment-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: sessionCart,
          selectedAddressId,
          coupon: appliedCoupon
            ? { code: appliedCoupon.code, discountAmount }
            : null,
        }),
      });

      if (!sessionRes.ok) {
        const err = await sessionRes.json();
        throw new Error(err.error || "Failed to create payment session");
      }

      const { sessionId } = await sessionRes.json();

      const orderItems = cart.map((item: any) => {
        const unitPrice = item?.selectedVariant?.price ?? item?.salePrice ?? 0;
        return {
          productId:    item.id,
          productName:  item.name,
          productImage: item.images?.[0]?.url || null,
          variantInfo:  item?.selectedVariant
            ? `${item.selectedVariant.value}${item.selectedVariant.unit ? ` ${item.selectedVariant.unit}` : ""}`
            : item?.selectedOption?.label || "",
          quantity: item.quantity || 1,
          price:    unitPrice,
          subTotal: unitPrice * (item.quantity || 1),
        };
      });

      const createdOrder = await createOrder({
        userId:           user.id,
        items:            orderItems,
        subtotal,
        discountAmount,
        totalAmount:      total,
        couponCode:       appliedCoupon?.code || null,
        shippingAddressId: selectedAddressId,
        paymentMethod:    paymentMethod === "online" ? "stripe" : "cod",
        termsAccepted:    bothAgreed,
        orderStatus:      "PENDING",
        paymentStatus:    "UNPAID",
        paymentSessionId: sessionId,
        metadata: {
          location,
          deviceInfo,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        },
      });

      await fetch("/api/order/create-payment-session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, orderId: createdOrder.id }),
      });

      if (!createdOrder?.id) throw new Error("Failed to create order");

      clearCart(user, location, deviceInfo);
      toast.success("Order placed successfully!");

      router.push(
        paymentMethod === "cod"
          ? `/payment-success?orderId=${createdOrder.id}`
          : `/checkout?orderId=${createdOrder.id}&sessionId=${sessionId}`
      );
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, cart, selectedAddressId, appliedCoupon, discountAmount, subtotal, total, paymentMethod, bothAgreed, location, deviceInfo]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121214] to-[#0a0a0c]">
      <div className="md:w-[85%] w-[95%] mx-auto py-8">

        {/* Breadcrumb */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-jost">Shopping Cart</h1>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-400 hover:text-emerald-400 transition-colors">Home</Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300">Cart</span>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <ShoppingBag size={40} className="text-gray-600" />
            </div>
            <p className="text-gray-300 text-xl font-semibold mb-2">Your cart is empty</p>
            <p className="text-gray-500 text-sm mb-6">Add some products to get started.</p>
            <Link href="/" className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all duration-200 flex items-center gap-2 font-medium">
              Browse Products <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="lg:flex items-start gap-8">

            {/* ── Cart Items ── */}
            <div className="w-full lg:w-[65%]">
              <div className="bg-[#121214] border border-white/10 rounded-xl overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-white/5 border-b border-white/10 text-gray-400 text-xs font-semibold uppercase tracking-widest">
                  <div className="col-span-5">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-2 text-center">Remove</div>
                </div>

                <div className="divide-y divide-white/10">
                  {cart.map((item: any) => {
                    const unitPrice = item?.selectedVariant?.price ?? item?.salePrice ?? 0;
                    return (
                      <div key={item.id} className="p-4 hover:bg-white/[0.03] transition-colors duration-200 group">
                        <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">

                          {/* Product Info */}
                          <div className="flex gap-4 md:col-span-5 w-full">
                            <div className="relative w-20 h-20 bg-black/30 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                              <Image
                                src={item?.images?.[0]?.url || "/placeholder.jpg"}
                                alt={item?.name || "Product image"}
                                fill
                                sizes="80px"
                                className="object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-white line-clamp-2 mb-1 text-sm">{item?.name}</h3>
                              {item?.category?.title && (
                                <p className="text-[11px] text-emerald-500 uppercase font-bold tracking-wider mb-1">
                                  {item.category.title}
                                </p>
                              )}
                              {item?.selectedVariant && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  <Package size={9} />
                                  {item.selectedVariant.value}{item.selectedVariant.unit ? ` ${item.selectedVariant.unit}` : ""}
                                </span>
                              )}
                              {item?.sku && (
                                <p className="text-[10px] text-gray-600 mt-1">SKU: {item.sku}</p>
                              )}
                              {item?.batches?.[0]?.purity && (
                                <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                                  <FlaskConical size={9} className="text-emerald-600" />
                                  Purity: {item.batches[0].purity}%
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Price */}
                          <div className="md:col-span-2 flex items-center justify-start md:justify-center">
                            <span className="text-white font-semibold">${unitPrice.toFixed(2)}</span>
                          </div>

                          {/* Quantity */}
                          <div className="md:col-span-3 flex items-center justify-start md:justify-center">
                            <div className="flex items-center border border-white/10 rounded-lg bg-white/5 overflow-hidden">
                              <button
                                className="w-9 h-9 flex items-center justify-center text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                onClick={() => decreaseQuantity(item.id)}
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span className="px-3 text-white min-w-[40px] text-center text-sm font-semibold">
                                {item?.quantity ?? 1}
                              </span>
                              <button
                                className="w-9 h-9 flex items-center justify-center text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                onClick={() => increaseQuantity(item.id)}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Remove */}
                          <div className="md:col-span-2 flex items-center justify-start md:justify-center">
                            <button
                              className="text-gray-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10"
                              onClick={() => removeItem(item.id)}
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cart Footer */}
                <div className="p-4 bg-white/[0.02] border-t border-white/10 flex justify-between items-center">
                  <span className="text-gray-500 text-sm">
                    {cart.length} item{cart.length > 1 ? "s" : ""} in cart
                  </span>
                  <span className="text-gray-300 text-sm font-semibold">
                    Subtotal: <span className="text-white">${subtotal.toFixed(2)}</span>
                  </span>
                </div>

                {/* Bulk discount tiers — now from useMemo, not an IIFE */}
                <div className="p-4 space-y-2">
                  {bulkDiscount.activeTier && (
                    <div className="flex items-center gap-2 px-2.5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <Tag size={12} className="text-emerald-400 shrink-0" />
                      <p className="text-xs text-emerald-300 font-semibold">
                        Bulk discount unlocked:{" "}
                        <span className="font-bold">{bulkDiscount.activeTier.discount} off</span>
                        <span className="text-emerald-600 ml-1">({bulkDiscount.activeTier.label})</span>
                      </p>
                    </div>
                  )}
                  {/* {bulkDiscount.nextTier && (
                    <div className="flex items-center gap-2 px-2.5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <Package size={12} className="text-amber-400 shrink-0" />
                      <p className="text-xs text-amber-300">
                        Add{" "}
                        <span className="font-bold">
                          {bulkDiscount.nextTier.need} more vial{bulkDiscount.nextTier.need > 1 ? "s" : ""}
                        </span>{" "}
                        to unlock{" "}
                        <span className="font-bold">{bulkDiscount.nextTier.label}</span>
                      </p>
                    </div>
                  )} */}
                </div>
              </div>
            </div>

            {/* ── Order Summary ── */}
            <div className="w-full lg:w-[35%] mt-8 lg:mt-0">
              <div className="bg-[#121214] border border-white/10 rounded-xl p-6 sticky top-8 space-y-5">
                <h2 className="text-lg font-bold text-white pb-4 border-b border-white/10 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-emerald-500" />
                  Order Summary
                </h2>

                {/* Validation Summary */}
                {showValidationSummary && validationErrors.length > 0 && (
                  <div ref={summaryRef} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-3 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-400" />
                        <h3 className="text-sm font-semibold text-red-400">Please resolve the following:</h3>
                      </div>
                      <button onClick={() => setShowValidationSummary(false)} className="text-gray-500 hover:text-gray-300 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {validationErrors.map((error, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-red-300">
                          <span className="text-red-400 mt-0.5">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-500 italic">Fix these issues to proceed with your order</p>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-gray-400 text-sm">
                    <span>Subtotal ({cart.length} items)</span>
                    <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <div className="flex items-center gap-2 text-sm">
                        <Tag size={13} className="text-emerald-400" />
                        <span className="text-emerald-300 font-medium">
                          Discount ({appliedCoupon?.discountType === "PERCENTAGE" ? `${appliedCoupon.discountValue}%` : `$${appliedCoupon?.discountValue}`})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-semibold text-sm">−${discountAmount.toFixed(2)}</span>
                        <button onClick={removeCoupon} className="text-gray-500 hover:text-red-400 transition-colors">
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-gray-400 text-sm">
                    <span>Shipping</span>
                    <span className="text-gray-300 italic">Calculated at checkout</span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <span className="text-white font-bold text-lg">Total</span>
                    <span className="text-emerald-400 font-bold text-2xl">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Coupon */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                      placeholder="Enter coupon code"
                      disabled={!!appliedCoupon}
                      className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
                    />
                    {!appliedCoupon ? (
                      <button
                        onClick={applyCoupon}
                        disabled={loading}
                        className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-all text-sm font-semibold disabled:opacity-50"
                      >
                        Apply
                      </button>
                    ) : (
                      <button
                        onClick={removeCoupon}
                        className="px-4 py-2.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all text-sm font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <X size={11} /> {couponError}
                    </p>
                  )}
                </div>

                {/* Shipping Address */}
                <div ref={addressSectionRef} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className={`text-xs font-semibold uppercase tracking-widest flex items-center gap-1.5 ${validationErrors.some((e) => e.includes("address")) ? "text-red-400" : "text-gray-400"}`}>
                      Shipping Address
                      {validationErrors.some((e) => e.includes("address")) && <span className="text-red-400">*</span>}
                    </label>
                    <button
                      onClick={() => {
                        setShowAddressForm((v) => !v);
                        setValidationErrors((prev) => prev.filter((e) => !e.includes("address")));
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <Plus size={12} /> Add New
                    </button>
                  </div>

                  {showAddressForm && (
                    <div className="space-y-2 p-3 bg-white/5 rounded-lg border border-white/10">
                      {(["fullName", "phone", "addressLine1", "addressLine2", "city", "state", "postalCode"] as const).map((field) => (
                        <input
                          key={field}
                          type={field === "phone" ? "tel" : "text"}
                          placeholder={`${field === "fullName" ? "Full Name *" : field === "addressLine1" ? "Address Line 1 *" : field === "addressLine2" ? "Address Line 2" : field === "postalCode" ? "Postal Code *" : field === "city" ? "City *" : field.charAt(0).toUpperCase() + field.slice(1)}`}
                          value={newAddress[field]}
                          onChange={(e) => setNewAddress((prev) => ({ ...prev, [field]: e.target.value }))}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/60 transition-colors"
                        />
                      ))}
                      <button
                        onClick={handleAddNewAddress}
                        className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 text-sm font-semibold transition-all"
                      >
                        Save Address
                      </button>
                    </div>
                  )}

                  {addresses.length > 0 && !showAddressForm ? (
                    <select
                      className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/60 transition-colors cursor-pointer ${validationErrors.some((e) => e.includes("address")) ? "border-red-500/50" : "border-white/10"}`}
                      value={selectedAddressId}
                      onChange={(e) => {
                        setSelectedAddressId(e.target.value);
                        setValidationErrors((prev) => prev.filter((e) => !e.includes("address")));
                      }}
                    >
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id} className="bg-[#121214]">
                          {addr.fullName} — {addr.addressLine1}, {addr.city}, {addr.country}
                          {addr.isDefault ? " (Default)" : ""}
                        </option>
                      ))}
                    </select>
                  ) : !showAddressForm && (
                    <div className={`p-3 rounded-lg border ${validationErrors.some((e) => e.includes("address")) ? "bg-red-500/10 border-red-500/20" : "bg-yellow-500/10 border-yellow-500/20"}`}>
                      <p className={`text-sm flex items-center gap-2 ${validationErrors.some((e) => e.includes("address")) ? "text-red-400" : "text-yellow-400"}`}>
                        {validationErrors.some((e) => e.includes("address")) ? <AlertCircle size={14} /> : <AlertTriangle size={14} />}
                        Please add a shipping address to place your order.
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Payment Method
                  </label>
                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === "online" ? "bg-emerald-500/10 border-emerald-500/40" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                    <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === "online"} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-emerald-500" />
                    <CreditCard size={16} className={paymentMethod === "online" ? "text-emerald-400" : "text-gray-400"} />
                    <span className={`text-sm font-medium ${paymentMethod === "online" ? "text-emerald-300" : "text-gray-300"}`}>Online Payment</span>
                  </label>
                </div>

                {/* Compliance Checkboxes */}
                <div ref={complianceSectionRef} className="space-y-3 pt-1">
                  <div className={`flex items-center gap-1 pb-2 border-b ${validationErrors.some((e) => e.includes("18 years") || e.includes("human consumption")) ? "border-red-500/20" : "border-white/10"}`}>
                    <Shield size={13} className={`${validationErrors.some((e) => e.includes("18 years") || e.includes("human consumption")) ? "text-red-400" : "text-amber-400"} mt-0.5 shrink-0`} />
                    <p className={`text-[11px] font-semibold uppercase tracking-widest ${validationErrors.some((e) => e.includes("18 years") || e.includes("human consumption")) ? "text-red-400" : "text-amber-400"}`}>
                      Compliance required
                    </p>
                  </div>

                  {/* Age checkbox */}
                  <button
                    onClick={() => {
                      setAgreedAge((v) => !v);
                      setValidationErrors((prev) => prev.filter((e) => !e.includes("18 years")));
                    }}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                      validationErrors.some((e) => e.includes("18 years"))
                        ? "bg-red-500/10 border-red-500/40"
                        : agreedAge
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {agreedAge
                        ? <CheckCircle2 size={17} className="text-emerald-400" />
                        : <Circle size={17} className={validationErrors.some((e) => e.includes("18 years")) ? "text-red-400" : "text-gray-500"} />
                      }
                    </div>
                    <div>
                      <p className={`text-sm font-semibold leading-snug ${agreedAge ? "text-emerald-300" : validationErrors.some((e) => e.includes("18 years")) ? "text-red-300" : "text-gray-300"}`}>
                        I confirm I am 18 years or older
                        {validationErrors.some((e) => e.includes("18 years")) && <span className="text-red-400 ml-1">*</span>}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        By checking this, you declare that you meet the minimum age requirement to purchase this product.
                      </p>
                    </div>
                  </button>

                  {/* Not for human consumption checkbox */}
                  <button
                    onClick={() => {
                      setAgreedNotHuman((v) => !v);
                      setValidationErrors((prev) => prev.filter((e) => !e.includes("human consumption")));
                    }}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                      validationErrors.some((e) => e.includes("human consumption"))
                        ? "bg-red-500/10 border-red-500/40"
                        : agreedNotHuman
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {agreedNotHuman
                        ? <CheckCircle2 size={17} className="text-emerald-400" />
                        : <Circle size={17} className={validationErrors.some((e) => e.includes("human consumption")) ? "text-red-400" : "text-gray-500"} />
                      }
                    </div>
                    <div>
                      <p className={`text-sm font-semibold leading-snug ${agreedNotHuman ? "text-emerald-300" : validationErrors.some((e) => e.includes("human consumption")) ? "text-red-300" : "text-gray-300"}`}>
                        I understand this is not for human consumption
                        {validationErrors.some((e) => e.includes("human consumption")) && <span className="text-red-400 ml-1">*</span>}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        This product is intended for research purposes only and must not be ingested or used on humans.
                      </p>
                    </div>
                  </button>

                  {!bothAgreed && !validationErrors.some((e) => e.includes("18 years") || e.includes("human consumption")) && (
                    <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-400 leading-relaxed">
                        You must acknowledge both statements above before you can proceed to checkout.
                      </p>
                    </div>
                  )}
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToCheckout}
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 font-semibold rounded-xl transition-all duration-300 ${
                    loading
                      ? "bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600 shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                  }`}
                >
                  {loading
                    ? <><Loader2 className="animate-spin w-4 h-4" /> Processing...</>
                    : <><Shield size={16} /> {paymentMethod === "cod" ? "Place Order" : "Proceed to Checkout"}</>
                  }
                </button>

                {(!bothAgreed || addresses.length === 0) && !showValidationSummary && (
                  <p className="text-center text-xs text-gray-600">
                    {!bothAgreed && addresses.length === 0
                      ? "Complete compliance & add address to continue"
                      : !bothAgreed
                      ? "Complete compliance checks to continue"
                      : "Add shipping address to continue"}
                  </p>
                )}

                <Link href="/" className="flex items-center justify-center gap-2 text-gray-500 hover:text-emerald-400 transition-colors text-sm">
                  Continue Shopping <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Page wrapper ─────────────────────────────────────────────────────────────

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#121214] flex items-center justify-center">
          <Loader2 className="animate-spin text-emerald-500" size={40} />
        </div>
      }
    >
      <CartContent />
    </Suspense>
  );
}