"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, Bell, ShieldAlert } from "lucide-react";
import { ProfileTab } from "./tabs/profileTab";
import { BillingTab } from "./tabs/billingTab";
import { NotificationsTab } from "./tabs/notificationsTab";
import { AccountTab } from "./tabs/accountTab";

interface ProfileClientProps {
  user: any;
  subscription: any;
  notifPrefs: any;
}

const TABS = [
  { value: "profile",       label: "Profile",       icon: User },
  { value: "billing",       label: "Billing",       icon: CreditCard },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "account",       label: "Account",       icon: ShieldAlert },
];

export function ProfileClient({ user, subscription, notifPrefs }: ProfileClientProps) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "profile";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your account, billing, and preferences.
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="inline-flex h-auto w-full justify-start gap-2 rounded-none border-b bg-transparent p-0 flex-wrap">
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="inline-flex items-center gap-2 border-b-2 border-transparent px-5 pb-3 pt-2 text-sm data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground capitalize"
              >
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab user={user} />
          </TabsContent>

          <TabsContent value="billing">
            <BillingTab user={user} subscription={subscription} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab userId={user.id} prefs={notifPrefs} />
          </TabsContent>

          <TabsContent value="account">
            <AccountTab user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}