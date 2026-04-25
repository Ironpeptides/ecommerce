import { ArrowUpRight, MapPin, Star, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

interface ShopCardProps {
    shop: {
        id: string;
        name: string;
        description?:string;
        avatar: string; // Keep interface definition
        coverBanner?:string;
        address?:string;
        followers?: [];
        logo?:string;
        rating?:number;
        category?:string;
    }
};

const ShopCard: React.FC<ShopCardProps> = ({shop}) => {
    // For now using banner as avatar per request, but defining here for readability
    const shopLogo = shop?.logo || "https://ik.imagekit.io/NevilyVilyo/products/laptop-jumia.jpg";
    const shopCover = shop?.logo || "https://ik.imagekit.io/NevilyVilyo/products/laptop-jumia.jpg";

  return (
    <div className='group w-full rounded-2xl cursor-pointer bg-[#0f0f12] border border-white/5 overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]'>
        {/* Cover - Subtle grayscale filter on hover */}
        <div className='h-[110px] w-full relative overflow-hidden'>
             <Image
             src={shopCover}
             alt='Shop Cover Banner'
             fill
             className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-105'
             />
             {/* Subtle vignette overlay on banner */}
             <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f12] to-black/30" />
        </div>

        {/* Avatar Section - Revised border styling */}
        <div className='relative flex justify-center -mt-9 z-10'>
            <div className='w-18 h-18 rounded-full border-2 border-emerald-500/20 overflow-hidden shadow-2xl bg-[#0a0a0b] p-1'>
                <div className="w-full h-full rounded-full overflow-hidden relative border border-white/5">
                    <Image
                    src={shopLogo}
                    alt={`${shop.name} Logo`}
                    width={72}
                    height={72}
                    className='object-cover aspect-square transition-transform group-hover:scale-110'
                    />
                </div>
            </div>
        </div>

        {/* Shop Info - Clean layout, professional colors */}
        <div className='px-5 pb-5 pt-3 text-center'>
            <div className='flex items-center justify-center gap-2'>
                {/* Visual indicator for verified labs (Optional UX boost) */}
                <Sparkles size={14} className='text-emerald-500 opacity-60' />
                <h3 className='text-base font-semibold text-white group-hover:text-emerald-400 transition-colors'>
                    {shop?.name}
                </h3>
            </div>
            
            <p className='text-xs text-gray-500 mt-0.5 tracking-tight font-mono'>
                Batch Verification: {shop?.followers?.length ?? 0 } Protocols
            </p>

            {/* Address + Rating - Minimalist icon/color treatment */}
            <div className='flex items-center justify-center text-[11px] text-gray-400 mt-3 gap-3 flex-wrap border-t border-white/5 pt-3'>
                {shop.address && (
                    <span className='flex items-center gap-1.5 max-w-[140px]'>
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                        <span className="truncate">{shop.address}</span>
                    </span>
                )}

                <span className='flex items-center gap-1 font-semibold text-yellow-400'>
                    <Star className='w-4 h-4 text-yellow-500 fill-yellow-500'/>
                    {shop.rating ? shop.rating.toFixed(1) : "N/A"}
                </span>
            </div>

            {/* Category - Refined tag design */}
            {shop?.category && (
                <div className='mt-4 flex flex-wrap justify-center gap-2 text-[10px] tracking-wider uppercase font-bold'>
                    <span className='bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full backdrop-blur-sm'>
                        {shop.category} Facility
                    </span>
                </div>
            )}

            {/* Visit Button - Flat design with icon rotation */}
            <div className='mt-5 pt-3 border-t border-white/5'>
                <Link
                //href={`/shop/${shop.id}`}
                href={`/`}
                className='inline-flex items-center gap-1.5 text-xs text-white font-bold tracking-tight bg-white/5 hover:bg-emerald-600 px-5 py-2.5 rounded-full transition-all active:scale-95'
                >
                    Access Laboratory Data
                <ArrowUpRight className='w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
                </Link>
            </div>
        </div>
    </div>
  )
}

export default ShopCard