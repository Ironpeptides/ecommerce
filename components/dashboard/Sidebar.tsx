"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Plus,
  ShoppingCart,
  Heart,
  Star,
  Package,
  User,
  HeadphonesIcon,
  ShoppingBag,
  LayoutGrid,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "../global/Logo";
import { ISidebarLink, sidebarLinks } from "@/config/sidebar2";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { NotificationMenu } from "../NotificationMenu";
import { UserDropdownMenu } from "../UserDropdownMenu";

const buyerSidebarLinks: ISidebarLink[] = [
  {
    title: "My Orders",
    href: "/dashboard/orders/buyer",
    icon: Package,
    permission: "orders.read",
    dropdown: false,
  },
  {
    title: "Wishlist",
    href: "/wishlist",
    icon: Heart,
    permission: "wishlist.read",
    dropdown: false,
  },
  {
    title: "Cart",
    href: "/cart",
    icon: ShoppingCart,
    permission: "cart.read",
    dropdown: false,
  },
  {
    title: "Checkout",
    href: "/cart",
    icon: ShoppingBag,
    permission: "checkout.read",
    dropdown: false,
  },
  {
    title: "My Reviews",
    href: "/dashboard/reviews",
    icon: Star,
    permission: "reviews.read",
    dropdown: false,
  },
  {
    title: "Support",
    href: "/contact",
    icon: HeadphonesIcon,
    permission: "support.read",
    dropdown: false,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
    permission: "profile.read",
    dropdown: false,
  },
  {
    title: "Browse Store",
    href: "/",
    icon: LayoutGrid,
    permission: "categories.read",
    dropdown: false,
  },
];

interface SidebarProps {
  session: Session;
  notifications?: Notification[];
}

function detectBuyer(user: Session["user"]): boolean {
  if (Array.isArray((user as any).roles)) {
    return (user as any).roles.some(
      (r: { roleName: string }) => r.roleName === "buyer"
    );
  }
  return (user as any).permissions?.includes("cart.read") ?? false;
}

export default function Sidebar({ session, notifications = [] }: SidebarProps) {
  const router = useRouter();
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const user = session.user;

  const isBuyer = detectBuyer(user);

  const hasPermission = (permission: string): boolean =>
    (user as any).permissions?.includes(permission) ?? false;

  const filterSidebarLinks = (links: ISidebarLink[]): ISidebarLink[] =>
    links
      .filter((link) => hasPermission(link.permission))
      .map((link) => ({
        ...link,
        dropdownMenu: link.dropdownMenu?.filter((item) =>
          hasPermission(item.permission)
        ),
      }))
      .filter(
        (link) =>
          !link.dropdown || (link.dropdownMenu && link.dropdownMenu.length > 0)
      );

  const activeLinks: ISidebarLink[] = isBuyer
    ? buyerSidebarLinks
    : filterSidebarLinks(sidebarLinks);

  async function handleLogout() {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 h-full w-[220px] lg:w-[280px] border-r hidden md:block overflow-y-auto",
        isBuyer ? "bg-blue-50 dark:bg-blue-950/30" : "bg-muted/40"
      )}
    >
      <div className="flex h-full max-h-screen flex-col gap-2">
        {/* ── Header ── */}
        <div
          className={cn(
            "flex flex-shrink-0 h-14 items-center border-b px-4 lg:h-[60px] lg:px-6",
            isBuyer
              ? "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800"
              : ""
          )}
        >
          <Logo href="/dashboard" />
          <NotificationMenu notifications={notifications} />
        </div>

        {/* ── Role badge ── */}
        {isBuyer ? (
          <div className="mx-4 mt-1 rounded-md bg-blue-500/15 border border-blue-300/40 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <ShoppingBag className="h-3 w-3" />
            Buyer Portal
          </div>
        ) : (
          <div className="mx-4 mt-1 rounded-md bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary flex items-center gap-2">
            <LayoutGrid className="h-3 w-3" />
            Admin Portal
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {/* Section label */}
            <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {isBuyer ? "My Account" : "Management"}
            </p>

            {activeLinks.map((item, i) => {
              const Icon = item.icon;
              const isHrefIncluded =
                item.dropdownMenu &&
                item.dropdownMenu.some((link) => link.href === pathname);
              const isOpen = openDropdownIndex === i;

              return (
                <div key={i}>
                  {item.dropdown ? (
                    // ── Collapsible dropdown (admin only) ──
                    <Collapsible open={isOpen}>
                      <CollapsibleTrigger
                        onClick={() => setOpenDropdownIndex(isOpen ? null : i)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/60 w-full",
                          isHrefIncluded && "bg-muted text-primary"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.title}
                        {isOpen ? (
                          <ChevronDown className="h-5 w-5 ml-auto flex shrink-0 items-center justify-center rounded-full" />
                        ) : (
                          <ChevronRight className="h-5 w-5 ml-auto flex shrink-0 items-center justify-center rounded-full" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="dark:bg-slate-950 rounded mt-1">
                        {item.dropdownMenu?.map((menuItem, j) => (
                          <Link
                            key={j}
                            href={menuItem.href}
                            className={cn(
                              "mx-4 flex items-center gap-3 rounded-lg px-3 py-1 text-muted-foreground transition-all hover:text-primary justify-between text-xs ml-6",
                              pathname === menuItem.href && "bg-muted text-primary"
                            )}
                          >
                            {menuItem.title}
                            <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                              <Plus className="w-4 h-4" />
                            </span>
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    // ── Flat link ──
                    <Link
                      href={item.href ?? "#"}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        // Buyer active style: blue tint
                        isBuyer && pathname === item.href &&
                          "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
                        // Admin active style: default muted
                        !isBuyer && pathname === item.href &&
                          "bg-muted text-primary",
                        // Buyer hover
                        isBuyer && "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  )}
                </div>
              );
            })}

            {/* ── Live website link (admin only) ── */}
            {!isBuyer && (
              <>
                <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Quick Links
                </p>
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  target="_blank"
                >
                  <ExternalLink className="h-4 w-4" />
                  Live Website
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* ── User menu ── */}
        <div
          className={cn(
            "p-4 border-t",
            isBuyer
              ? "border-blue-200 dark:border-blue-800"
              : "border-border"
          )}
        >
          <UserDropdownMenu
            username={session?.user?.name ?? ""}
            email={session?.user?.email ?? ""}
            avatarUrl={
              session?.user?.image ??
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20(54)-NX3G1KANQ2p4Gupgnvn94OQKsGYzyU.png"
            }
          />
        </div>
      </div>
    </div>
  );
}