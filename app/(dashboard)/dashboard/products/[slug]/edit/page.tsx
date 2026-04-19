import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProductBySlug } from "@/actions/products";
import { notFound } from "next/navigation";
import { BasicInfoTab } from "@/components/Forms/products/tabs/BasicInfoTab";
import { PricingTab } from "@/components/Forms/products/tabs/PricingTab";
import { AdvancedTab } from "@/components/Forms/products/tabs/AdvancedTab";
import { ImagesTab } from "@/components/Forms/products/tabs/ImagesTab";
import { VariantsTab } from "@/components/Forms/products/tabs/VariantsTab";
import { BatchesTab } from "@/components/Forms/products/tabs/BatchesTab";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const TABS = ["basic", "pricing", "images", "variants", "batches", "advanced"] as const;

const TAB_LABELS: Record<(typeof TABS)[number], string> = {
  basic: "Basic Info",
  pricing: "Pricing",
  images: "Images",
  variants: "Variants",
  batches: "Batches",
  advanced: "Advanced",
};

export default async function EditProductPage({
  params,
}: {
 params: Promise<{ slug: string }> | { slug: string };
}) {
    const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  console.log("product",product )

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back + title */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard/products"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {product.name}
            </h1>
            <Badge variant={product.isActive ? "default" : "secondary"}>
              {product.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Last updated{" "}
            {new Date(product.updatedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="basic" className="space-y-8">
        <TabsList className="inline-flex h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0 flex-wrap">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="inline-flex items-center gap-2 border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary capitalize"
            >
              {TAB_LABELS[tab]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic">
          <BasicInfoTab product={product} />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingTab product={product} />
        </TabsContent>

        <TabsContent value="images">
          <ImagesTab product={product} />
        </TabsContent>

        <TabsContent value="variants">
          <VariantsTab product={product} />
        </TabsContent>

        <TabsContent value="batches">
          <BatchesTab product={product} />
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedTab product={product} />
        </TabsContent>
      </Tabs>
    </div>
  );
}