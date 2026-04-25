"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  Search,
  ShoppingCart,
  FlaskConical,
  Dna,
  ShieldCheck,
  Microscope,
  Scale,
  FileWarning,
  Gavel,
  ShieldAlert,
  X,
  ReceiptText,
} from "lucide-react";
import Logo from "../global/Logo";
import { Session } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/generateInitials";
import { useStore } from "@/store";

const shopCategories = [
  { icon: Dna, title: "Peptides", description: "Analytical grade amino acid sequences.", href: "#suggested-products" },
  { icon: ReceiptText, title: "Refund & Return Policy", href: "/legal/refund-policy" },
];

const complianceLinks = [
  { icon: ShieldAlert, title: "Research Use Policy", href: "/legal/research-use-policy" },
  { icon: Gavel, title: "Terms of Service", href: "/legal/terms-of-service" },
  { icon: FileWarning, title: "Refund & Return Policy", href: "/legal/refund-policy" },
  { icon: Scale, title: "Shipping & Import", href: "/legal/shipping-policy" },
  
];

export default function SiteHeader({ session }: { session: Session | null }) {
  const [open, setOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const cart = useStore((state: any) => state.cart || []);

  return (
    <header className="sticky top-12 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-8">
          <Logo />
          
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className="h-9 px-4 py-2 text-sm font-bold text-gray-400 hover:text-blue-400 transition-colors uppercase tracking-tight">
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/about-us" legacyBehavior passHref>
                  <NavigationMenuLink className="h-9 px-4 py-2 text-sm font-bold text-gray-400 hover:text-blue-400 transition-colors uppercase tracking-tight">
                    About Us
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              {/* Shop Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-gray-400 font-bold hover:text-blue-400 uppercase tracking-tight">
                  Shop
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[500px] p-6 bg-black border border-white/10 rounded-xl shadow-2xl">
                    <div className="grid gap-4 grid-cols-2">
                      {shopCategories.map((item) => (
                        <Link key={item.title} href={item.href} className="group flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-blue-500/10">
                          <div className="p-2 rounded-md bg-blue-500/10 text-blue-500"><item.icon size={20} /></div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-blue-400">{item.title}</p>
                            <p className="text-[11px] text-gray-500 uppercase">{item.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Compliance Dropdown (New) */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-purple-400 font-bold hover:text-purple-300 uppercase tracking-tight">
                  Legal & Compliance
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[300px] p-2 bg-black border border-white/10 rounded-xl shadow-2xl">
                    {complianceLinks.map((link) => (
                      <Link key={link.title} href={link.href} className="flex items-center gap-3 p-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-purple-500/10 rounded-lg transition-all group">
                        <link.icon size={16} className="text-purple-500 group-hover:animate-pulse" />
                        <span className="uppercase tracking-tighter">{link.title}</span>
                      </Link>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className="h-9 px-4 py-2 text-sm font-bold text-gray-400 hover:text-blue-400 transition-colors uppercase tracking-tight">
                    Contact Us
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Actions... */}
          <div className="relative flex items-center">
            {isSearchOpen && (
              <input type="text" placeholder="Search CAS# / Compound..." className="absolute right-10 w-40 md:w-64 bg-[#111] border border-blue-500/30 rounded-md px-4 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" autoFocus />
            )}
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-400" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              {isSearchOpen ? <X size={20} /> : <Search size={20} />}
            </Button>
          </div>

          <Link href="/cart" className="relative p-2 text-gray-400 hover:text-blue-400 transition-colors">
            <ShoppingCart size={22} />
            {cart.length > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white italic">
                {cart.length}
              </span>
            )}
          </Link>

          {session ? (
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <Avatar className="h-8 w-8 border border-white/10 group-hover:border-blue-500"><AvatarImage src={session?.user?.image ?? ""} /><AvatarFallback className="bg-blue-900 text-blue-100">{getInitials(session?.user?.name)}</AvatarFallback></Avatar>
            </Link>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Button asChild variant="ghost" className="text-gray-400 hover:text-white">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold px-6 uppercase tracking-widest text-xs">
                <Link href="/register"> Register</Link>
              </Button>
            </div>
          )}

          {/* Mobile Sheet (Restructured for Compliance) */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden"><Button variant="ghost" size="icon" className="text-white"><Menu className="h-6 w-6" /></Button></SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-black border-r-white/10 p-0 text-white">
              <SheetHeader className="p-6 border-b border-white/10"><Logo /></SheetHeader>
              <nav className="flex flex-col p-4 gap-2 font-bold uppercase text-xs tracking-widest">
                <Link href="/" className="p-3 text-blue-400 bg-blue-500/5 rounded-lg">Home</Link>
                <div className="px-3 py-2 text-gray-600 mt-4">Catalog</div>
                {shopCategories.map((cat) => (
                  <Link key={cat.title} href={cat.href} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg"><cat.icon size={18} className="text-blue-500" />{cat.title}</Link>
                ))}
                <div className="px-3 py-2 text-purple-500 mt-4">Compliance</div>
                {complianceLinks.map((link) => (
                  <Link key={link.title} href={link.href} className="flex items-center gap-3 p-3 hover:bg-purple-500/5 rounded-lg border border-purple-500/10 text-purple-300"><link.icon size={18} />{link.title}</Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}