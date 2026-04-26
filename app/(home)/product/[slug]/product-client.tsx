// app/product/[slug]/product-client.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  ChevronLeft,
  Minus,
  Plus,
  Check,
  X,
  Truck,
  ShieldCheck,
  RotateCcw,
  Clock,
  Star,
  FileText,
  FlaskConical,
  AlertCircle,
} from "lucide-react";
import Ratings from "@/components/ratings";
import { useStore } from "@/store";
import useUser from "@/hooks/useUser";
import useLocationTracking from "@/hooks/useLocationTracking";
import useDeviceTracking from "@/hooks/useDeviceTracking";

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  unit: string;
  price: number | null;
  stock: number;
  sku: string;
}

interface ProductImage {
  url: string;
  alt?: string;
}

interface ProductCategory {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
}

interface ProductReview {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  productId: string;
  createdAt: Date;
  userName?: string; // Assuming you have the user's name available
}


interface Product {
  id: string;
  name: string;
  slug: string;
  description: string; 
  price: number | null;
  salePrice: number | null;
  stock: number;
  categoryId?: string | null;
  category: ProductCategory | null;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: ProductReview[];
  purity?: string | null;
  casNumber?: string | null;
  molecularFormula?: string | null;
  molecularWeight?: string | null;
}

interface ProductClientProps {
  product: Product;
  relatedProducts: Product[];
}





export function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews">("description");
  
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishList = useStore((state: any) => state.addToWishList);
  const removeFromWishList = useStore((state: any) => state.removeFromWishList);
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);
  const { user } = useUser();

  // Check if product is in wishlist
  useEffect(() => {
    setIsWishlisted(wishlist.some((item: any) => item.id === product.id));
  }, [wishlist, product.id]);

  // Check if product is in cart
  const isInCart = cart.some((item: any) => {
    if (selectedVariant) {
      return item.id === product.id && item.selectedVariant?.id === selectedVariant.id;
    }
    return item.id === product.id && !item.selectedVariant;
  });

  
const currentPrice = selectedVariant?.price ?? product.salePrice ?? 0;


const originalPrice = product.price ?? 0;

const hasDiscount = originalPrice > currentPrice;


  // Stock check
  const currentStock = selectedVariant?.stock ?? product.stock;
  const isLowStock = currentStock <= 5;
  const isOutOfStock = currentStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    addToCart(
      {
        ...product,
        quantity,
        selectedVariant: selectedVariant ? {
          id: selectedVariant.id,
          value: selectedVariant.value,
          unit: selectedVariant.unit,
          price: selectedVariant.price,
        } : null,
        salePrice: currentPrice,
      },
      user,
      location,
      deviceInfo
    );
  };

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishList(product.id, user, location, deviceInfo);
    } else {
      addToWishList({ ...product, quantity: 1 }, user, location, deviceInfo);
    }
  };

  const updateQuantity = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= currentStock) {
      setQuantity(newQuantity);
    }
  };

  // Calculate average rating
  const averageRating = product.reviews?.length
    ? product.reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / product.reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
            Home
          </Link>
          <span className="text-gray-600 mx-2">/</span>
          <Link href={`/category/${product.category?.slug}`} className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
            {product.category?.title}
          </Link>
          <span className="text-gray-600 mx-2">/</span>
          <span className="text-gray-300 text-sm">{product.name}</span>
        </div>

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ChevronLeft size={20} />
          <span className="text-sm">Back</span>
        </button>

        {/* Product Main Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10">
              <Image
                src={product.images?.[selectedImage]?.url || "/images/placeholder.jpg"}
                alt={product.images?.[selectedImage]?.alt || product.name}
                fill
                className="object-cover"
                priority
              />
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded">
                  Save ${(originalPrice - currentPrice).toFixed(2)}
                </div>
              )}
              {isLowStock && !isOutOfStock && (
                <div className="absolute top-4 right-4 bg-amber-500/90 text-black text-xs font-bold px-2 py-1 rounded">
                  Low Stock
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="text-white text-lg font-bold uppercase tracking-wider">Out of Stock</span>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? "border-emerald-500" : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <Image src={img.url} alt={img.alt || ""} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <div>
              <Link
                href={`/category/${product.category?.slug}`}
                className="text-emerald-500 text-xs uppercase font-bold tracking-widest hover:underline"
              >
                {product.category?.title}
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white">{product.name}</h1>

            {/* Ratings */}
            <div className="flex items-center gap-3">
              <Ratings rating={averageRating} />
              <span className="text-gray-400 text-sm">
                ({product.reviews?.length || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-white">${currentPrice.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
              )}
              {hasDiscount && (
                <span className="text-emerald-500 text-sm font-medium">
                  {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% off
                </span>
              )}
            </div>

            {/* Purity Badge */}
            {product.purity && (
              <div className="inline-flex items-center gap-2 bg-white/5 rounded-full px-3 py-1">
                <FlaskConical size={14} className="text-gray-400" />
                <span className="text-xs text-gray-300">Purity: {product.purity}</span>
              </div>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Select Variant</label>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariant(variant);
                        setQuantity(1);
                      }}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedVariant?.id === variant.id
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20"
                      } ${variant.stock <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={variant.stock <= 0}
                    >
                      {variant.value} {variant.unit}
                     {variant.price != null && variant.price !== product.salePrice && (
                     <span className="ml-2 text-xs text-emerald-500">
                     ${variant.price.toFixed(2)}
                     </span>
)}

                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Quantity</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-white/10 rounded-lg bg-white/5">
                    <button
                      onClick={() => updateQuantity(-1)}
                      disabled={quantity <= 1}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center text-white">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(1)}
                      disabled={quantity >= currentStock}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">{currentStock} units available</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isInCart}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  isOutOfStock
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : isInCart
                    ? "bg-emerald-700 text-emerald-300 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95"
                }`}
              >
                <ShoppingBag size={18} />
                {isOutOfStock ? "Out of Stock" : isInCart ? "Already in Cart" : "Add to Cart"}
              </button>
              
              <button
                onClick={handleWishlist}
                className="px-6 py-3 rounded-lg border border-white/10 text-gray-400 hover:text-red-500 hover:border-red-500/30 transition-all"
              >
                <Heart size={18} fill={isWishlisted ? "currentColor" : "transparent"} className={isWishlisted ? "text-red-500" : ""} />
              </button>

              <button
                onClick={() => router.push("/cart")}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold hover:from-yellow-400 hover:to-amber-400 transition-all"
              >
                Checkout
              </button>
            </div>

            {/* Shipping Info */}
            <div className="border-t border-white/10 pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck size={16} className="text-gray-400" />
                <span className="text-gray-300">Free shipping on orders over $200</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck size={16} className="text-gray-400" />
                <span className="text-gray-300">Third-party tested for purity & potency</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw size={16} className="text-gray-400" />
                <span className="text-gray-300">14-day guarantee on damaged/incorrect items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex gap-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === "description" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-gray-400 hover:text-white"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("specifications")}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === "specifications" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-gray-400 hover:text-white"
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === "reviews" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-gray-400 hover:text-white"
              }`}
            >
              Reviews ({product.reviews?.length || 0})
            </button>
          </div>

          <div className="py-6">
            {activeTab === "description" && (
              <div className="prose prose-invert prose-gray max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
                <div className="mt-6 bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-400/70">
                      <p className="font-medium mb-1">Research Use Only</p>
                      <p>This product is intended for laboratory research purposes only. Not for human consumption or clinical use.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-white/10">
                      <td className="px-4 py-3 text-sm font-medium text-gray-400 w-1/3">Product Name</td>
                      <td className="px-4 py-3 text-sm text-white">{product.name}</td>
                    </tr>
                    {product.casNumber && (
                      <tr className="border-b border-white/10">
                        <td className="px-4 py-3 text-sm font-medium text-gray-400">CAS Number</td>
                        <td className="px-4 py-3 text-sm text-white font-mono">{product.casNumber}</td>
                      </tr>
                    )}
                    {product.molecularFormula && (
                      <tr className="border-b border-white/10">
                        <td className="px-4 py-3 text-sm font-medium text-gray-400">Molecular Formula</td>
                        <td className="px-4 py-3 text-sm text-white font-mono">{product.molecularFormula}</td>
                      </tr>
                    )}
                    {product.molecularWeight && (
                      <tr className="border-b border-white/10">
                        <td className="px-4 py-3 text-sm font-medium text-gray-400">Molecular Weight</td>
                        <td className="px-4 py-3 text-sm text-white">{product.molecularWeight} g/mol</td>
                      </tr>
                    )}
                    {product.purity && (
                      <tr className="border-b border-white/10">
                        <td className="px-4 py-3 text-sm font-medium text-gray-400">Purity (HPLC)</td>
                        <td className="px-4 py-3 text-sm text-white">{product.purity}</td>
                      </tr>
                    )}
                    <tr className="border-b border-white/10">
                      <td className="px-4 py-3 text-sm font-medium text-gray-400">Storage</td>
                      <td className="px-4 py-3 text-sm text-white">-20°C, protected from light</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-400">Shipping</td>
                      <td className="px-4 py-3 text-sm text-white">Ambient temperature with ice pack</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review, idx) => (
                    <div key={idx} className="border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Ratings rating={review.rating} />
                        <span className="text-xs text-gray-500">{review.userName}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No reviews yet. Be the first to review this product.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/product/${relatedProduct.slug}`}
                  className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={relatedProduct.images?.[0]?.url || "/images/placeholder.jpg"}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-emerald-500 text-[10px] uppercase font-bold">{relatedProduct.category?.title}</p>
                    <h3 className="text-sm font-medium text-white line-clamp-1 mt-1">{relatedProduct.name}</h3>
                    <p className="text-sm font-bold text-white mt-2">${relatedProduct.salePrice?.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}