import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/config/useAuth";
import { redirect } from "next/navigation";
import { ReviewClient } from "./ReviewClient";

import { OrderStatus, PaymentStatus } from "@prisma/client"; 

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const { productId } = await params;
  
  // Use the actual Prisma enum values
  const allowedStatuses: OrderStatus[] = [
    "CONFIRMED", 
    "PROCESSING", 
    "SHIPPED", 
    "DELIVERED"
  ];
  
  const order = await db.order.findFirst({
    where: {
      userId: user.id,
      items: { some: { productId } },
      orderStatus: { in: allowedStatuses },
      paymentStatus: { notIn: ["FAILED", "REFUNDED"] as PaymentStatus[] },
    },
    include: {
      items: true,
    },
  });

  // Rest of your code remains the same...
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <h2 className="text-xl font-semibold">Purchase required</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          You can only review products you have purchased and received.
        </p>
      </div>
    );
  }

  // Check if they already left a review
  const existingReview = await db.review.findFirst({
    where: { userId: user.id, productId },
  });

  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      images: { select: { url: true }, take: 1 },
    },
  });

  if (!product) redirect("/");

  return (
    <ReviewClient
      product={product}
      existingReview={existingReview}
      userId={user.id}
    />
  );
}