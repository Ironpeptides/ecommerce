"use client"


// app/checkout/page.tsx (or wherever your checkout page is located)
import { Suspense } from 'react';

import { Loader2 } from "lucide-react";
import CheckoutContent from './checkoutContent';
import useUser from '../../hooks/useUser';
import { useRouter } from 'next/navigation';


export default function CheckoutPage() {
  const { user } = useUser();
   const router = useRouter();
  if(!user){
      return router.push('/login');
        }
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[70vh] gap-4">
        <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
        <p className="text-gray-400 text-sm">Loading checkout...</p>
      </div>
    }>
      
      <CheckoutContent />
    </Suspense>
  );
}