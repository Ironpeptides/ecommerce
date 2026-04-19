"use server";

// import { db } from "@/prisma/db"; // Commented out until database is ready

const staticShops = [
  { 
    id: "shop-1", 
    name: "PureGrade Peptides", 
    logo: "/images/onestepwellness.jpg", 
    rating: 4.9, 
    totalProducts: 32,
    description: "ISO-certified peptide manufacturer",
    verified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: "shop-2", 
    name: "BioSynth Labs", 
    logo: "/images/wellness2.jpg", 
    rating: 4.8, 
    totalProducts: 24,
    description: "Research-grade peptides",
    verified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: "shop-3", 
    name: "AlphaPeptide Co.", 
    logo: "/images/NAD.jpeg", 
    rating: 4.7, 
    totalProducts: 18,
    description: "Premium peptide synthesis",
    verified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: "shop-4", 
    name: "NovaPeptide Store", 
    logo: "/images/GHK.jpeg", 
    rating: 4.6, 
    totalProducts: 15,
    description: "Quality peptides for research",
    verified: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
];

export async function getTopShops(orgId?: string, limit: number = 4) {
  try {
    // TODO: Uncomment when database is ready
    // const shops = await db.shop.findMany({
    //   take: limit,
    //   orderBy: { rating: "desc" },
    //   include: {
    //     _count: {
    //       select: { products: true }
    //     }
    //   }
    // });
    // return shops;
    
    // Static data return for now
    return staticShops.slice(0, limit);
  } catch (error) {
    console.error("Error fetching top shops:", error);
    return [];
  }
}

export async function getShopById(shopId: string) {
  try {
    // TODO: Uncomment when database is ready
    // return await db.shop.findUnique({
    //   where: { id: shopId },
    //   include: {
    //     products: true,
    //     _count: {
    //       select: { products: true }
    //     }
    //   }
    // });
    
    // Static data return for now
    return staticShops.find(shop => shop.id === shopId) || null;
  } catch (error) {
    console.error("Error fetching shop:", error);
    return null;
  }
}