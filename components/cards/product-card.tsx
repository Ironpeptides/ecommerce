"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import Ratings from '../ratings';
import { Eye, Heart, ShoppingBag, Clock } from 'lucide-react';
import ProductDetailsCard from './product-details.card';
import { useStore } from '../../store';
import useUser from '../../hooks/useUser';
import useLocationTracking from '../../hooks/useLocationTracking';
import useDeviceTracking from '../../hooks/useDeviceTracking';
import { createFetchSlug } from '../../utils/slugify';

const ProductCard = ({product, isEvent}:{product:any; isEvent?:boolean}) => {

  const [timeLeft, setTimeLeft] = useState("");
  const [open, setOpen] = useState(false);
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state:any)=> state.addToCart)
  const addToWishList = useStore((state:any)=> state.addToWishList)
  const removeFromWishList = useStore((state:any)=>state.removeFromWishList);
  const wishlist = useStore((state:any)=>state.wishlist);
  const isWishlisted = wishlist.some((item:any)=> item.id === product.id);
  const cart = useStore((state:any)=>state.cart);
  const isInCart = cart.some((item:any)=>item.id === product.id);
  const {user} = useUser()
 
  useEffect(()=>{
    if(isEvent && product?.ending_date){
      const interval = setInterval(()=>{
        const endTime = new Date(product.ending_date).getTime();
        const now = Date.now();
        const diff = endTime - now;
       
        if(diff <= 0){
          setTimeLeft("Expired");
          clearInterval(interval);
          return;
        }

        const days = Math.floor(diff /(1000 * 60 * 60 * 24));
        const hours = Math.floor((diff/ (1000 * 60 * 60)%24));
        const minutes = Math.floor((diff /(1000 * 60)) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);

      }, 60000);
      const endTime = new Date(product.ending_date).getTime();
      const now = Date.now();
      const diff = endTime - now;

      if(diff <= 0){
        setTimeLeft("Expired");
      }else{
        const days = Math.floor(diff /(1000 * 60 * 60 * 24));
        const hours = Math.floor((diff/ (1000 * 60 * 60)%24));
        const minutes = Math.floor((diff /(1000 * 60)) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      }
      return () => clearInterval(interval)
    }
  }, [isEvent, product?.ending_date]);


  return (
    <div className='group w-full bg-white/5 border border-white/10 rounded-xl overflow-hidden relative transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]'>
        
        {/* Badges Container */}
        <div className='absolute top-3 left-3 z-20 flex flex-col gap-2'>
           {isEvent && (
            <div className='bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg'>
               Special Offer
            </div> 
           )}
           {product?.stock <= 5 && (
            <div className='bg-amber-500/10 border border-amber-500/50 text-amber-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-md'>
               Limited Stock
            </div>
           )}
        </div>

        {/* Action Icons - Redesigned for cleaner UX */}
        <div className='absolute z-20 flex flex-col gap-2 right-3 top-3 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300'>
          <button 
            onClick={()=> isWishlisted ? removeFromWishList(product.id, user, location, deviceInfo): addToWishList({...product,quantity:1}, user, location, deviceInfo)}
            className='bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-2 text-white hover:bg-emerald-600 transition-colors shadow-xl'
          >
            <Heart size={18} fill={ isWishlisted ? "currentColor" : "transparent"} className={isWishlisted ? "text-red-500" : ""} />
          </button>
          
          <button 
            onClick={()=>setOpen(!open)}
            className='bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-2 text-white hover:bg-emerald-600 transition-colors shadow-xl'
          >
            <Eye size={18} />
          </button>
        </div>

        {/* Image Section */}
        <Link 
          href={`/product/${createFetchSlug(product?.shop?.name || '', product?.slug || '')}`} 
          className='block relative aspect-square overflow-hidden bg-[#121214]'
        >
          <Image 
            src={product?.images[0]?.url || ""}
            alt={product?.title}
            fill
            className='object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100'
          />
        </Link>

        {/* Content Section */}
        <div className='p-4 space-y-2'>
          <Link
            href={`/shop/${product?.shop?.id}`}
            className='text-emerald-500 text-[11px] uppercase font-bold tracking-widest hover:text-emerald-400 transition-colors'
          >
            {product?.shop?.name}
          </Link>

          <Link href={`/product/${createFetchSlug(product?.shop?.name || '', product?.slug || '')}`}>
            <h3 className='text-sm font-medium text-gray-100 line-clamp-1 group-hover:text-emerald-400 transition-colors'>
              {product?.title}
            </h3>
          </Link>

          <div className='flex items-center gap-1 opacity-80 scale-90 origin-left'>
            <Ratings rating={product?.ratings} />
          </div>

          <div className='flex justify-between items-end pt-2 border-t border-white/5'>
            <div className='flex flex-col'>
              <span className='text-xs text-gray-500 line-through'>
                ${product?.regular_price}
              </span>
              <span className='text-lg font-bold text-white'>
                ${product?.sale_price}
              </span>
            </div>
            
            <button 
              onClick={()=>!isInCart && addToCart({...product, quantity: 1}, user, location, deviceInfo)}
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

          {isEvent && timeLeft && (
            <div className='mt-2 flex items-center gap-2 py-1.5 px-2 bg-emerald-500/10 rounded-md border border-emerald-500/20'>
              <Clock size={12} className='text-emerald-500 animate-pulse' />
              <span className='text-[10px] font-mono text-emerald-400 uppercase tracking-tighter'>
                {timeLeft} remaining
              </span>
            </div>
          )}
        </div>

        {open && (
          <ProductDetailsCard data={product} setOpen={setOpen}/>
        ) }
    </div>
  )
}

export default ProductCard