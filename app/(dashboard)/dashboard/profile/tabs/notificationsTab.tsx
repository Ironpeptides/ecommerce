"use client";

import { useState } from "react";
import { Loader2, Mail, Bell } from "lucide-react";
import toast from "react-hot-toast";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { updateNotificationPreferences } from "@/actions/profile";

type Prefs = {
  emailMarketing: boolean;
  emailOrderUpdates: boolean;
  emailSecurity: boolean;
  emailNewsletter: boolean;
  inAppOrders: boolean;
  inAppMessages: boolean;
  inAppPromotions: boolean;
};

const DEFAULTS: Prefs = {
  emailMarketing: true,
  emailOrderUpdates: true,
  emailSecurity: true,
  emailNewsletter: false,
  inAppOrders: true,
  inAppMessages: true,
  inAppPromotions: false,
};

export function NotificationsTab({ userId, prefs }: { userId: string; prefs: any }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Prefs>({ ...DEFAULTS, ...prefs });

  const toggle = (key: keyof Prefs) =>
    setForm((p) => ({ ...p, [key]: !p[key] }));

  const save = async () => {
    setLoading(true);
    const res = await updateNotificationPreferences(userId, form);
    if (res.success) toast.success("Preferences saved");
    else toast.error(res.error ?? "Failed to save");
    setLoading(false);
  };

  const EMAIL_SETTINGS: { key: keyof Prefs; label: string; description: string }[] = [
    { key: "emailOrderUpdates", label: "Order Updates",  description: "Confirmations, shipping, and delivery notifications" },
    { key: "emailSecurity",     label: "Security Alerts", description: "Sign-ins, password changes, and suspicious activity" },
    { key: "emailMarketing",    label: "Marketing",       description: "Product announcements and special offers" },
    { key: "emailNewsletter",   label: "Newsletter",      description: "Weekly digest and industry insights" },
  ];

  const INAPP_SETTINGS: { key: keyof Prefs; label: string; description: string }[] = [
    { key: "inAppOrders",      label: "Order Notifications", description: "Real-time updates on your orders" },
    { key: "inAppMessages",    label: "Messages",            description: "Direct messages and support replies" },
    { key: "inAppPromotions",  label: "Promotions",          description: "Flash sales and limited-time deals" },
  ];

  const ToggleRow = ({ item }: { item: typeof EMAIL_SETTINGS[0] }) => (
    <div className="flex items-center justify-between py-4">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{item.label}</p>
        <p className="text-xs text-muted-foreground">{item.description}</p>
      </div>
      <Switch checked={form[item.key]} onCheckedChange={() => toggle(item.key)} />
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Email */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Email Notifications</h3>
        </div>
        <div className="rounded-xl border divide-y">
          {EMAIL_SETTINGS.map((item) => (
            <div key={item.key} className="px-5">
              <ToggleRow item={item} />
            </div>
          ))}
        </div>
      </div>

      {/* In-app */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">In-App Notifications</h3>
        </div>
        <div className="rounded-xl border divide-y">
          {INAPP_SETTINGS.map((item) => (
            <div key={item.key} className="px-5">
              <ToggleRow item={item} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={loading} className="gap-2 min-w-[120px]">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}