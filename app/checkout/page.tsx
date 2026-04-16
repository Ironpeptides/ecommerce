// app/checkout/page.tsx (or wherever your checkout page is located)
import { Suspense } from 'react';

import { Loader2 } from "lucide-react";
import CheckoutContent from './checkoutContent';


export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[70vh] gap-4">
        <Loader2 className="animate-spin text-violet-500 w-12 h-12" />
        <p className="text-gray-400 text-sm">Loading checkout...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}