import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTable from "@/components/DataTableComponents/DataTable";
import ModalTableHeader from "@/components/dashboard/Tables/ModalTableHeader";

import { columns as productColumns } from "./columns";
import { variantColumns } from "./variantsColumns/columns";
import { batchColumns } from "./batchesColumns/columns";
import { categoryColumns } from "./categoriesColumns/columns";

import { ProductTable } from "@/components/dashboard/Tables/ProductTable";
import { VariantsTable } from "@/components/dashboard/Tables/VariantsTable";
import { BatchesTable } from "@/components/dashboard/Tables/BatchesTable";
import { CategoriesTable } from "@/components/dashboard/Tables/CategoriesTable";

import { QuickCreateCategoryForm } from "@/components/Forms/products/QuickCreateCategoryForm";

import { getAuthenticatedUser } from "@/config/useAuth";
import {
  getProducts,
  getProductVariants,
  getProductBatches,
  getProductCategories,
} from "@/actions/products";
import { QuickCreateProductForm } from "@/components/Forms/products/QuickCreateProductForm";

const TABS = ["products", "variants", "batches", "categories"] as const;

const TAB_META: Record<(typeof TABS)[number], { title: string; description: string }> = {
  products: {
    title: "Products",
    description: "Manage your peptide catalogue — prices, images, and stock.",
  },
  variants: {
    title: "Variants",
    description:
      "All quantity/unit variants across products (e.g. 2 mg, 5 mg, 10 mg).",
  },
  batches: {
    title: "Batches",
    description:
      "Track production batches, purity readings, and certificates of analysis.",
  },
  categories: {
    title: "Categories",
    description: "Organise products into categories shown on the storefront.",
  },
};

export default async function ProductsPage() {
  const user = await getAuthenticatedUser();
  const orgId = user.orgId;

  const [products, variants, batches, categories] = await Promise.all([
    getProducts(orgId).then((res) => res ?? []),
    getProductVariants(orgId).then((res) => res ?? []),
    getProductBatches(orgId).then((res) => res ?? []),
    getProductCategories(orgId).then((res) => res ?? []),
  ]);

  const categoryOptions = categories.map(cat => ({
  value: cat.id,
  label: cat.title
}));

  return (
    <div className="p-8">
      <Tabs defaultValue="products" className="space-y-8">
        {/* ── Tab triggers ── */}
        <TabsList className="inline-flex h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0 flex-wrap">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="inline-flex items-center gap-2 border-b-2 border-transparent px-8 pb-3 pt-2 data-[state=active]:border-primary capitalize"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Products ── */}
        <TabsContent value="products" className="space-y-8">
          <ModalTableHeader
            title="Products"
            linkTitle="Add Product"
            href="/dashboard/products/new"
            data={products}
            model="product"
            modalForm={<QuickCreateProductForm categories={categoryOptions} orgId={orgId} />}
          />
          <DataTable columns={productColumns} data={products} />
        </TabsContent>

        {/* ── Variants ── */}
        <TabsContent value="variants" className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {TAB_META.variants.title}
              </h2>
              <p className="text-muted-foreground text-sm">
                {TAB_META.variants.description}
              </p>
            </div>
          </div>
          <VariantsTable columns={variantColumns} data={variants ?? []} />
        </TabsContent>

        {/* ── Batches ── */}
        <TabsContent value="batches" className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {TAB_META.batches.title}
              </h2>
              <p className="text-muted-foreground text-sm">
                {TAB_META.batches.description}
              </p>
            </div>
          </div>
          <BatchesTable columns={batchColumns} data={batches ?? []} />
        </TabsContent>

        {/* ── Categories ── */}
        <TabsContent value="categories" className="space-y-8">
          <ModalTableHeader
            title="Categories"
            linkTitle="Add Category"
            href="/dashboard/products/categories/new"
            data={categories}
            model="category"
            modalForm={<QuickCreateCategoryForm orgId={orgId} />} 
          />
          <CategoriesTable columns={categoryColumns} data={categories ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}