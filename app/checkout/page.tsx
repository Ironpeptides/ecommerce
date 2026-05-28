"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import CheckoutContent from "./checkoutContent";
import useUser from "../../hooks/useUser";
import { useRouter } from "next/navigation";
import MoonpayWarningModal from "@/components/MoonpayWarningModal";

export default function CheckoutPage() {
  const { user } = useUser();
  const router = useRouter();

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <>
      {/* The modal is independent – shown only if not dismissed */}
      <MoonpayWarningModal />

      <Suspense
        fallback={
          <div className="flex flex-col justify-center items-center min-h-[70vh] gap-4">
            <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
            <p className="text-gray-400 text-sm">Loading checkout...</p>
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </>
  );
}