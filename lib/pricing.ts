// lib/pricing.ts
export const VIAL_DISCOUNT_TIERS = [
  { minQty: 10, discount: 0.10, label: "10+ vials" },
  { minQty: 5,  discount: 0.05, label: "5+ vials"  },
];

export function getVialDiscountTier(qty: number) {
  return VIAL_DISCOUNT_TIERS.find((t) => qty >= t.minQty) ?? null;
}


