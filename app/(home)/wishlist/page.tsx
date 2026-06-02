"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingCart, Heart, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/store";
import useUser from "@/hooks/useUser";
import useDeviceTracking from "@/hooks/useDeviceTracking";
import useLocationTracking from "@/hooks/useLocationTracking";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WishlistPage() {
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const wishlist = useStore((state: any) => state.wishlist);
  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishList);

  // Handle variant selection for each wishlist item
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const handleVariantChange = (itemId: string, variantId: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [itemId]: variantId,
    }));
  };

  // Get the effective price for an item based on selected variant or sale price
  const getItemPrice = (item: any) => {
    if (item.variants && item.variants.length > 0) {
      const selectedVariantId = selectedVariants[item.id];
      if (selectedVariantId) {
        const variant = item.variants.find((v: any) => v.id === selectedVariantId);
        return variant ? variant.price : item.salePrice || item.price;
      }
      // If no variant selected, use the lowest variant price or sale price
      const lowestVariantPrice = Math.min(...item.variants.map((v: any) => v.price));
      return lowestVariantPrice || item.salePrice || item.price;
    }
    return item.salePrice || item.price;
  };

  // Get the display price (without quantity multiplication)
  const getDisplayPrice = (item: any) => {
    return getItemPrice(item);
  };

  // Get the total price (with quantity multiplication)
  const getTotalPrice = (item: any) => {
    return getItemPrice(item) * (item.quantity ?? 1);
  };

  const increaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === id
          ? { ...item, quantity: (item.quantity ?? 1) + 1 }
          : item
      ),
    }));
  };

  const decreaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };

  // Prepare item for adding to cart with selected variant
  const handleAddToCart = (item: any) => {
    const cartItem = { ...item };
    
    // If variants exist and one is selected, add the variant info
    if (item.variants && item.variants.length > 0) {
      const selectedVariantId = selectedVariants[item.id];
      if (selectedVariantId) {
        const variant = item.variants.find((v: any) => v.id === selectedVariantId);
        cartItem.selectedVariant = variant;
        cartItem.price = variant.price;
      } else {
        // Use lowest variant price if none selected
        const lowestPrice = Math.min(...item.variants.map((v: any) => v.price));
        cartItem.price = lowestPrice;
      }
    } else {
      cartItem.price = item.salePrice || item.price;
    }
    
    addToCart(cartItem, user, location, deviceInfo);
  };

  const handleAddAllToCart = () => {
    wishlist.forEach((item: any) => {
      handleAddToCart(item);
    });
  };

  const totalItems = wishlist.reduce(
    (acc: number, item: any) => acc + (item.quantity ?? 1),
    0
  );

  // Calculate subtotal based on variant selections
  const subtotal = wishlist.reduce(
    (acc: number, item: any) => acc + getTotalPrice(item),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Wishlist</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">My Wishlist</h1>
            {wishlist.length > 0 && (
              <Badge variant="secondary">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Empty state */}
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
            <div className="bg-muted rounded-full p-6">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1">Your wishlist is empty</h2>
              <p className="text-muted-foreground text-sm">
                Save items you love and come back to them anytime.
              </p>
            </div>
            <Link href="/">
              <Button className="mt-2">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table header — desktop only */}
            <div className="hidden md:grid grid-cols-12 text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 pb-2">
              <span className="col-span-5">Product</span>
              <span className="col-span-2 text-center">Price</span>
              <span className="col-span-2 text-center">Quantity</span>
              <span className="col-span-3 text-right">Actions</span>
            </div>

            <Separator />

            {/* Items */}
            {wishlist.map((item: any) => (
              <div key={item.id}>
                <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 py-4 px-4">
                  {/* Product */}
                  <div className="md:col-span-5 flex items-center gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border bg-muted">
                      <Image
                        src={item.images?.[0]?.url || "/placeholder.png"}
                        alt={item.title || item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <Link
                        href={`/products/${item.id}`}
                        className="font-medium text-sm leading-snug hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.title || item.name}
                      </Link>
                      {item.category && (
                        <span className="text-xs text-muted-foreground">
                          {typeof item.category === 'object' ? item.category.name : item.category}
                        </span>
                      )}
                      
                      {/* Variant Selector */}
                      {item.variants && item.variants.length > 0 && (
                        <div className="mt-2">
                          <Select
                            value={selectedVariants[item.id] || ""}
                            onValueChange={(value) => handleVariantChange(item.id, value)}
                          >
                            <SelectTrigger className="h-8 text-xs w-[140px]">
                              <SelectValue placeholder="Select variant" />
                            </SelectTrigger>
                            <SelectContent>
                              {item.variants.map((variant: any) => (
                                <SelectItem key={variant.id} value={variant.id}>
                                  <div className="flex items-center justify-between gap-2">
                                    <span>{variant.value} {variant.unit}</span>
                                    <span className="text-muted-foreground">
                                      ${variant.price.toFixed(2)}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="md:col-span-2 flex md:justify-center items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        ${getTotalPrice(item).toFixed(2)}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-xs text-muted-foreground">
                          (${getDisplayPrice(item).toFixed(2)} each)
                        </span>
                      )}
                      {item.variants && item.variants.length > 0 && !selectedVariants[item.id] && (
                        <span className="text-xs text-amber-600">
                          From ${Math.min(...item.variants.map((v: any) => v.price)).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="md:col-span-2 flex md:justify-center">
                    <div className="flex items-center border rounded-full overflow-hidden">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="px-3 py-1.5 text-sm hover:bg-muted transition-colors disabled:opacity-40"
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium min-w-[2rem] text-center">
                        {item.quantity ?? 1}
                      </span>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-3 flex items-center md:justify-end gap-2">
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeFromWishlist(item.id, user, location, deviceInfo)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Separator />
              </div>
            ))}

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 gap-4">
              <div className="text-sm text-muted-foreground">
                Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""}):
                <span className="text-foreground font-semibold ml-2">
                  ${subtotal.toFixed(2)}
                </span>
                {wishlist.some((item: any) => item.variants && item.variants.length > 0 && !selectedVariants[item.id]) && (
                  <span className="block text-xs text-amber-600 mt-1">
                    * Select variants for accurate pricing
                  </span>
                )}
              </div>
              <Button
                size="lg"
                className="gap-2 w-full sm:w-auto"
                onClick={handleAddAllToCart}
              >
                <ShoppingCart className="h-4 w-4" />
                Add All to Cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}