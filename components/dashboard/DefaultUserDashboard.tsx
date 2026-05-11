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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserRole {
  id: string;
  displayName: string;
  roleName: string;
  description: string | null;  // Allow null values
  orgId: string | null;
  permissions: string[];
  createdAt: Date | string;     // Allow both Date and string
  updatedAt: Date | string;     // Allow both Date and string
}

export interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  /** Full roles array from API */
  roles: UserRole[];
  /** Flattened permissions array */
  permissions: string[];
  /** Legacy single-role field — may be undefined in new data shape */
  role?: string;
  orgId: string;
  orgName: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// ─── Internal types ───────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
  /** Permissions required (ANY match = visible). Empty = visible to all. */
  permissions: string[];
  /** Role names that can see this item. Empty = visible to all. */
  roles: string[];
}

interface QuickAction {
  label: string;
  href: string;
  icon: React.ElementType;
  permissions: string[];
  roles: string[];
}

interface StatCard {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ElementType;
  permissions: string[];
  roles: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

// Navigation items - using only simple styles without gradients/blues
const NAV_ITEMS: NavItem[] = [
  {
    label: "Products",
    href: "/dashboard/products",
    icon: Box,
    description: "Browse the product catalogue",
    permissions: ["products.read"],
    roles: [],
  },
  {
    label: "Categories",
    href: "/dashboard/products?tab=categories",
    icon: FolderOpen,
    description: "Explore product categories",
    permissions: ["categories.read"],
    roles: [],
  },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    description: "Track and manage your orders",
    badge: "Active",
    permissions: ["orders.read"],
    roles: [],
  },
  {
    label: "Wishlist",
    href: "/wishlist",
    icon: Heart,
    description: "Your saved items",
    permissions: ["wishlist.read"],
    roles: [],
  },
  {
    label: "Reviews",
    href: "/reviews",
    icon: Star,
    description: "Manage your product reviews",
    permissions: ["reviews.read"],
    roles: [],
  },
  {
    label: "Support",
    href: "/support",
    icon: HeadphonesIcon,
    description: "Get help when you need it",
    permissions: ["support.read"],
    roles: [],
  },
  // Staff / manager / admin only
  {
    label: "Inventory",
    href: "/dashboard/inventory",
    icon: Package,
    description: "Monitor stock levels",
    permissions: [],
    roles: ["admin", "manager"],
  },
  {
    label: "Customers",
    href: "/dashboard/sales?tab=customers",
    icon: Users,
    description: "View and manage customers",
    permissions: ["customers.read"],
    roles: ["admin", "manager"],
  },
  {
    label: "Suppliers",
    href: "/dashboard/suppliers",
    icon: Truck,
    description: "Manage supplier relationships",
    permissions: [],
    roles: ["admin", "manager"],
  },
  {
    label: "Promotions",
    href: "/dashboard/promotions",
    icon: Tag,
    description: "Create discounts and offers",
    permissions: [],
    roles: ["admin", "manager"],
  },
  {
    label: "Sales",
    href: "/dashboard/sales",
    icon: ShoppingBag,
    description: "Browse sale transactions",
    permissions: ["sales.read"],
    roles: ["admin", "manager", "staff"],
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: BarChart2,
    description: "Analyse performance data",
    permissions: ["reports.read"],
    roles: ["admin", "manager"],
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: User,
    description: "Manage system users & roles",
    permissions: ["users.read"],
    roles: ["admin"],
  },
  {
    label: "Settings",
    href: "/dashboard/profile",
    icon: Settings,
    description: "Configure system settings",
    permissions: ["settings.read"],
    roles: ["admin"],
  },
];

// Quick actions - user specific based on permissions
const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "New Order",
    href: "/orders/new",
    icon: ShoppingCart,
    permissions: ["orders.create"],
    roles: [],
  },
  {
    label: "Add to Wishlist",
    href: "/wishlist",
    icon: Heart,
    permissions: ["wishlist.create"],
    roles: [],
  },
  {
    label: "Write Review",
    href: "/reviews/new",
    icon: Star,
    permissions: ["reviews.create"],
    roles: [],
  },
  {
    label: "Contact Support",
    href: "/support/new",
    icon: HeadphonesIcon,
    permissions: ["support.create"],
    roles: [],
  },
  // Staff+ only
  {
    label: "New Product",
    href: "/products/new",
    icon: Box,
    permissions: ["products.create"],
    roles: ["admin", "manager", "staff"],
  },
  {
    label: "New Customer",
    href: "/customers/new",
    icon: Users,
    permissions: ["customers.create"],
    roles: ["admin", "manager"],
  },
  {
    label: "New Promotion",
    href: "/promotions/new",
    icon: Tag,
    permissions: [],
    roles: ["admin", "manager"],
  },
];

// Base stat cards that will be filtered by permissions
const BASE_STAT_CARDS: StatCard[] = [
  {
    label: "Total Orders",
    value: "24",
    trend: "+12% this month",
    trendUp: true,
    icon: ShoppingCart,
    permissions: ["orders.read"],
    roles: [],
  },
  {
    label: "Wishlist Items",
    value: "8",
    icon: Heart,
    permissions: ["wishlist.read"],
    roles: [],
  },
  {
    label: "Reviews Given",
    value: "5",
    icon: Star,
    permissions: ["reviews.read"],
    roles: [],
  },
  {
    label: "Support Tickets",
    value: "2",
    icon: HeadphonesIcon,
    permissions: ["support.read"],
    roles: [],
  },
];

// Additional stats for admin/manager users
const ADMIN_STATS: StatCard[] = [
  {
    label: "Total Revenue",
    value: "$12,450",
    trend: "+8% vs last month",
    trendUp: true,
    icon: DollarSign,
    permissions: ["sales.read"],
    roles: ["admin", "manager"],
  },
  {
    label: "Active Products",
    value: "342",
    icon: Layers,
    permissions: ["products.read"],
    roles: ["admin", "manager", "staff"],
  },
  {
    label: "Total Customers",
    value: "1,284",
    trend: "+5%",
    trendUp: true,
    icon: Users,
    permissions: ["customers.read"],
    roles: ["admin", "manager"],
  },
  {
    label: "Conversion Rate",
    value: "3.2%",
    trend: "+0.5%",
    trendUp: true,
    icon: Activity,
    permissions: ["reports.read"],
    roles: ["admin", "manager"],
  },
];

// Role configuration with simple badge styles (no blue)
const ROLE_CONFIG: Record<string, { label: string; badgeClass: string; description: string; icon: React.ElementType }> = {
  admin: {
    label: "Administrator",
    description: "Full system access",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
    icon: ShieldCheck,
  },
  manager: {
    label: "Manager",
    description: "Management access",
    badgeClass: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
    icon: TrendingUp,
  },
  staff: {
    label: "Staff",
    description: "Staff access",
    badgeClass: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    icon: Users,
  },
  buyer: {
    label: "Buyer",
    description: "Customer access",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
    icon: ShoppingBag,
  },
  user: {
    label: "User",
    description: "Basic access",
    badgeClass: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    icon: User,
  },
};

const DEFAULT_ROLE_CONFIG = ROLE_CONFIG["user"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

/** Derive a flat set of role names from the roles array */
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

function isVisible(
  itemRoles: string[],
  itemPermissions: string[],
  userRoles: string[],
  userPermissions: Set<string>
): boolean {
  if (itemRoles.length === 0 && itemPermissions.length === 0) return true;
  if (itemRoles.length > 0 && itemRoles.some((r) => userRoles.includes(r))) return true;
  if (itemPermissions.length > 0 && itemPermissions.some((p) => userPermissions.has(p))) return true;
  return false;
}

// Get user-specific analytics data based on permissions
function getUserAnalytics(userPermissions: Set<string>, userRoles: string[]): { totalSpent?: string; frequentCategory?: string; memberSince?: string } {
  const analytics: { totalSpent?: string; frequentCategory?: string; memberSince?: string } = {};
  
  if (userPermissions.has("sales.read") || userRoles.includes("admin") || userRoles.includes("manager")) {
    analytics.totalSpent = "$1,247";
    analytics.frequentCategory = "Electronics";
  }
  
  analytics.memberSince = "Jan 2025";
  return analytics;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function WelcomeHero({ user }: { user: AuthenticatedUser }) {
  const firstName = getFirstName(user);
  const displayName = getDisplayName(user);
  const initials = getInitials(user);
  const roleNames = getUserRoleNames(user);
  const userPermissionsSet = getUserPermissions(user);
  const analytics = getUserAnalytics(userPermissionsSet, roleNames);

  const roleConfigs = roleNames.map((r) => ROLE_CONFIG[r] ?? { ...DEFAULT_ROLE_CONFIG, label: r });

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-gray-200 dark:ring-gray-800">
              <AvatarImage src={user.image ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xl font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-medium tracking-wide">
                {getGreeting()}
              </p>
              <h1 className="text-gray-900 dark:text-white text-2xl sm:text-3xl font-semibold tracking-tight">
                {firstName} 👋
              </h1>
              {user.orgName && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{user.orgName}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {roleConfigs.map((rc, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${rc.badgeClass}`}
              >
                <rc.icon className="h-3 w-3" />
                {rc.label}
              </span>
            ))}
          </div>
        </div>

        {/* User-specific analytics - only shows data user has permission to see */}
        {(analytics.totalSpent || analytics.frequentCategory || analytics.memberSince) && (
          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
            {analytics.memberSince && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                Member since {analytics.memberSince}
              </span>
            )}
            {analytics.totalSpent && (
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                Total spent: {analytics.totalSpent}
              </span>
            )}
            {analytics.frequentCategory && (
              <span className="flex items-center gap-1.5">
                <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Favorite: {analytics.frequentCategory}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCards({ cards }: { cards: StatCard[] }) {
  if (cards.length === 0) return null;
  
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Overview
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{card.label}</span>
              <div className="text-gray-400 dark:text-gray-500">
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">{card.value}</p>
              {card.trend && (
                <p className={`text-xs mt-0.5 ${card.trendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {card.trend}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface DashboardMainProps {
  user: AuthenticatedUser;
}

export default function DashboardMain({ user }: DashboardMainProps) {
  const router = useRouter();

  const userRoles = useMemo(() => getUserRoleNames(user), [user]);
  const userPermissions = useMemo(() => getUserPermissions(user), [user]);

  // Filter all dynamic content based on user roles and permissions
  const visibleNavItems = useMemo(
    () => NAV_ITEMS.filter((item) => isVisible(item.roles, item.permissions, userRoles, userPermissions)),
    [userRoles, userPermissions]
  );

  const visibleQuickActions = useMemo(
    () => QUICK_ACTIONS.filter((a) => isVisible(a.roles, a.permissions, userRoles, userPermissions)),
    [userRoles, userPermissions]
  );

  // Combine base stats with admin stats based on permissions
  const allStats = useMemo(() => {
    const baseVisible = BASE_STAT_CARDS.filter((c) => 
      isVisible(c.roles, c.permissions, userRoles, userPermissions)
    );
    const adminVisible = ADMIN_STATS.filter((c) => 
      isVisible(c.roles, c.permissions, userRoles, userPermissions)
    );
    return [...baseVisible, ...adminVisible];
  }, [userRoles, userPermissions]);

  // Get user-specific quick stats (e.g., pending orders count)
  const userSpecificData = useMemo(() => {
    const data: { pendingOrders?: number; wishlistCount?: number } = {};
    if (userPermissions.has("orders.read")) {
      data.pendingOrders = 3;
    }
    if (userPermissions.has("wishlist.read")) {
      data.wishlistCount = 8;
    }
    return data;
  }, [userPermissions]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">

        <WelcomeHero user={user} />

        {/* User-specific notification (dynamic) */}
        {userSpecificData.pendingOrders !== undefined && userSpecificData.pendingOrders > 0 && (
          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
            <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              You have {userSpecificData.pendingOrders} pending order{userSpecificData.pendingOrders !== 1 ? 's' : ''} that need attention.
            </p>
          </div>
        )}

        {visibleQuickActions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-2">
              {visibleQuickActions.map((action) => (
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

        {allStats.length > 0 && <StatCards cards={allStats} />}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Sections
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
              {visibleNavItems.length} available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {visibleNavItems.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="group text-left rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:border-gray-300 dark:hover:border-gray-700 transition-all hover:shadow-md active:shadow-sm overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-gray-600 dark:text-gray-400">
                      <item.icon className="h-5 w-5" />
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-medium rounded-full bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-0.5">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Go to {item.label}
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