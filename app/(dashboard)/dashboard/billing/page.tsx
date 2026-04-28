import { getSubscription } from "@/actions/subscription";
import { getAuthenticatedUser } from "@/config/useAuth";
import { BillingClient } from "./billingClient";

export default async function BillingPage() {
  const [user, subscription] = await Promise.all([
    getAuthenticatedUser(),
    getSubscription(),
  ]);

  if (!user.email || !user.name) {
   return <div className="p-8">User email and name are required to manage billing.</div>;
  }


  return (
    <BillingClient
      user={{ id: user.id, name: user.name, email: user.email }}
      subscription={subscription}
    />
  );
}