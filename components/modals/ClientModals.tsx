"use client";

import dynamic from "next/dynamic";

const AuthRequiredModal = dynamic(
  () => import("@/components/AuthrequiredModal"),
  { ssr: false }
);

const SubscriptionModal = dynamic(
  () => import("@/components/subscription-modal"),
  { ssr: false }
);

const AgeGateModal = dynamic(
  () => import("@/components/AgeGateModal"),
  { ssr: false }
);

export default function ClientModals({
  isSubscribed,
}: {
  isSubscribed: boolean;
}) {
  return (
    <>
      <AgeGateModal />
      <AuthRequiredModal />
      <SubscriptionModal isSubscribed={isSubscribed} />
    </>
  );
}