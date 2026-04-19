"use server";

import { db } from "@/prisma/db";
import { CategoryProps } from "@/types/types";
import { revalidatePath } from "next/cache";


type CreateCategoryInput = {
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
};

type ActionResult<T = any> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

export async function createCategory(data: CreateCategoryInput): Promise<ActionResult> {
  const { slug } = data;

  try {
    // Check for existing category
    const existingCategory = await db.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return {
        success: false,
        data: null,
        error: "A category with this name already exists.",
      };
    }

    // Create new category
    const newCategory = await db.category.create({
      data,
    });

    revalidatePath("/dashboard/categories");

    return {
      success: true,
      data: newCategory,
      error: null,
    };
  } catch (error: any) {
    console.error("Create category error:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to create category",
    };
  }
}
export async function getAllCategories() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return categories;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function updateCategoryById(id: string, data: CategoryProps) {
  try {
    const updatedCategory = await db.category.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/dashboard/categories");
    return updatedCategory;
  } catch (error) {
    console.log(error);
  }
}
export async function getCategoryById(id: string) {
  try {
    const category = await db.category.findUnique({
      where: {
        id,
      },
    });
    return category;
  } catch (error) {
    console.log(error);
  }
}
export async function deleteCategory(id: string) {
  try {
    const deletedCategory = await db.category.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
      data: deletedCategory,
    };
  } catch (error) {
    console.log(error);
  }
}
export async function createBulkCategories(categories: CategoryProps[]) {
  try {
    for (const category of categories) {
      await createCategory(category);
    }
  } catch (error) {
    console.log(error);
  }
}
