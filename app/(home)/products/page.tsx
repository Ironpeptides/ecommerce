import { searchProducts, getFilterOptions } from "@/actions/products";
import { ProductsClient, type Filters, type SortBy } from "./productsClient";



const VALID_SORTS = new Set<string>(["newest", "rating", "price_asc", "price_desc", "popular"]);

function parseSortBy(value: string | undefined): SortBy {
  return (value && VALID_SORTS.has(value) ? value : "newest") as SortBy;
}

function parseParam(params: Record<string, string | string[] | undefined>, key: string) {
  const v = params[key];
  return typeof v === "string" ? v : undefined;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const initialFilters: Filters = {
    categories: parseParam(params, "categories")?.split(",").filter(Boolean) ?? [],
    minPrice:   params.minPrice  ? Number(params.minPrice)  : undefined,
    maxPrice:   params.maxPrice  ? Number(params.maxPrice)  : undefined,
    inStock:    params.inStock === "true",
    minRating:  params.rating   ? Number(params.rating)    : undefined,
    sortBy: parseSortBy(parseParam(params, "sort")),
  };

  const query = parseParam(params, "q") ?? "";
  const page  = params.page ? Number(params.page) : 1;

  const [results, filterOptions] = await Promise.all([
    searchProducts({ query, ...initialFilters, page }),
    getFilterOptions(),
  ]);

  return (
    <ProductsClient
      initialResults={results}
      filterOptions={filterOptions}
      initialQuery={query}
      initialFilters={initialFilters}
    />
  );
}