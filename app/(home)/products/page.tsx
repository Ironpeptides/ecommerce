import { searchProducts, getFilterOptions } from "@/actions/products";
import { ProductsClient } from "./productsClient";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  const query      = typeof params.q         === "string" ? params.q : undefined;
  const categories = typeof params.categories === "string" ? params.categories.split(",").filter(Boolean) : [];
  const minPrice   = typeof params.minPrice  === "string" ? Number(params.minPrice) : undefined;
  const maxPrice   = typeof params.maxPrice  === "string" ? Number(params.maxPrice) : undefined;
  const inStock    = params.inStock === "true";
  const minRating  = typeof params.rating    === "string" ? Number(params.rating) : undefined;
  const sortBy     = (params.sort as any)    ?? "newest";
  const page       = typeof params.page      === "string" ? Number(params.page) : 1;

  const [results, filterOptions] = await Promise.all([
    searchProducts({ query, categoryIds: categories, minPrice, maxPrice, inStock, minRating, sortBy, page }),
    getFilterOptions(),
  ]);

  return (
    <ProductsClient
      initialResults={results}
      filterOptions={filterOptions}
      initialQuery={query ?? ""}
      initialFilters={{ categories, minPrice, maxPrice, inStock, minRating, sortBy }}
    />
  );
}