"use server";

// import { db } from "@/lib/db"; // Commented out until database is ready

const staticEvents = [
  {
    id: "event-001",
    title: "BPC-157 + TB-4 Stack",
    slug: "bpc-157-tb-4-stack",
    description: "Complete recovery stack for research",
    price: 99.99,
    salePrice: 129.99,
    regular_price: 129.99,
    sale_price: 99.99,
    ratings: 4.9,
    totalSales: 75,
    stock: 8,
    images: [{ url: "/images/Acetic-Water-01-mockup-300x300.webp" }],
    shop: { id: "shop-1", name: "PureGrade Peptides" },
    category: "Bundle",
    ending_date: new Date("2026-05-01T00:00:00.000Z"),
    isActive: true,
    discount: 23,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "event-002",
    title: "Cognitive Bundle",
    slug: "cognitive-bundle",
    description: "Enhanced cognitive function stack",
    price: 79.99,
    salePrice: 99.99,
    regular_price: 99.99,
    sale_price: 79.99,
    ratings: 4.7,
    totalSales: 50,
    stock: 5,
    images: [{ url: "/images/ACP-105-—-10mg-mockup-300x300.jpg" }],
    shop: { id: "shop-2", name: "BioSynth Labs" },
    category: "Bundle",
    ending_date: new Date("2026-04-20T00:00:00.000Z"),
    isActive: true,
    discount: 20,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "event-003",
    title: "Growth Stack",
    slug: "growth-stack",
    description: "Maximum growth hormone support",
    price: 89.99,
    salePrice: 114.99,
    regular_price: 114.99,
    sale_price: 89.99,
    ratings: 4.8,
    totalSales: 63,
    stock: 20,
    images: [{ url: "/images/Aminotadalafil-01-mockup-300x300.webp" }],
    shop: { id: "shop-3", name: "AlphaPeptide Co." },
    category: "Bundle",
    ending_date: new Date("2026-04-30T00:00:00.000Z"),
    isActive: true,
    discount: 22,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "event-004",
    title: "Longevity Pack",
    slug: "longevity-pack",
    description: "Anti-aging and longevity research",
    price: 109.99,
    salePrice: 139.99,
    regular_price: 139.99,
    sale_price: 109.99,
    ratings: 4.9,
    totalSales: 90,
    stock: 3,
    images: [{ url: "/images/Bacteriostatic-water-mockup-300x300.webp" }],
    shop: { id: "shop-4", name: "NovaPeptide Store" },
    category: "Bundle",
    ending_date: new Date("2026-05-15T00:00:00.000Z"),
    isActive: true,
    discount: 21,
    createdAt: new Date(),
    updatedAt: new Date()
  },
];

export async function getEvents(orgId?: string, page: number = 1, limit: number = 10) {
  try {
    // TODO: Uncomment when database is ready
    // const events = await db.event.findMany({
    //   where: {
    //     isActive: true,
    //     ending_date: { gt: new Date() }
    //   },
    //   orderBy: { ending_date: "asc" },
    //   skip: (page - 1) * limit,
    //   take: limit,
    // });
    // return events;
    
    // Static data return for now
    const now = new Date();
    const activeEvents = staticEvents.filter(event => 
      event.isActive && new Date(event.ending_date) > now
    );
    return activeEvents.slice((page - 1) * limit, page * limit);
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export async function getEventById(eventId: string) {
  try {
    // TODO: Uncomment when database is ready
    // return await db.event.findUnique({
    //   where: { id: eventId }
    // });
    
    // Static data return for now
    return staticEvents.find(event => event.id === eventId) || null;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}