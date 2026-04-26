// actions/products.ts
"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/config/useAuth";

interface GetProductBySlugResponse {
  success: boolean;
  data?: any;
  error?: string;
}
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

function normalizeProduct(p: any) {
  return {
    ...p,
    category: p.category ? { id: p.category.id, name: p.category.title } : null,
  };
}


export async function getProducts(orgId?: string) {
  try {
    const products = await db.product.findMany({
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

    return products.map(normalizeProduct);
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
  return db.product.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true, name: true, slug: true, description: true,
      price: true, salePrice: true, stock: true, lowStock: true,
      casNumber: true, formula: true, molarMass: true,
      sku: true, isActive: true, isFeatured: true, createdAt: true,
      updatedAt: true,
      category: {
        select: { id: true, title: true, slug: true, description: true, imageUrl: true },
      },
      images: { select: { url: true, alt: true, isPrimary: true, id:true, order:true }, orderBy: { order: "asc" } },
      variants: {
        select: { id: true, name: true, value: true, unit: true, price: true, stock: true, sku: true },
        orderBy: { price: "asc" },
      },
      reviews: {
        select: {
          id: true, rating: true, comment: true, userId: true,
          productId: true, createdAt: true,
          user: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      batches: {
        select: {
          id: true, batchNumber: true, purity: true, coaUrl: true,
          manufacturedAt: true, expiryDate: true, quantity: true,
        },
        orderBy: { expiryDate: "asc" },
      },
      certificates: { select: { id: true, url: true } },
      _count: { select: { reviews: true, orderItems: true } },
    },
  });
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4
) {
  return db.product.findMany({
    where: {
      isActive: true,
      id: { not: productId },
      ...(categoryId ? { categoryId } : {}),
    },
    take: limit,
    select: {
      id: true, name: true, slug: true, description: true,
      price: true, salePrice: true, stock: true, lowStock: true,
      casNumber: true, formula: true,
      category: { select: { id: true, title: true, slug: true, description: true, imageUrl: true } },
      images: { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
      variants: { select: { id: true, name: true, value: true, unit: true, price: true, stock: true, sku: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}



// Optional: Get product with transformed types (handles null values)
export async function getProductWithDefaults(slug: string) {
  try {
    const product = await db.product.findUnique({
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
    
    if (!product) return null;
    
    // Transform the product to ensure no null values where you expect strings
    return {
      ...product,
      description: product.description || "",
      category: product.category ? {
        ...product.category,
        description: product.category.description || "",
        imageUrl: product.category.imageUrl || "",
      } : null,
    };
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}
// Optional: Helper function to prefetch multiple products
export async function prefetchProducts(slugs: string[]) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://yourdomain.com');
    
    const promises = slugs.map(slug => 
      fetch(`${baseUrl}/api/products/slug/${slug}`, {
        next: { revalidate: 60 }
      })
    );
    
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error prefetching products:", error);
    return false;
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

function normalizeCategory(c: any) {
  return {
    ...c,
    name: c.title,
  };
}

export async function getProductCategories(orgId?: string) {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return categories.map(normalizeCategory);
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



export type ProductSearchParams = {
  query?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
  sortBy?: "newest" | "price_asc" | "price_desc" | "popular" | "rating";
  page?: number;
  limit?: number;
};

export async function searchProducts(params: ProductSearchParams = {}) {
  const {
    query,
    categoryIds,
    minPrice,
    maxPrice,
    inStock,
    minRating,
    sortBy = "newest",
    page = 1,
    limit = 24,
  } = params;

  const where: any = { isActive: true };

  // Full-text search across name, description, CAS number, formula
  if (query?.trim()) {
    where.OR = [
      { name:        { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { casNumber:   { contains: query, mode: "insensitive" } },
      { formula:     { contains: query, mode: "insensitive" } },
      { sku:         { contains: query, mode: "insensitive" } },
      { category:    { title: { contains: query, mode: "insensitive" } } },
    ];
  }

  if (categoryIds?.length) {
    where.categoryId = { in: categoryIds };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.OR = [
      {
        salePrice: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      },
      {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      },
    ];
  }

  if (inStock) {
    where.stock = { gt: 0 };
  }

  // Rating filter — join reviews
  if (minRating) {
    where.reviews = {
      some: { rating: { gte: minRating } },
    };
  }

  const orderBy: any =
    sortBy === "price_asc"  ? [{ salePrice: "asc"  }, { price: "asc"  }] :
    sortBy === "price_desc" ? [{ salePrice: "desc" }, { price: "desc" }] :
    sortBy === "popular"    ? [{ orderItems: { _count: "desc" } }]       :
    sortBy === "rating"     ? [{ reviews: { _count: "desc" } }]          :
                              [{ createdAt: "desc" }]; // newest

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true, name: true, slug: true, description: true,
        price: true, salePrice: true, stock: true, lowStock: true,
        casNumber: true, formula: true, molarMass: true,
        isActive: true, isFeatured: true, createdAt: true,
        category:  { select: { id: true, title: true, slug: true } },
        images:    { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
        variants:  { select: { id: true, name: true, value: true, price: true, stock: true, unit: true } },
        _count:    { select: { reviews: true, orderItems: true } },
        reviews:   { select: { rating: true } },
      },
    }),
    db.product.count({ where }),
  ]);

  // Compute average rating per product
  const enriched = products.map((p) => ({
    ...p,
    averageRating: p.reviews.length
      ? Number((p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length).toFixed(1))
      : null,
  }));

  return {
    products: enriched,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + products.length < total,
  };
}

// Used by header quick-search dropdown (lightweight — name + image only)
export async function quickSearchProducts(query: string) {
  if (!query.trim() || query.length < 2) return [];

  return db.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name:      { contains: query, mode: "insensitive" } },
        { casNumber: { contains: query, mode: "insensitive" } },
        { formula:   { contains: query, mode: "insensitive" } },
      ],
    },
    take: 6,
    select: {
      id: true, name: true, slug: true,
      salePrice: true, price: true,
      casNumber: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      category: { select: { title: true } },
    },
  });
}

// For sidebar filter options
export async function getFilterOptions() {
  const [categories, priceAgg] = await Promise.all([
    db.category.findMany({
      select: { id: true, title: true, slug: true, _count: { select: { products: true } } },
      orderBy: { title: "asc" },
    }),
    db.product.aggregate({
      where: { isActive: true },
      _min: { salePrice: true, price: true },
      _max: { salePrice: true, price: true },
    }),
  ]);

  return {
    categories,
    priceRange: {
      min: Math.floor(Math.min(priceAgg._min.salePrice ?? 0, priceAgg._min.price ?? 0)),
      max: Math.ceil(Math.max(priceAgg._max.salePrice ?? 999, priceAgg._max.price ?? 999)),
    },
  };
}