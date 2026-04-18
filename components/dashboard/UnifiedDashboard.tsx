// components/dashboard/UnifiedDashboard.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Box,
  ChevronRight,
  FolderOpen,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Truck,
  User,
  Users,
  BarChart2,
  Heart,
  Star,
  HeadphonesIcon,
  Bell,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Activity,
  Layers,
  Book,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { sidebarLinks, ISidebarLink } from "@/config/sidebar";

// Types matching your existing user structure
export interface UserRole {
  id: string;
  displayName: string;
  roleName: string;
  description: string | null;
  orgId: string | null;
  permissions: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: UserRole[];
  permissions: string[];
  role?: string;
  orgId: string;
  orgName: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface DashboardLink {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
  permission: string;
}

interface QuickAction {
  label: string;
  href: string;
  icon: React.ElementType;
  permission: string;
}

// Helper functions
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getInitials(user: AuthenticatedUser): string {
  const first = user.firstName?.[0] ?? "";
  const last = user.lastName?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

function getDisplayName(user: AuthenticatedUser): string {
  const full = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  if (full) return full;
  return user.name ?? user.email ?? "User";
}

function getFirstName(user: AuthenticatedUser): string {
  return user.firstName || (user.name ?? "").split(" ")[0] || "there";
}

function getUserRoleNames(user: AuthenticatedUser): string[] {
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return user.roles.map((r) => r.roleName.toLowerCase());
  }
  if (user.role) return [user.role.toLowerCase()];
  return [];
}

function getUserPermissions(user: AuthenticatedUser): Set<string> {
  return new Set(user.permissions ?? []);
}

function hasPermission(user: AuthenticatedUser, permission: string): boolean {
  return user.permissions?.includes(permission) ?? false;
}

// Convert sidebar links to dashboard-friendly format
function getDashboardLinksFromSidebar(user: AuthenticatedUser): DashboardLink[] {
  const userPermissions = getUserPermissions(user);
  const links: DashboardLink[] = [];
  
  const iconMap: Record<string, React.ElementType> = {
    Home: Box,
    ShoppingCart: ShoppingCart,
    Heart: Heart,
    Star: Star,
    HeadphonesIcon: HeadphonesIcon,
    User: User,
    Users: Users,
    BaggageClaim: Package,
    CircleDollarSign: DollarSign,
    Book: Book,
    Settings: Settings,
    BarChart4: BarChart2,
  };
  
  const descriptionMap: Record<string, string> = {
    "Dashboard": "View your overview and analytics",
    "My Orders": "Track and manage your orders",
    "My Wishlist": "Your saved items",
    "My Reviews": "Manage your product reviews",
    "Support Tickets": "Get help when you need it",
    "My Profile": "Update your personal information",
    "Users Management": "Manage system users",
    "Inventory": "Manage products and categories",
    "Sales": "View sales and customers",
    "Blogs": "Manage blog posts",
    "Settings": "Configure system settings",
    "Reports": "View analytics reports",
  };
  
  sidebarLinks.forEach(link => {
    if (hasPermission(user, link.permission)) {
      let icon = link.icon;
      // @ts-ignore - handle icon mapping
      const iconName = link.icon.name || link.icon.toString().split(' ')[1];
      
      links.push({
        label: link.title,
        href: link.href || "#",
        icon: link.icon,
        description: descriptionMap[link.title] || `Access ${link.title.toLowerCase()}`,
        badge: link.badge,
        permission: link.permission,
      });
    }
  });
  
  return links;
}

// Get quick actions based on user permissions
function getQuickActions(user: AuthenticatedUser): QuickAction[] {
  const actions: QuickAction[] = [];
  
  if (hasPermission(user, "orders.create")) {
    actions.push({
      label: "New Order",
      href: "/dashboard/orders/new",
      icon: ShoppingCart,
      permission: "orders.create",
    });
  }
  
  if (hasPermission(user, "wishlist.create")) {
    actions.push({
      label: "Add to Wishlist",
      href: "/dashboard/wishlist",
      icon: Heart,
      permission: "wishlist.create",
    });
  }
  
  if (hasPermission(user, "reviews.create")) {
    actions.push({
      label: "Write Review",
      href: "/dashboard/reviews/new",
      icon: Star,
      permission: "reviews.create",
    });
  }
  
  if (hasPermission(user, "support.create")) {
    actions.push({
      label: "Contact Support",
      href: "/dashboard/support/new",
      icon: HeadphonesIcon,
      permission: "support.create",
    });
  }
  
  if (hasPermission(user, "products.create")) {
    actions.push({
      label: "New Product",
      href: "/dashboard/inventory/products/new",
      icon: Box,
      permission: "products.create",
    });
  }
  
  if (hasPermission(user, "customers.create")) {
    actions.push({
      label: "New Customer",
      href: "/dashboard/sales/customers/new",
      icon: Users,
      permission: "customers.create",
    });
  }
  
  return actions;
}

// Get stats based on user permissions
function getUserStats(user: AuthenticatedUser) {
  const stats = [];
  const permissions = getUserPermissions(user);
  
  if (permissions.has("orders.read")) {
    stats.push({
      label: "Total Orders",
      value: "24",
      trend: "+12% this month",
      trendUp: true,
      icon: ShoppingCart,
    });
  }
  
  if (permissions.has("wishlist.read")) {
    stats.push({
      label: "Wishlist Items",
      value: "8",
      icon: Heart,
    });
  }
  
  if (permissions.has("reviews.read")) {
    stats.push({
      label: "Reviews Given",
      value: "5",
      icon: Star,
    });
  }
  
  if (permissions.has("support.read")) {
    stats.push({
      label: "Support Tickets",
      value: "2",
      icon: HeadphonesIcon,
    });
  }
  
  if (permissions.has("sales.read")) {
    stats.push({
      label: "Total Revenue",
      value: "$12,450",
      trend: "+8% vs last month",
      trendUp: true,
      icon: DollarSign,
    });
  }
  
  if (permissions.has("products.read")) {
    stats.push({
      label: "Active Products",
      value: "342",
      icon: Layers,
    });
  }
  
  if (permissions.has("customers.read")) {
    stats.push({
      label: "Total Customers",
      value: "1,284",
      trend: "+5%",
      trendUp: true,
      icon: Users,
    });
  }
  
  return stats;
}

// Role configuration
const ROLE_CONFIG: Record<string, { label: string; badgeClass: string; icon: React.ElementType }> = {
  admin: {
    label: "Administrator",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
    icon: ShieldCheck,
  },
  manager: {
    label: "Manager",
    badgeClass: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
    icon: TrendingUp,
  },
  staff: {
    label: "Staff",
    badgeClass: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    icon: Users,
  },
  buyer: {
    label: "Buyer",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
    icon: ShoppingBag,
  },
};

function WelcomeHero({ user }: { user: AuthenticatedUser }) {
  const firstName = getFirstName(user);
  const displayName = getDisplayName(user);
  const initials = getInitials(user);
  const roleNames = getUserRoleNames(user);

  // ── Live clock state ──────────────────────────────────────────────────────
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Memoized Calculations ────────────────────────────────────────────────
  // We use useMemo so these only recalculate if 'user' or 'roleNames' change, 
  // NOT every second when 'now' updates.
  const userTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  
  const tzCity = useMemo(() => {
    return userTimezone.split("/").pop()?.replace(/_/g, " ") ?? userTimezone;
  }, [userTimezone]);

  const roleConfigs = useMemo(() => {
    return roleNames.map((r) => ROLE_CONFIG[r] ?? {
      label: r.charAt(0).toUpperCase() + r.slice(1),
      badgeClass: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
      icon: User,
    });
  }, [roleNames]);

  const memberSince = useMemo(() => {
    return user.roles[0]?.createdAt
      ? new Date(user.roles[0].createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : null;
  }, [user.roles]);

  // ── Formatted Time ────────────────────────────────────────────────────────
  // Updated to include seconds
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: userTimezone,
  }).format(now);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          {/* Left: User Profile Section */}
          <div className="flex items-center gap-5">
            <div className="relative">
               <Avatar className="h-16 w-16 ring-4 ring-gray-50 dark:ring-gray-900 shadow-sm">
                <AvatarImage src={user.image ?? undefined} alt={displayName} />
                <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-white dark:border-gray-950 h-4 w-4 rounded-full" />
            </div>

            <div className="space-y-0.5">
              <p className="text-emerald-600 dark:text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                {getGreeting()}
              </p>
              <h1 className="text-gray-900 dark:text-white text-2xl sm:text-3xl font-bold tracking-tight">
                {firstName}
              </h1>
              {user.orgName && (
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{user.orgName}</p>
              )}
            </div>
          </div>

          {/* Right column: roles + live clock */}
          <div className="flex flex-col items-start lg:items-end gap-4">
            {/* Role badges */}
            <div className="flex flex-wrap gap-2">
              {roleConfigs.map((rc, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors ${rc.badgeClass}`}
                >
                  <rc.icon className="h-3 w-3 opacity-70" />
                  {rc.label}
                </span>
              ))}
            </div>

            {/* Live clock: High-precision Professional Look */}
            <div className="group flex items-center gap-3 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-1.5 pr-4 transition-all hover:border-emerald-500/30">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums leading-none">
                  {formattedTime}
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-tighter">
                  Local Time • {tzCity}
                </span>
              </div>
            </div>
          </div>
        </div>

        {memberSince && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-900">
            <span className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <Clock className="h-3.5 w-3.5 opacity-60" />
              Platform member since <span className="text-gray-900 dark:text-gray-200 font-semibold">{memberSince}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
interface UnifiedDashboardProps {
  user: AuthenticatedUser;
}

export default function UnifiedDashboard({ user }: UnifiedDashboardProps) {
  const router = useRouter();
  const userPermissions = getUserPermissions(user);
  
  const dashboardLinks = useMemo(() => getDashboardLinksFromSidebar(user), [user]);
  const quickActions = useMemo(() => getQuickActions(user), [user]);
  const stats = useMemo(() => getUserStats(user), [user]);
  
  // Get pending orders count for buyer
  const pendingOrders = useMemo(() => {
  if (userPermissions.has("orders.read")) {
    // You could fetch this from an API or state
    return 3; // Replace with actual pending orders count from your data
  }
  return 0;
}, [userPermissions]);

  const wishlistCount = userPermissions.has("wishlist.read") ? 8 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <WelcomeHero user={user} />

        {/* User-specific notifications */}
        {pendingOrders > 0 && (
          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
            <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              You have {pendingOrders} pending order that need attention.
            </p>
          </div>
        )}

        {wishlistCount > 0 && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              You have {wishlistCount} items in your wishlist.
            </p>
          </div>
        )}

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.href}
                  onClick={() => router.push(action.href)}
                  className="group flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:border-gray-300 dark:hover:border-gray-700 hover:shadow"
                >
                  <action.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  {action.label}
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {stats.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Overview
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{stat.label}</span>
                    <div className="text-gray-400 dark:text-gray-500">
                      <stat.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">{stat.value}</p>
                    {stat.trend && (
                      <p className={`text-xs mt-0.5 ${stat.trendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {stat.trend}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Sections - Matches Sidebar exactly */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Quick Navigation
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
              {dashboardLinks.length} available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {dashboardLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className="group text-left rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:border-gray-300 dark:hover:border-gray-700 transition-all hover:shadow-md active:shadow-sm overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-gray-600 dark:text-gray-400">
                      <link.icon className="h-5 w-5" />
                    </div>
                    {link.badge && (
                      <span className="text-[10px] font-medium rounded-full bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-0.5">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{link.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{link.description}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Go to {link.label}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 pb-4 border-t border-gray-200 dark:border-gray-800 pt-6">
          {user.email ? `Signed in as ${user.email}` : `ID: ${user.id}`}
        </p>
      </main>
    </div>
  );
}