// actions/products.ts
"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/config/useAuth";

// ─── helpers ────────────────────────────────────────────────────────────────

function revalidateProductPaths(slug?: string, productId?: string) {
  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  if (slug) revalidatePath(`/dashboard/products/${slug}/edit`);
  if (productId) revalidatePath(`/dashboard/products/${productId}`);
}

// ============================================================
// PRODUCTS
// ============================================================

export async function getProducts(orgId?: string) {
  try {
    return await db.product.findMany({
      include: {
        images: { orderBy: { order: "asc" } },
        variants: true,
        batches: { orderBy: { manufacturedAt: "desc" } },
        category: true,
        certificates: true,
        _count: { select: { reviews: true, orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductById(id: string) {
  try {
    return await db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        variants: true,
        batches: { orderBy: { manufacturedAt: "desc" } },
        category: true,
        certificates: true,
        reviews: true,
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function getProductBySlug(slug: string) {
  try {
    return await db.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: "asc" } },
        variants: true,
        batches: { orderBy: { manufacturedAt: "desc" } },
        category: true,
        certificates: true,
        reviews: true,
      },
    });
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

export type CreateProductInput = {
  name: string;
  slug: string;
  price?: number | null;
  stock?: number;
  orgId?: string;
  categoryId?: string;
  // optionals filled in on the edit page
  description?: string;
  salePrice?: number | null;
  sku?: string;
  barcode?: string;
  lowStock?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  casNumber?: string;
  formula?: string;
  molarMass?: string;
};

export async function createProduct(data: {
  name: string;
  slug: string;
  price: number;
  stock: number;
  categoryId?: string;
  orgId?: string;  // Make it optional
}) {
  try {
    const { categoryId, orgId, ...rest } = data;  
    
    const createData: any = { ...rest };
    
    if (categoryId) {
      createData.category = {
        connect: { id: categoryId }
      };
    }
    
    
    const product = await db.product.create({ data: createData });
    revalidateProductPaths(product.slug, product.id);
    return product;
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  }
}

export type UpdateProductInput = Partial<{
  name: string;
  slug: string;
  description: string;
  price: number | null;
  salePrice: number | null;
  sku: string;
  barcode: string;
  stock: number;
  lowStock: number;
  isActive: boolean;
  isFeatured: boolean;
  casNumber: string;
  formula: string;
  molarMass: string;
  categoryId: string;
}>;

export async function updateProduct(id: string, data: UpdateProductInput) {
  try {
    const product = await db.product.update({ where: { id }, data });
    revalidateProductPaths(product.slug, product.id);
    return { success: true, product };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

// Used by InlineEditField + ToggleField — single field PATCH
export async function updateProductField(
  productId: string,
  field: string,
  value: string | number | boolean
) {
  try {
    const product = await db.product.update({
      where: { id: productId },
      data: { [field]: value },
    });
    revalidateProductPaths(product.slug, product.id);
    return { success: true, product };
  } catch (error) {
    console.error(`Error updating product field "${field}":`, error);
    throw new Error(`Failed to update ${field}`);
  }
}

export async function deleteProduct(id: string) {
  try {
    await db.product.delete({ where: { id } });
    revalidatePath("/dashboard/products");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

// ============================================================
// PRODUCT IMAGES
// ============================================================

export async function addProductImage(
  productId: string,
  url: string,
  order: number,
  alt?: string
) {
  try {
    // If this is the first image, make it primary automatically
    const existingCount = await db.productImage.count({ where: { productId } });
    const image = await db.productImage.create({
      data: {
        productId,
        url,
        alt: alt ?? null,
        order,
        isPrimary: existingCount === 0,
      },
    });
    revalidatePath("/dashboard/products");
    return image;
  } catch (error) {
    console.error("Error adding product image:", error);
    throw new Error("Failed to add product image");
  }
}

export async function setPrimaryProductImage(
  productId: string,
  imageId: string
) {
  try {
    // Unset all, then set the chosen one — do it in a transaction
    await db.$transaction([
      db.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      }),
      db.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    console.error("Error setting primary image:", error);
    throw new Error("Failed to set primary image");
  }
}

export async function deleteProductImage(imageId: string) {
  try {
    const deleted = await db.productImage.delete({ where: { id: imageId } });

    // If we just deleted the primary, promote the lowest-order remaining image
    if (deleted.isPrimary) {
      const next = await db.productImage.findFirst({
        where: { productId: deleted.productId },
        orderBy: { order: "asc" },
      });
      if (next) {
        await db.productImage.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
      }
    }

    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product image:", error);
    throw new Error("Failed to delete product image");
  }
}

// ============================================================
// PRODUCT CERTIFICATES
// ============================================================

 export async function setProductCertificate(productId: string, url: string) {
  try {
    // One certificate per product — upsert pattern: delete existing, create new
    await db.productCertificate.deleteMany({ where: { productId } });
    const cert = await db.productCertificate.create({
      data: { productId, url },
    });
    revalidatePath("/dashboard/products");
    return cert;
  } catch (error) {
    console.error("Error setting product certificate:", error);
    throw new Error("Failed to save certificate");
  }
}

export async function deleteProductCertificate(certificateId: string) {
  try {
    await db.productCertificate.delete({ where: { id: certificateId } });
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting certificate:", error);
    throw new Error("Failed to delete certificate");
  }
} 

// ============================================================
// VARIANTS
// ============================================================

export async function getProductVariants(orgId?: string) {
  try {
    return await db.productVariant.findMany({
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { product: { name: "asc" } },
    });
  } catch (error) {
    console.error("Error fetching variants:", error);
    return [];
  }
}

export async function getVariantsByProductId(productId: string) {
  try {
    return await db.productVariant.findMany({
      where: { productId },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching variants by product:", error);
    return [];
  }
}

export type AddVariantInput = {
  name: string;
  value: string;
  quantity?: number;
  unit?: string;
  price?: number;
  stock?: number;
  sku?: string;
};

// Used by VariantsTab — returns the full variant record
export async function addProductVariant(
  productId: string,
  data: AddVariantInput
) {
  try {
    const variant = await db.productVariant.create({
      data: { ...data, productId },
    });
    revalidatePath("/dashboard/products");
    return variant;
  } catch (error) {
    console.error("Error adding variant:", error);
    throw new Error("Failed to add variant");
  }
}

export async function updateProductVariant(
  variantId: string,
  data: Partial<AddVariantInput>
) {
  try {
    const variant = await db.productVariant.update({
      where: { id: variantId },
      data,
    });
    revalidatePath("/dashboard/products");
    return { success: true, variant };
  } catch (error) {
    console.error("Error updating variant:", error);
    return { success: false, error: "Failed to update variant" };
  }
}

export async function deleteProductVariant(variantId: string) {
  try {
    await db.productVariant.delete({ where: { id: variantId } });
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting variant:", error);
    throw new Error("Failed to delete variant");
  }
}

// ============================================================
// BATCHES
// ============================================================

export async function getProductBatches(orgId?: string) {
  try {
    return await db.batch.findMany({
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { manufacturedAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return [];
  }
}

export async function getBatchesByProductId(productId: string) {
  try {
    return await db.batch.findMany({
      where: { productId },
      orderBy: { manufacturedAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching batches by product:", error);
    return [];
  }
}

export type AddBatchInput = {
  batchNumber: string;
  purity?: number;
  coaUrl?: string;
  manufacturedAt?: Date;
  expiryDate?: Date;
  quantity?: number;
};

// Used by BatchesTab — returns the full batch record directly
export async function addProductBatch(productId: string, data: AddBatchInput) {
  try {
    const batch = await db.batch.create({
      data: { ...data, productId },
    });
    revalidatePath("/dashboard/products");
    return batch;
  } catch (error) {
    console.error("Error adding batch:", error);
    throw new Error("Failed to add batch");
  }
}

export async function updateProductBatch(
  batchId: string,
  data: Partial<AddBatchInput>
) {
  try {
    const batch = await db.batch.update({
      where: { id: batchId },
      data,
    });
    revalidatePath("/dashboard/products");
    return { success: true, batch };
  } catch (error) {
    console.error("Error updating batch:", error);
    return { success: false, error: "Failed to update batch" };
  }
}

export async function deleteProductBatch(batchId: string) {
  try {
    await db.batch.delete({ where: { id: batchId } });
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting batch:", error);
    throw new Error("Failed to delete batch");
  }
}

// ============================================================
// CATEGORIES
// ============================================================

export async function getProductCategories(orgId?: string) {
  try {
    return await db.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getCategoryById(id: string) {
  try {
    return await db.category.findUnique({
      where: { id },
      include: { products: true },
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

export type CategoryInput = {
  title: string;
  slug?: string;
  description?: string;
};

export async function createCategory(data: CategoryInput) {
  try {
    const slug =
      data.slug ?? data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const category = await db.category.create({ data: { ...data, slug } });
    revalidatePath("/dashboard/products");
    return { success: true, category };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(id: string, data: Partial<CategoryInput>) {
  try {
    const category = await db.category.update({ where: { id }, data });
    revalidatePath("/dashboard/products");
    return { success: true, category };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const category = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) return { success: false, error: "Category not found" };

    if (category._count.products > 0) {
      return {
        success: false,
        error: `Cannot delete — ${category._count.products} product(s) are still using this category`,
      };
    }

    await db.category.delete({ where: { id } });
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}