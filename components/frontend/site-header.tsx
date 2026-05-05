"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem,
  NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet, SheetContent, SheetHeader, SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu, Search, ShoppingCart, Dna, FileWarning,
  Gavel, ShieldAlert, Scale, X, ReceiptText, Loader2,
  Users, Mail, Phone, Building2, Info,
  MilestoneIcon,
} from "lucide-react";
import Logo from "../global/Logo";
import { Session } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/generateInitials";
import { useStore } from "@/store";
import { quickSearchProducts } from "@/actions/products";
import { CryptoBuyModal } from "@/components/frontend/cryptoBuyModal";
import { Bitcoin } from "lucide-react";

const shopCategories = [
  { icon: ShoppingCart, title: "Products", description: "All products we sell at Haelolabs", href: "/products" },
  { icon: Dna, title: "Peptides", description: "Analytical grade amino acid sequences.", href: "#suggested-products" },
  { icon: ReceiptText, title: "Refund & Return Policy", href: "/legal/refund-policy" },
];

const aboutLinks = [
  { icon: MilestoneIcon, title: "About Us", description: "Get in touch with our support team", href: "/about-us" },
  { icon: Mail, title: "Contact Us", description: "Get in touch with our support team", href: "/contact" },
  { icon: Phone, title: "Support", description: "Technical and customer support", href: "/contact" },
];

const complianceLinks = [
  { icon: ShieldAlert, title: "Research Use Policy",    href: "/legal/research-use-policy" },
  { icon: Gavel,       title: "Terms of Service",       href: "/legal/terms-of-service" },
  { icon: FileWarning, title: "Refund & Return Policy", href: "/legal/refund-policy" },
  { icon: Scale,       title: "Shipping & Import",      href: "/legal/shipping-policy" },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SiteHeader({ session }: { session: Session | null }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cart = useStore((state: any) => state.cart || []);
  const [cryptoModalOpen, setCryptoModalOpen] = React.useState(false);
  const debouncedQuery = useDebounce(query, 350);

  // Instant dropdown search
  React.useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults([]); setDropdownOpen(false); return;
    }
    setSearching(true);
    quickSearchProducts(debouncedQuery).then((data) => {
      setResults(data);
      setDropdownOpen(true);
      setSearching(false);
    });
  }, [debouncedQuery]);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus input when search opens
  React.useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setDropdownOpen(false);
    setSearchOpen(false);
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  const handleResultClick = (slug: string) => {
    setDropdownOpen(false);
    setSearchOpen(false);
    setQuery("");
    router.push(`/product/${slug}`);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-12 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      {cryptoModalOpen && (
       <CryptoBuyModal onClose={() => setCryptoModalOpen(false)} />
        )}
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left section - Logo and Navigation */}
        <div className="flex items-center gap-4 lg:gap-8">
          <Logo />
          
          {/* Desktop Navigation */}
          
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="gap-0">

              
              
              {/* Home */}
              <NavigationMenuItem>
                <Link href="/">
                  {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */
                  }
                  <NavigationMenuLink className="h-9 px-3 py-2 text-sm font-bold text-gray-400 hover:text-blue-400 transition-colors uppercase tracking-tight">
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              {/* About Us Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-gray-400 font-bold hover:text-blue-400 uppercase tracking-tight text-sm">
                  About Us
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[450px] p-4 bg-black border border-white/10 rounded-xl shadow-2xl">
                    <div className="grid gap-2">
                      {aboutLinks.map((item) => (
                        <Link 
                          key={item.title} 
                          href={item.href} 
                          className="group flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-blue-500/10"
                        >
                          <div className="p-2 rounded-md bg-blue-500/10 text-blue-500">
                            <item.icon size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-blue-400">{item.title}</p>
                            <p className="text-[11px] text-gray-500">{item.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Shop Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-gray-400 font-bold hover:text-blue-400 uppercase tracking-tight text-sm">
                  Shop
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[500px] p-4 bg-black border border-white/10 rounded-xl shadow-2xl">
                    <div className="grid gap-3 grid-cols-2">
                      {shopCategories.map((item) => (
                        <Link 
                          key={item.title} 
                          href={item.href} 
                          className="group flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-blue-500/10"
                        >
                          <div className="p-2 rounded-md bg-blue-500/10 text-blue-500">
                            <item.icon size={20} />
                          </div>
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

              {/* Legal & Compliance Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-purple-400 font-bold hover:text-purple-300 uppercase tracking-tight text-sm">
                  Legal & Compliance
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[300px] p-2 bg-black border border-white/10 rounded-xl shadow-2xl">
                    {complianceLinks.map((link) => (
                      <Link 
                        key={link.title} 
                        href={link.href} 
                        className="flex items-center gap-3 p-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-purple-500/10 rounded-lg transition-all group"
                      >
                        <link.icon size={16} className="text-purple-500 group-hover:animate-pulse" />
                        <span className="uppercase tracking-tighter">{link.title}</span>
                      </Link>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
  <button
    onClick={() => setCryptoModalOpen(true)}
    className="h-9 px-3 py-2 text-sm font-bold text-yellow-400 hover:text-yellow-300 transition-colors uppercase tracking-tight flex items-center gap-1.5"
  >
    <Bitcoin size={14} />
     How to buy crypto
  </button>
</NavigationMenuItem>
              {/* Products */}
              {/* <NavigationMenuItem>
                <Link href="/products" legacyBehavior passHref>
                  <NavigationMenuLink className="h-9 px-3 py-2 text-sm font-bold text-gray-400 hover:text-blue-400 transition-colors uppercase tracking-tight">
                    Products
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem> */}

              <NavigationMenuItem>
             <Link href="/blogs">
            <NavigationMenuLink className="h-9 px-3 py-2 text-sm font-bold text-gray-400 hover:text-blue-400 transition-colors uppercase tracking-tight">
             Blog
              </NavigationMenuLink>
             </Link>
           </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right section - Search, Cart, Auth */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search bar - Integrated with navigation */}
          <div ref={searchRef} className="relative flex items-center">
            {/* Search form - expands inline when open */}
            {searchOpen && (
              <div className="absolute right-12 lg:right-14 flex items-center">
                <form onSubmit={handleSearch} className="flex items-center">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") closeSearch();
                      }}
                      placeholder="Search CAS#, compound, formula..."
                      className="w-[200px] md:w-[280px] lg:w-[350px] bg-[#0a0a0a] border border-blue-500/40 rounded-lg pl-4 pr-10 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-lg"
                      autoComplete="off"
                    />
                    {searching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-400 animate-spin" />
                    )}
                    {!searching && (
                      <button
                        type="button"
                        onClick={closeSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Quick-search dropdown */}
                  {dropdownOpen && results.length > 0 && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-[#0d0d0d] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                      <div className="px-4 py-2 border-b border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Quick Results</p>
                      </div>
                      {results.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleResultClick(product.slug)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-500/10 transition-colors text-left"
                        >
                          <div className="h-9 w-9 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
                            {product.images?.[0]?.url ? (
                              <Image 
                                src={product.images[0].url} 
                                alt={product.name} 
                                width={36} 
                                height={36} 
                                className="object-cover w-full h-full" 
                              />
                            ) : (
                              <div className="w-full h-full bg-blue-500/10 flex items-center justify-center">
                                <Dna size={14} className="text-blue-500" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white font-medium truncate">{product.name}</p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {product.casNumber ? `CAS: ${product.casNumber}` : product.category?.title ?? ""}
                            </p>
                          </div>
                          <span className="text-sm text-blue-400 font-semibold flex-shrink-0">
                            ${(product.salePrice ?? product.price ?? 0).toFixed(2)}
                          </span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleSearch}
                        className="w-full px-4 py-2.5 text-xs text-blue-400 hover:bg-blue-500/10 border-t border-white/5 text-center font-medium tracking-wide transition-colors"
                      >
                        View all results for "{query}" →
                      </button>
                    </div>
                  )}

                  {dropdownOpen && query.length >= 2 && results.length === 0 && !searching && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-[#0d0d0d] border border-white/10 rounded-xl shadow-2xl p-4 text-center z-50">
                      <p className="text-sm text-gray-500">No products found for "<span className="text-white">{query}</span>"</p>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Search toggle button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-blue-400 relative z-10"
              onClick={() => {
                if (searchOpen) {
                  closeSearch();
                } else {
                  setSearchOpen(true);
                }
              }}
              aria-label={searchOpen ? "Close search" : "Open search"}
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </Button>
          </div>

          {/* Cart */}
          <Link 
            href="/cart" 
            className="relative p-2 text-gray-400 hover:text-blue-400 transition-colors"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={22} />
            {cart.length > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Auth section */}
          {session ? (
            <Link href="/dashboard" className="flex items-center gap-3 group ml-1">
              <Avatar className="h-8 w-8 border border-white/10 group-hover:border-blue-500 transition-colors">
                <AvatarImage src={session?.user?.image ?? ""} />
                <AvatarFallback className="bg-blue-900 text-blue-100 text-xs">
                  {getInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <div className="hidden md:flex items-center gap-2 ml-1">
              <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold px-4 uppercase tracking-widest text-xs">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu sheet */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-white ml-1">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-black border-r-white/10 p-0 text-white">
              <SheetHeader className="p-6 border-b border-white/10">
                <Logo />
              </SheetHeader>
              <nav className="flex flex-col p-4 gap-1 font-bold uppercase text-xs tracking-widest overflow-y-auto max-h-[calc(100vh-80px)]">
                {/* Mobile search */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(e);
                  setOpen(false);
                }} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-500 px-3">
                    <Search size={14} />
                  </Button>
                </form>

                <Link href="/" onClick={() => setOpen(false)} className="p-3 text-gray-300 hover:bg-white/5 rounded-lg hover:text-blue-400 transition-colors">
                  Home
                </Link>
                
                <div className="px-3 py-2 text-blue-400 mt-2 font-bold">About</div>
                {aboutLinks.map((link) => (
                  <Link 
                    key={link.title} 
                    href={link.href} 
                    onClick={() => setOpen(false)} 
                    className="flex items-center gap-3 p-3 hover:bg-blue-500/5 rounded-lg text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    <link.icon size={16} className="text-blue-500" />
                    {link.title}
                  </Link>
                ))}

                <div className="px-3 py-2 text-blue-400 mt-2 font-bold">Catalog</div>
                <Link href="/products" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 hover:bg-blue-500/5 rounded-lg text-gray-300 hover:text-blue-400 transition-colors">
                  All Products
                </Link>
                {shopCategories.map((cat) => (
                  <Link 
                    key={cat.title} 
                    href={cat.href} 
                    onClick={() => setOpen(false)} 
                    className="flex items-center gap-3 p-3 hover:bg-blue-500/5 rounded-lg text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    <cat.icon size={16} className="text-blue-500" />
                    {cat.title}
                  </Link>
                ))}

                <div className="px-3 py-2 text-purple-400 mt-4 font-bold">Compliance</div>
                {complianceLinks.map((link) => (
                  <Link 
                    key={link.title} 
                    href={link.href} 
                    onClick={() => setOpen(false)} 
                    className="flex items-center gap-3 p-3 hover:bg-purple-500/5 rounded-lg border border-purple-500/10 text-purple-300 hover:text-purple-200 transition-colors"
                  >
                    <link.icon size={16} />
                    {link.title}
                  </Link>
                ))}

                <div className="px-3 py-2 text-yellow-400 mt-4 font-bold">Crypto</div>
<button
  onClick={() => { setCryptoModalOpen(true); setOpen(false); }}
  className="flex items-center gap-3 p-3 hover:bg-yellow-500/5 rounded-lg text-yellow-300 hover:text-yellow-200 transition-colors w-full text-left font-bold uppercase text-xs tracking-widest"
>
  <Bitcoin size={16} className="text-yellow-400" />
  How to buy crypto
</button>
                
                {!session && (
                  <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-white/10">
                    <Link 
                      href="/login" 
                      onClick={() => setOpen(false)} 
                      className="p-3 text-center text-gray-300 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      onClick={() => setOpen(false)} 
                      className="p-3 text-center text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}