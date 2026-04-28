"use client";

import { useState, useTransition, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
  Grid2X2, List, Star, SlidersHorizontal,
  Search, ChevronLeft, ChevronRight, Loader2, FlaskConical,
} from "lucide-react";
import { searchProducts } from "@/actions/products";
import ProductCard from "@/components/cards/product-card";

export type SortBy = "newest" | "rating" | "price_asc" | "price_desc" | "popular";

export type Filters = {
  categories: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  minRating?: number;
  sortBy: SortBy;
};

const DEFAULT_FILTERS: Filters = {
  categories: [],
  inStock: false,
  minRating: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  sortBy: "newest",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stars({ rating, filled }: { rating: number; filled: boolean }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3 w-3 ${
            s <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-700 text-gray-700"
          }`}
        />
      ))}
    </>
  );
}

function FilterSidebar({
  filterOptions,
  filters,
  onFiltersChange,
}: {
  filterOptions: any;
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
}) {
  const { categories, priceRange } = filterOptions;

  const toggleCategory = useCallback(
    (id: string) => {
      const next = filters.categories.includes(id)
        ? filters.categories.filter((c) => c !== id)
        : [...filters.categories, id];
      onFiltersChange({ ...filters, categories: next });
    },
    [filters, onFiltersChange]
  );

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Categories
        </h3>
        <div className="space-y-2">
          {categories.map((cat: any) => (
            <label
              key={cat.id}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <Checkbox
                checked={filters.categories.includes(cat.id)}
                onCheckedChange={() => toggleCategory(cat.id)}
                className="border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <span className="text-sm text-gray-400 group-hover:text-white transition-colors flex-1">
                {cat.title}
              </span>
              <span className="text-[11px] text-gray-600">
                {cat._count.products}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Price */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Price Range
        </h3>
        <div className="space-y-4">
          <Slider
            min={priceRange.min}
            max={priceRange.max}
            step={1}
            value={[
              filters.minPrice ?? priceRange.min,
              filters.maxPrice ?? priceRange.max,
            ]}
            onValueChange={([min, max]) =>
              onFiltersChange({ ...filters, minPrice: min, maxPrice: max })
            }
          />
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>${filters.minPrice ?? priceRange.min}</span>
            <span>${filters.maxPrice ?? priceRange.max}</span>
          </div>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Stock */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Availability
        </h3>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <Checkbox
            checked={filters.inStock}
            onCheckedChange={(v) =>
              onFiltersChange({ ...filters, inStock: !!v })
            }
            className="border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
            In Stock Only
          </span>
        </label>
      </div>

      <Separator className="bg-white/10" />

      {/* Rating */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Minimum Rating
        </h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((star) => (
            <label
              key={star}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <Checkbox
                checked={filters.minRating === star}
                onCheckedChange={() =>
                  onFiltersChange({
                    ...filters,
                    minRating: filters.minRating === star ? undefined : star,
                  })
                }
                className="border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <div className="flex items-center gap-1">
                <Stars rating={star} filled />
                <span className="text-xs text-gray-500 ml-1">& up</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <Separator className="bg-white/10" />

      <Button
        variant="outline"
        size="sm"
        className="w-full border-white/10 text-gray-400 hover:text-white hover:border-white/30"
        onClick={() => onFiltersChange(DEFAULT_FILTERS)}
      >
        Reset Filters
      </Button>
    </div>
  );
}

// ─── Main client component ────────────────────────────────────────────────────

export function ProductsClient({
  initialResults,
  filterOptions,
  initialQuery,
  initialFilters,
}: {
  initialResults: any;
  filterOptions: any;
  initialQuery: string;
  initialFilters: Filters;
}) {
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [results, setResults] = useState(initialResults);
  const [filters, setFilters] = useState<Filters>(initialFilters);

  // `initialQuery` never changes — no need for useState
  const applyFilters = useCallback(
    (newFilters: Filters, newPage = 1) => {
      setFilters(newFilters);
      startTransition(async () => {
        const res = await searchProducts({
          query: initialQuery,
          categoryIds: newFilters.categories,
          minPrice: newFilters.minPrice,
          maxPrice: newFilters.maxPrice,
          inStock: newFilters.inStock,
          minRating: newFilters.minRating,
          sortBy: newFilters.sortBy as any,
          page: newPage,
        });
        setResults(res);
      });
    },
    [initialQuery]
  );

  const resetFilters = useCallback(
    () => applyFilters(DEFAULT_FILTERS),
    [applyFilters]
  );

  // Computed once per filter change, not on every render
  const activeFilterCount = useMemo(
    () =>
      filters.categories.length +
      (filters.inStock ? 1 : 0) +
      (filters.minRating ? 1 : 0) +
      (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0),
    [filters]
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          {initialQuery ? (
            <>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                Search Results
              </p>
              <h1 className="text-2xl font-bold">
                Results for{" "}
                <span className="text-blue-400">"{initialQuery}"</span>
              </h1>
            </>
          ) : (
            <>
              <p className="text-xs text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <FlaskConical size={12} /> Catalog
              </p>
              <h1 className="text-2xl font-bold">All Products</h1>
            </>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {results.total} product{results.total !== 1 ? "s" : ""}{" "}
            {initialQuery ? "found" : "available"}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-28">
              <FilterSidebar
                filterOptions={filterOptions}
                filters={filters}
                onFiltersChange={applyFilters}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0 space-y-5">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {/* Mobile filter sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden border-white/10 text-gray-400 gap-2"
                    >
                      <SlidersHorizontal size={14} /> Filters
                      {activeFilterCount > 0 && (
                        <Badge className="bg-blue-600 text-white text-[10px] h-4 px-1.5 rounded-full">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="bg-black border-r border-white/10 text-white w-72 overflow-y-auto"
                  >
                    <SheetHeader className="mb-6">
                      <SheetTitle className="text-white">Filters</SheetTitle>
                    </SheetHeader>
                    <FilterSidebar
                      filterOptions={filterOptions}
                      filters={filters}
                      onFiltersChange={applyFilters}
                    />
                  </SheetContent>
                </Sheet>

                {activeFilterCount > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-blue-500/30 text-blue-400"
                  >
                    {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}{" "}
                    active
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Select
                  value={filters.sortBy}
                  onValueChange={(v) => applyFilters({ ...filters, sortBy: v as SortBy })}
                >
                  <SelectTrigger className="w-40 bg-white/5 border-white/10 text-sm text-gray-300 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d0d0d] border-white/10 text-white">
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="price_asc">Price: Low → High</SelectItem>
                    <SelectItem value="price_desc">Price: High → Low</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border border-white/10 rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setView("grid")}
                    className={`h-9 px-3 rounded-none ${
                      view === "grid"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Grid2X2 size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setView("list")}
                    className={`h-9 px-3 rounded-none ${
                      view === "list"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <List size={15} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading */}
            {isPending && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              </div>
            )}

            {/* Empty state */}
            {!isPending && results.products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <div className="bg-white/5 rounded-full p-6">
                  <Search className="h-10 w-10 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">No products found</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Try adjusting your filters or search term.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-white/10 text-gray-400"
                  onClick={resetFilters}
                >
                  Clear all filters
                </Button>
              </div>
            )}

            {/* Grid / List */}
            {!isPending && results.products.length > 0 && (
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "flex flex-col gap-3"
                }
              >
                {results.products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {results.totalPages > 1 && !isPending && (
              <div className="flex items-center justify-center gap-3 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={results.page <= 1}
                  onClick={() => applyFilters(filters, results.page - 1)}
                  className="border-white/10 text-gray-400 hover:text-white gap-1"
                >
                  <ChevronLeft size={14} /> Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {results.page} of {results.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!results.hasMore}
                  onClick={() => applyFilters(filters, results.page + 1)}
                  className="border-white/10 text-gray-400 hover:text-white gap-1"
                >
                  Next <ChevronRight size={14} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}