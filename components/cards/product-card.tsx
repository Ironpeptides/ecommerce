"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import Ratings from '../ratings';
import { Eye, Heart, ShoppingBag, Clock, X, Check } from 'lucide-react';
import ProductDetailsCard from './product-details.card';
import { useStore } from '../../store';
import useUser from '../../hooks/useUser';
import useLocationTracking from '../../hooks/useLocationTracking';
import useDeviceTracking from '../../hooks/useDeviceTracking';
import { createFetchSlug } from '../../utils/slugify';
import { useRouter, useSearchParams } from "next/navigation";

// ─── Reusable Options Modal ───────────────────────────────────────────────────

interface ProductOption {
  label: string;
  value: string;
  price?: number;
  originalVariant: any; // Add this to hold the full object
}

interface OptionsModalProps {
  product: any;
  options: ProductOption[];
  onClose: () => void;
  onConfirm: (selected: ProductOption) => void;
}

const OptionsModal = ({ product, options, onClose, onConfirm }: OptionsModalProps) => {
  const [selected, setSelected] = useState<ProductOption | null>(null);

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm'
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className='relative w-full max-w-sm mx-4 bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-2xl'>

        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-white/10'>
          <div>
            {/* Real field: product.name */}
            <h2 className='text-sm font-semibold text-gray-100 line-clamp-1'>{product?.name}</h2>
            {/* Real field: product.category?.title (category is now an object) */}
            <p className='text-xs text-emerald-500 mt-0.5'>{product?.category?.title}</p>
          </div>
          <button
            onClick={onClose}
            className='rounded-full p-1.5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white'
          >
            <X size={16} />
          </button>
        </div>

        {/* Options */}
        <div className='p-5 space-y-2'>
          <p className='text-xs text-gray-400 mb-3 uppercase tracking-widest font-bold'>Choose a variant</p>
          {options.map((opt) => {
            const isSelected = selected?.value === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelected(opt)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <span>{opt.label}</span>
                {opt.price !== undefined && (
                  <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-gray-500'}`}>
                    ${opt.price.toFixed(2)}
                  </span>
                )}
                {isSelected && <Check size={14} className='text-emerald-500 ml-2 shrink-0' />}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className='px-5 pb-5 flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-gray-400 hover:bg-white/5 transition-colors'
          >
            Cancel
          </button>
          <button
            disabled={!selected}
            onClick={() => selected && onConfirm(selected)}
            className='flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95'
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard = ({ product, isEvent }: { product: any; isEvent?: boolean }) => {

  const [timeLeft, setTimeLeft] = useState("");
  const [open, setOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishList = useStore((state: any) => state.addToWishList);
  const removeFromWishList = useStore((state: any) => state.removeFromWishList);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some((item: any) => item.id === product.id);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === product.id);
  const { user } = useUser();
    const router       = useRouter();

  // Build options from real variants shape:
  // variant: { id, name, value, quantity, unit, price, stock, sku, productId }
  

      const productOptions: ProductOption[] = product?.variants?.length
  ? product.variants.map((v: any) => ({
      label: `${v.value}${v.unit ? ' ' + v.unit : ''}`,
      value: v.id,
      price: v.price,
      originalVariant: v, // Pass the whole variant object here
    }))
  : [
      // Fallback (for the fallback, you'll have to mock a variant structure)
      { 
        label: '10mg 3ml', 
        value: '10mg-3ml', 
        price: product?.salePrice,
        originalVariant: { value: '10mg', unit: '3ml', price: product?.salePrice } 
      },
      { label: '30mg  3ml',    value: '30mg-3ml',    price: product?.salePrice * 1.5
        , originalVariant: { value: '10mg', unit: '3ml', price: product?.salePrice } 
       }
      ,
      { label: '60mg  3ml',    value: '60mg-3ml',    price: product?.salePrice * 2,
        originalVariant: { value: '10mg', unit: '3ml', price: product?.salePrice } 
       },
      { label: '120mg – 10ml', value: '120mg-10ml',  price: product?.salePrice * 3.5,originalVariant: { value: '10mg', unit: '3ml', price: product?.salePrice }  },
      
    ];

  const handleOptionConfirm = (selected: ProductOption) => {
  addToCart(
    { 
      ...product, 
      quantity: 1, 
      // Instead of just 'selected', pass the structured variant details
      selectedVariant: {
        id: selected.value,
        ...selected.originalVariant
      },
      salePrice: selected.price ?? product.salePrice 
    },
    user, 
    location, 
    deviceInfo
  );
  setOptionsOpen(false);
};

  useEffect(() => {
   
    if (isEvent && product?.ending_date) {
      const calc = () => {
        const diff = new Date(product.ending_date).getTime() - Date.now();
        if (diff <= 0) { setTimeLeft("Expired"); return; }
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft(`${d}d ${h}h ${m}m`);
      };
      calc();
      const interval = setInterval(calc, 60000);
      return () => clearInterval(interval);
    }
  }, [isEvent, product?.ending_date]);

  
  const isLowStock = product?.stock <= (product?.lowStock ?? 5);

  return (
    <>
      <div className='group w-full bg-white/5 border border-white/10 rounded-xl overflow-hidden relative transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]'>

        {/* Badges */}
        <div className='absolute top-3 left-3 z-20 flex flex-col gap-2'>
          {isEvent && (
            <div className='bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg'>
              Special Offer
            </div>
          )}
        
          {isLowStock && (
            <div className='bg-amber-500/10 border border-amber-500/50 text-amber-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-md'>
              Limited Stock
            </div>
          )}
         
          {product?.isFeatured && !isEvent && (
            <div className='bg-purple-600/20 border border-purple-500/40 text-purple-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-md'>
              Featured
            </div>
          )}
        </div>

        {/* Action Icons */}
        <div className='absolute z-20 flex flex-col gap-2 right-3 top-3 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300'>
          <button
            onClick={() => isWishlisted
              ? removeFromWishList(product.id, user, location, deviceInfo)
              : addToWishList({ ...product, quantity: 1 }, user, location, deviceInfo)
            }
            className='bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-2 text-white hover:bg-emerald-600 transition-colors shadow-xl'
            title='Wishlist'
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "transparent"} className={isWishlisted ? "text-red-500" : ""} />
          </button>

          <button
            onClick={() => setOpen(!open)}
            className='bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-2 text-white hover:bg-emerald-600 transition-colors shadow-xl'
            title='Quick view'
          >
            <Eye size={18} />
          </button>

          <button
            onClick={() => !isInCart && addToCart({ ...product, quantity: 1 }, user, location, deviceInfo)}
            disabled={isInCart}
            className={`backdrop-blur-md border border-white/10 rounded-full p-2 transition-colors shadow-xl ${
              isInCart
                ? 'bg-emerald-700/60 text-emerald-400 cursor-not-allowed'
                : 'bg-black/60 text-white hover:bg-emerald-600'
            }`}
            title={isInCart ? 'Already in cart' : 'Add to cart'}
          >
            <ShoppingBag size={18} />
          </button>
        </div>

        {/* Image — slug unchanged, no shop relation so slug-only link */}
        <Link
          href={`/product/${product?.slug || ''}`}
          className='block relative aspect-square overflow-hidden bg-[#121214]'
        >
          <Image
            src={product?.images?.[0]?.url || ""}
          
            alt={product?.name || "Product image"}
            fill
            className='object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100'
          />
        </Link>

        {/* Content */}
        <div className='p-4 space-y-2'>

          <p className='text-emerald-500 text-[11px] uppercase font-bold tracking-widest'>
            {product?.category?.title ?? "Uncategorized"}
          </p>

          <Link href={`/product/${product?.slug || ''}`}>
            <h3 className='text-sm font-medium text-gray-100 line-clamp-1 group-hover:text-emerald-400 transition-colors'>
             
              {product?.name}
            </h3>
          </Link>
          <div className='flex items-center gap-1 opacity-80 scale-90 origin-left'>
            <Ratings
  rating={
    product?.reviews?.length
      ? product.reviews.reduce((sum: number, r: any) => sum + (r.rating ?? 0), 0) / product.reviews.length
      : 0
  }
/>
          </div>

          <div className='flex justify-between items-end pt-2 border-t border-white/5'>
            <div className='flex flex-col'>
              <span className='text-xs text-gray-500 line-through'>${product?.price?.toFixed(2)}</span>
              <span className='text-lg font-bold text-white'>${product?.salePrice?.toFixed(2)}</span>
            </div>

            <button
              onClick={() => !isInCart && addToCart({ ...product, quantity: 1 }, user, location, deviceInfo)}
              disabled={isInCart}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                isInCart
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 shadow-lg shadow-emerald-900/20'
              }`}
            >
              <ShoppingBag size={14} />
              {isInCart ? 'In Cart' : 'Add'}
            </button>
          </div>
          {product?.variants?.length > 0 && (
            <button
              onClick={() => setOptionsOpen(true)}
              className='w-full mt-1 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/20 transition-colors'
            >
              Select option
            </button>
          )}

          {isEvent && timeLeft && (
            <div className='mt-2 flex items-center gap-2 py-1.5 px-2 bg-emerald-500/10 rounded-md border border-emerald-500/20'>
              <Clock size={12} className='text-emerald-500 animate-pulse' />
              <span className='text-[10px] font-mono text-emerald-400 uppercase tracking-tighter'>
                {timeLeft} remaining
              </span>
            </div>
          )}

          {/* Proceed to Checkout Button */}
          <button 
          onClick={() => router.push("/cart")}
          className='w-full mt-2 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-lg shadow-yellow-900/20 active:scale-[0.98]'>
            Proceed to checkout
          </button>
        </div>

        {open && <ProductDetailsCard data={product} setOpen={setOpen} />}
      </div>

      {optionsOpen && (
        <OptionsModal
          product={product}
          options={productOptions}
          onClose={() => setOptionsOpen(false)}
          onConfirm={handleOptionConfirm}
        />
      )}
    </>
  );
};

export default ProductCard;