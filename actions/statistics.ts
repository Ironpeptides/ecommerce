"use server";

import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/config/useAuth";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTrendPercent(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const diff = ((current - previous) / previous) * 100;
  return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfLastMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, 1);
}

function endOfLastMonth() {
  return new Date(new Date().getFullYear(), new Date().getMonth(), 0);
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getOrderStats() {
  const user = await getAuthenticatedUser();
  const isAdmin = user.roles.some(r => r.roleName.toLowerCase() === "admin");
  const where = isAdmin ? {} : { userId: user.id };

  const [orders, thisMonthOrders, lastMonthOrders] = await Promise.all([
    db.order.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        paymentStatus: true,
        totalAmount: true,
        subtotal: true,
        discountAmount: true,
        shippingFee: true,
        createdAt: true,
        couponCode: true,
        user: { select: { id: true, name: true, email: true } },
        items: {
          select: {
            productName: true,
            quantity: true,
            price: true,
            subTotal: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.order.count({ where: { ...where, createdAt: { gte: startOfMonth() } } }),
    db.order.count({
      where: {
        ...where,
        createdAt: { gte: startOfLastMonth(), lte: endOfLastMonth() },
      },
    }),
  ]);

  return {
    count: orders.length,
    trend: getTrendPercent(thisMonthOrders, lastMonthOrders),
    trendUp: thisMonthOrders >= lastMonthOrders,
    trendLabel: `${getTrendPercent(thisMonthOrders, lastMonthOrders)} this month`,
    data: orders,
  };
}

// ── Revenue ───────────────────────────────────────────────────────────────────

export async function getRevenueStats() {
  const user = await getAuthenticatedUser();
 const isAdmin = user.roles.some(r => r.roleName.toLowerCase() === "admin");
  const where = isAdmin
    ? { paymentStatus: "PAID" as const }
    : { userId: user.id, paymentStatus: "PAID" as const };

  const [allPaidOrders, thisMonthRevenue, lastMonthRevenue] = await Promise.all([
    db.order.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        discountAmount: true,
        couponCode: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.order.aggregate({
      where: { ...where, createdAt: { gte: startOfMonth() } },
      _sum: { totalAmount: true },
    }),
    db.order.aggregate({
      where: {
        ...where,
        createdAt: { gte: startOfLastMonth(), lte: endOfLastMonth() },
      },
      _sum: { totalAmount: true },
    }),
  ]);

  const total = allPaidOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const thisMonth = thisMonthRevenue._sum.totalAmount ?? 0;
  const lastMonth = lastMonthRevenue._sum.totalAmount ?? 0;

  return {
    count: total,
    formatted: `$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    trend: getTrendPercent(thisMonth, lastMonth),
    trendUp: thisMonth >= lastMonth,
    trendLabel: `${getTrendPercent(thisMonth, lastMonth)} vs last month`,
    thisMonth,
    lastMonth,
    data: allPaidOrders,
  };
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

export async function getWishlistStats() {
  const user = await getAuthenticatedUser();
  const isAdmin = user.roles.some(r => r.roleName.toLowerCase() === "admin");

  if (isAdmin) {
    // Admins see all wishlists and top wished products
    const [allWishlists, topWishedProducts] = await Promise.all([
      db.wishlist.findMany({
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, slug: true, salePrice: true, price: true },
              },
            },
          },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      db.wishlistItem.groupBy({
        by: ["productId"],
        _count: { productId: true },
        orderBy: { _count: { productId: "desc" } },
        take: 10,
      }),
    ]);

    const totalItems = allWishlists.reduce((acc, w) => acc + w.items.length, 0);

    return {
      count: totalItems,
      wishlistCount: allWishlists.length,
      topWishedProducts,
      data: allWishlists,
    };
  }

  // Non-admin — their own wishlist only
  const wishlist = await db.wishlist.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true, name: true, slug: true,
              salePrice: true, price: true,
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
      },
    },
  });

  return {
    count: wishlist?.items.length ?? 0,
    data: wishlist ? [wishlist] : [],
  };
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function getReviewStats() {
  const user = await getAuthenticatedUser();
 const isAdmin = user.roles.some(r => r.roleName.toLowerCase() === "admin");
  const where = isAdmin ? {} : { userId: user.id };

  const [reviews, avgRating] = await Promise.all([
    db.review.findMany({
      where,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: { select: { id: true, name: true, image: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.review.aggregate({
      where,
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return {
    count: reviews.length,
    averageRating: Number((avgRating._avg.rating ?? 0).toFixed(1)),
    ratingDistribution,
    data: reviews,
  };
}

// ── Customers ─────────────────────────────────────────────────────────────────

export async function getCustomerStats() {
  const user = await getAuthenticatedUser();
  const isAdmin = user.roles.some(r => r.roleName.toLowerCase() === "admin");

  if (!isAdmin) {
    // Non-admins just get their own profile
    const profile = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true, name: true, email: true, image: true,
        createdAt: true, subscriptionStatus: true,
        _count: { select: { orders: true, reviews: true } },
      },
    });
    return { count: 1, data: profile ? [profile] : [] };
  }

  const [customers, thisMonthCustomers, lastMonthCustomers] = await Promise.all([
    db.user.findMany({
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        phone: true,
        status: true,
        createdAt: true,
        subscriptionStatus: true,
        role: true,
        orgName: true,
        _count: {
          select: { orders: true, reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.user.count({ where: { createdAt: { gte: startOfMonth() } } }),
    db.user.count({
      where: { createdAt: { gte: startOfLastMonth(), lte: endOfLastMonth() } },
    }),
  ]);

  return {
    count: customers.length,
    trend: getTrendPercent(thisMonthCustomers, lastMonthCustomers),
    trendUp: thisMonthCustomers >= lastMonthCustomers,
    trendLabel: `${getTrendPercent(thisMonthCustomers, lastMonthCustomers)} this month`,
    newThisMonth: thisMonthCustomers,
    data: customers,
  };
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProductStats() {
  const user = await getAuthenticatedUser();
  const isAdmin = user.roles.some(r => r.roleName.toLowerCase() === "admin");
  const where = isAdmin ? { isActive: true } : { isActive: true, orgId: user.orgId };

  const [products, totalProducts, lowStockProducts] = await Promise.all([
    db.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        stock: true,
        lowStock: true,
        sku: true,
        isActive: true,
        isFeatured: true,
        categoryId: true,
        createdAt: true,
        category: { select: { title: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
        variants: {
          select: {
            id: true, name: true, value: true,
            price: true, stock: true, sku: true,
            quantity: true, unit: true,
          },
        },
        _count: { select: { reviews: true, orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.product.count({ where }),
    db.product.count({ where: { ...where, stock: { lte: db.product.fields.lowStock } } }),
  ]);

  return {
    count: totalProducts,
    lowStockCount: products.filter((p) => p.stock <= p.lowStock).length,
    outOfStockCount: products.filter((p) => p.stock === 0).length,
    data: products,
  };
}

// ── Stock Levels ──────────────────────────────────────────────────────────────

export async function getStockLevels() {
  const user = await getAuthenticatedUser();
  const isBuyer = user.roles.some(r => r.roleName === "buyer");
  const isAdmin = user.roles.some(r => r.roleName === "admin");

  const where = isAdmin ? {} : { orgId: user.orgId };

  const products = await db.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      stock: true,
      lowStock: true,
      isActive: true,
      category: { select: { title: true } },
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      variants: {
        select: {
          id: true,
          name: true,
          value: true,
          sku: true,
          stock: true,
          quantity: true,
          unit: true,
        },
      },
      batches: {
        select: {
          id: true,
          batchNumber: true,
          quantity: true,
          expiryDate: true,
          purity: true,
        },
        orderBy: { expiryDate: "asc" },
      },
    },
    orderBy: { stock: "asc" }, // lowest stock first — most urgent
  });

  const categorized = {
    outOfStock:  products.filter((p) => p.stock === 0),
    lowStock:    products.filter((p) => p.stock > 0 && p.stock <= p.lowStock),
    healthy:     products.filter((p) => p.stock > p.lowStock),
  };

  // Aggregate variant stock per product
  const withVariantTotals = products.map((p) => ({
    ...p,
    variantStockTotal: p.variants.reduce((acc, v) => acc + v.stock, 0),
    stockStatus:
      p.stock === 0 ? "OUT_OF_STOCK"
      : p.stock <= p.lowStock ? "LOW_STOCK"
      : "HEALTHY",
  }));

  return {
    totalProducts: products.length,
    outOfStockCount: categorized.outOfStock.length,
    lowStockCount: categorized.lowStock.length,
    healthyCount: categorized.healthy.length,
    categorized,
    data: withVariantTotals,
  };
}

// ── Support / Feedback ────────────────────────────────────────────────────────

export async function getSupportStats() {
  const user = await getAuthenticatedUser();
  const isAdmin = user.roles.some(r => r.roleName.toLowerCase() === "admin");
  const where = isAdmin ? {} : { userId: user.id };

  const [tickets, byStatus] = await Promise.all([
    db.feedback.findMany({
      where,
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.feedback.groupBy({
      by: ["status"],
      where,
      _count: { status: true },
    }),
  ]);

  return {
    count: tickets.length,
    byStatus: byStatus.reduce(
      (acc, s) => ({ ...acc, [s.status]: s._count.status }),
      {} as Record<string, number>
    ),
    data: tickets,
  };
}

// ── Aggregate — all stats in one call for the dashboard ───────────────────────

export async function getAllDashboardStats() {
  const user = await getAuthenticatedUser();
  const isAdmin = user.roles.some(r => r.roleName.toLowerCase() === "admin");;

  const results = await Promise.allSettled([
    getOrderStats(),
    getRevenueStats(),
    getWishlistStats(),
    getReviewStats(),
    getSupportStats(),
    isAdmin ? getProductStats() : Promise.resolve(null),
    isAdmin ? getCustomerStats() : Promise.resolve(null),
    isAdmin ? getStockLevels() : Promise.resolve(null),
  ]);

  const [orders, revenue, wishlist, reviews, support, products, customers, stock] =
    results.map((r) => (r.status === "fulfilled" ? r.value : null));

  return {
    orders,
    revenue,
    wishlist,
    reviews,
    support,
    ...(isAdmin && { products, customers, stock }),
  };
}



// ── Transactions / Payments ───────────────────────────────────────────────────

export async function getTransactionStats() {
  const user = await getAuthenticatedUser();
  const isAdmin = user.roles.some(r => r.roleName.toLowerCase() === "admin");
  const where = isAdmin ? {} : { order: { userId: user.id } };

  const [payments, thisMonth, lastMonth] = await Promise.all([
    db.payment.findMany({
      where,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        method: true,
        paidAt: true,
        createdAt: true,
        proofUrl: true,
        transactionId: true,
        approvedAt: true,
        approvedBy: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.payment.aggregate({
      where: { ...where, createdAt: { gte: startOfMonth() } },
      _sum: { amount: true },
      _count: true,
    }),
    db.payment.aggregate({
      where: {
        ...where,
        createdAt: { gte: startOfLastMonth(), lte: endOfLastMonth() },
      },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const byStatus = payments.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byMethod = payments.reduce((acc, p) => {
    acc[p.method] = (acc[p.method] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    count: payments.length,
    totalValue: payments.reduce((acc, p) => acc + p.amount, 0),
    thisMonthValue: thisMonth._sum.amount ?? 0,
    lastMonthValue: lastMonth._sum.amount ?? 0,
    trend: getTrendPercent(thisMonth._sum.amount ?? 0, lastMonth._sum.amount ?? 0),
    trendUp: (thisMonth._sum.amount ?? 0) >= (lastMonth._sum.amount ?? 0),
    byStatus,
    byMethod,
    data: payments,
  };
}

// ── Monthly revenue series (for charts) ───────────────────────────────────────

export async function getMonthlyRevenueSeries(months = 6) {
  const user = await getAuthenticatedUser();
 const isAdmin = user.roles.some(r => r.roleName.toLowerCase() === "admin");
  const baseWhere = isAdmin ? { paymentStatus: "PAID" as const } : { userId: user.id, paymentStatus: "PAID" as const };

  const series = await Promise.all(
    Array.from({ length: months }).map(async (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - 1 - i));
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const agg = await db.order.aggregate({
        where: { ...baseWhere, createdAt: { gte: start, lte: end } },
        _sum: { totalAmount: true },
        _count: true,
      });

      return {
        month: start.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        revenue: agg._sum.totalAmount ?? 0,
        orders: agg._count,
      };
    })
  );

  return series;
}

// ── Product performance (for reports) ────────────────────────────────────────

export async function getProductReportData() {
  const user = await getAuthenticatedUser();
  const isAdmin = user.roles.some(r => r.roleName.toLowerCase() === "admin");
  const where = isAdmin ? {} : { orgId: user.orgId };

  const products = await db.product.findMany({
    where,
    select: {
      id: true, name: true, slug: true, sku: true,
      price: true, salePrice: true, stock: true, lowStock: true,
      isActive: true, isFeatured: true, createdAt: true,
      category: { select: { title: true } },
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      variants: { select: { id: true, name: true, value: true, stock: true, price: true, unit: true } },
      orderItems: { select: { quantity: true, price: true, subTotal: true } },
      reviews: { select: { rating: true } },
      _count: { select: { orderItems: true, reviews: true, wishlistItems: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => ({
    ...p,
    totalRevenue: p.orderItems.reduce((acc, i) => acc + i.subTotal, 0),
    totalUnitsSold: p.orderItems.reduce((acc, i) => acc + i.quantity, 0),
    averageRating: p.reviews.length
      ? Number((p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length).toFixed(1))
      : null,
    stockStatus: p.stock === 0 ? "Out of Stock" : p.stock <= p.lowStock ? "Low Stock" : "Healthy",
  }));
}