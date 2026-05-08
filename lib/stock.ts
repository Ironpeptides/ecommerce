// lib/stock.ts
// Shared stock deduction utility.
// Call this inside a Prisma $transaction after payment is confirmed.
// Works for both variant and non-variant products.

import { Prisma } from "@prisma/client";

interface OrderItemLike {
  productId:  string;
  variantInfo: string | null;
  quantity:   number;
  productName?: string;
}

/**
 * Deducts stock for all items in a confirmed order.
 * Must be called inside a db.$transaction — pass the `tx` client.
 *
 * @param tx      - Prisma transaction client
 * @param items   - Order items to deduct stock for
 * @param context - String label for log messages e.g. "[credits-payment]"
 */
export async function deductStock(
  tx: Prisma.TransactionClient,
  items: OrderItemLike[],
  context = "[stock]"
) {
  for (const item of items) {
    // Parse variant ID from stored variantInfo JSON
    let variantId: string | null = null;
    if (item.variantInfo) {
      try {
        const parsed = JSON.parse(item.variantInfo);
        variantId = parsed?.id ?? null;
      } catch {
        console.warn(`${context} Could not parse variantInfo for product ${item.productId}`);
      }
    }

    // Deduct from variant stock if applicable
    if (variantId) {
      await tx.productVariant.update({
        where: { id: variantId },
        data:  { stock: { decrement: item.quantity } },
      });
    }

    // Always deduct from parent product stock
    await tx.product.update({
      where: { id: item.productId },
      data:  { stock: { decrement: item.quantity } },
    });

    console.info(
      `${context} Stock deducted — product: ${item.productId}` +
      (variantId ? ` | variant: ${variantId}` : "") +
      ` | qty: ${item.quantity}` +
      (item.productName ? ` | name: ${item.productName}` : "")
    );
  }
}