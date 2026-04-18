// config/sidebar.ts
import {
  BaggageClaim,
  BarChart2,
  BarChart4,
  Book,
  Cable,
  CircleDollarSign,
  FolderTree,
  Heart,
  Home,
  LucideIcon,
  Presentation,
  Settings,
  ShoppingCart,
  Star,
  HeadphonesIcon,
  Users,
  User,
} from "lucide-react";

export interface ISidebarLink {
  title: string;
  href?: string;
  icon: LucideIcon;
  dropdown: boolean;
  permission: string;
  dropdownMenu?: MenuItem[];
  badge?: string;
}

type MenuItem = {
  title: string;
  href: string;
  permission: string;
};

export const sidebarLinks: ISidebarLink[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    dropdown: false,
    permission: "dashboard.read",
  },
  // Buyer-specific sections
  {
    title: "My Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    dropdown: false,
    permission: "orders.read",
    badge: "Active",
  },
  {
    title: "My Wishlist",
    href: "/dashboard/wishlist",
    icon: Heart,
    dropdown: false,
    permission: "wishlist.read",
  },
  {
    title: "My Reviews",
    href: "/dashboard/reviews",
    icon: Star,
    dropdown: false,
    permission: "reviews.read",
  },
  {
    title: "Support Tickets",
    href: "/dashboard/support",
    icon: HeadphonesIcon,
    dropdown: false,
    permission: "support.read",
  },
  {
    title: "My Profile",
    href: "/dashboard/profile",
    icon: User,
    dropdown: false,
    permission: "profile.read",
  },
  // Admin/Staff sections
  {
    title: "Users Management",
    icon: Users,
    href: "/dashboard/users",
    dropdown: true,
    permission: "users.read",
    dropdownMenu: [
      {
        title: "All Users",
        href: "/dashboard/users",
        permission: "users.read",
      },
      {
        title: "Roles",
        href: "/dashboard/users/roles",
        permission: "roles.read",
      },
      {
        title: "Change Password",
        href: "/dashboard/change-password",
        permission: "profile.update",
      },
    ],
  },
  {
    title: "Inventory",
    icon: BaggageClaim,
    dropdown: true,
    href: "/dashboard/inventory/products",
    permission: "products.read",
    dropdownMenu: [
      {
        title: "Categories",
        href: "/dashboard/inventory/categories",
        permission: "categories.read",
      },
      {
        title: "Products",
        href: "/dashboard/inventory/products",
        permission: "products.read",
      },
      {
        title: "Stock Levels",
        href: "/dashboard/inventory/stock",
        permission: "products.read",
      },
    ],
  },
  {
    title: "Sales",
    icon: CircleDollarSign,
    dropdown: true,
    href: "/dashboard/sales",
    permission: "sales.read",
    dropdownMenu: [
      {
        title: "All Sales",
        href: "/dashboard/sales",
        permission: "sales.read",
      },
      {
        title: "Customers",
        href: "/dashboard/sales/customers",
        permission: "customers.read",
      },
      {
        title: "Transactions",
        href: "/dashboard/sales/transactions",
        permission: "sales.read",
      },
    ],
  },
  {
    title: "Blogs",
    icon: Book,
    dropdown: false,
    href: "/dashboard/blogs",
    permission: "blogs.read",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    dropdown: true,
    dropdownMenu: [
      {
        title: "General Settings",
        href: "/dashboard/settings/general",
        permission: "settings.read",
      },
      {
        title: "Feedback",
        href: "/dashboard/settings/feedback",
        permission: "settings.read",
      },
      {
        title: "Showcases",
        href: "/dashboard/settings/showcases",
        permission: "settings.read",
      },
      {
        title: "Changelogs",
        href: "/dashboard/settings/change-logs",
        permission: "settings.read",
      },
    ],
    permission: "settings.read",
  },
  {
    title: "Reports",
    icon: BarChart4,
    dropdown: true,
    href: "/dashboard/reports/products",
    permission: "reports.read",
    dropdownMenu: [
      {
        title: "Product Report",
        href: "/dashboard/reports/products",
        permission: "reports.read",
      },
      {
        title: "Inventory Report",
        href: "/dashboard/reports/inventory",
        permission: "reports.read",
      },
      {
        title: "Customers Report",
        href: "/dashboard/reports/customers",
        permission: "reports.read",
      },
      {
        title: "Sales Report",
        href: "/dashboard/reports/sales",
        permission: "reports.read",
      },
    ],
  },
];