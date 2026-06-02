"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, ShoppingBag, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { Session } from "next-auth";
import Logo from "../global/Logo";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { sidebarLinks } from "@/config/sidebar2";
import { usePermission } from "@/hooks/usePermissions";
import { UserDropdownMenu } from "../UserDropdownMenu";
import { fetchUser } from "@/actions/profile";
import {
  ShoppingCart,
  Heart,
  Star,
  Package,
  User,
  HeadphonesIcon,
} from "lucide-react";
import { ISidebarLink } from "@/config/sidebar2";

const buyerSidebarLinks: ISidebarLink[] = [
  { title: "My Orders", href: "/dashboard/orders/buyer", icon: Package, permission: "orders.read", dropdown: false },
  { title: "Wishlist", href: "/wishlist", icon: Heart, permission: "wishlist.read", dropdown: false },
  { title: "Cart", href: "/cart", icon: ShoppingCart, permission: "cart.read", dropdown: false },
  { title: "Checkout", href: "/cart", icon: ShoppingBag, permission: "checkout.read", dropdown: false },
  { title: "My Reviews", href: "/dashboard/reviews", icon: Star, permission: "reviews.read", dropdown: false },
  { title: "Support", href: "/contact", icon: HeadphonesIcon, permission: "support.read", dropdown: false },
  { title: "Profile", href: "/dashboard/profile", icon: User, permission: "profile.read", dropdown: false },
  { title: "Browse Store", href: "/", icon: LayoutGrid, permission: "categories.read", dropdown: false },
];

function detectBuyer(user: Session["user"]): boolean {
  if (Array.isArray((user as any).roles)) {
    return (user as any).roles.some(
      (r: { roleName: string }) => r.roleName === "buyer"
    );
  }
  return (user as any).permissions?.includes("cart.read") ?? false;
}

type User = {
  name: string;
  email: string;
  image: string | null;
};

export default function Navbar({ session }: { session: Session }) {
  const router = useRouter();
  const pathname = usePathname();
  const { hasPermission } = usePermission(session);
  const [userData, setUserData] = useState<User | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false); // CHANGE 1: added sheet state

  const userId = session?.user?.id;
  const isBuyer = detectBuyer(session.user);

  useEffect(() => {
    async function loadUserData() {
      try {
        const data = await fetchUser(userId);
        setUserData(data.user ?? null);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    }
    loadUserData();
  }, [userId]);

  // CHANGE 2: close sheet on route change (handles back/forward too)
  useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  const adminMobileLinks = sidebarLinks
    .filter((link) => {
      if (!hasPermission(link.permission)) return false;
      if (link.dropdown && link.dropdownMenu) {
        return link.dropdownMenu.some((item) => hasPermission(item.permission));
      }
      return true;
    })
    .reduce(
      (acc, link) => {
        if (!link.dropdown) {
          acc.push({ title: link.title, href: link.href || "#", icon: link.icon });
          return acc;
        }
        link.dropdownMenu?.forEach((item) => {
          if (hasPermission(item.permission)) {
            acc.push({ title: item.title, href: item.href, icon: link.icon });
          }
        });
        return acc;
      },
      [] as Array<{ title: string; href: string; icon: any }>
    );

  const buyerMobileLinks = buyerSidebarLinks.map((l) => ({
    title: l.title,
    href: l.href ?? "#",
    icon: l.icon,
  }));

  const mobileLinks = isBuyer ? buyerMobileLinks : adminMobileLinks;

  async function handleLogout() {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-muted/60 px-4 lg:h-[60px] lg:px-6">
      <ModeToggle />
      {/* CHANGE 3: bind open state to Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className={cn(
            "flex flex-col",
            isBuyer && "bg-blue-50 dark:bg-blue-950/30"
          )}
        >
          <nav className="grid gap-2 text-lg font-medium">
            <Logo href="/dashboard" />

            <div
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold flex items-center gap-2 mb-1",
                isBuyer
                  ? "bg-blue-500/15 border border-blue-300/40 text-blue-600 dark:text-blue-400"
                  : "bg-primary/10 border border-primary/20 text-primary"
              )}
            >
              {isBuyer ? (
                <><ShoppingBag className="h-3 w-3" /> Buyer Portal</>
              ) : (
                <><LayoutGrid className="h-3 w-3" /> Admin Portal</>
              )}
            </div>

            {mobileLinks.map((item, i) => {
              const Icon = item.icon;
              const isActive = item.href === pathname;
              return (
                <Link
                  key={i}
                  href={item.href}
                  onClick={() => setSheetOpen(false)} // CHANGE 3 (cont): close on click
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all",
                    isBuyer && isActive &&
                      "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
                    isBuyer && !isActive &&
                      "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400",
                    !isBuyer && isActive && "bg-muted text-primary",
                    !isBuyer && !isActive && "hover:text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto">
            <Button
              onClick={handleLogout}
              size="sm"
              className={cn(
                "w-full",
                isBuyer && "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1" />
      <div className="p-4">
        <UserDropdownMenu
          username={session?.user?.name ?? ""}
          email={session?.user?.email ?? ""}
          avatarUrl={
            userData?.image ??
            session?.user?.image ??
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20(54)-NX3G1KANQ2p4Gupgnvn94OQKsGYzyU.png"
          }
        />
      </div>
    </header>
  );
}