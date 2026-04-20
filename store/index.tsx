import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

type SelectedVariant = {
  id: string;
  value: string;
  unit?: string | null;
  price: number;
  stock?: number;
  sku?: string;
};

type CartProduct = {
  id: string;
  name: string;
  salePrice: number;
  price: number;
  images: { url: string; alt?: string | null; isPrimary?: boolean }[];
  slug: string;
  stock: number;
  quantity?: number;
  sku?: string;
  category?: { id: string; title: string } | null;
  selectedVariant?: SelectedVariant | null;
  selectedOption?: { label: string; value: string; price?: number } | null;
  batches?: { purity?: number }[];
  orgId?: string | null;
};

type Store = {
  cart: CartProduct[];
  wishlist: CartProduct[];
  authRequired: boolean;           // true = show login prompt modal
  setAuthRequired: (val: boolean) => void;
  addToCart: (product: CartProduct, user: any, location: any, deviceInfo: any) => void;
  removeFromCart: (id: string, user: any, location: any, deviceInfo: any) => void;
  addToWishList: (product: CartProduct, user: any, location: any, deviceInfo: any) => void;
  removeFromWishList: (id: string, user: any, location: any, deviceInfo: any) => void;
  clearCart: (user: any, location?: any, deviceInfo?: any) => void;
};

// ─── DB sync helpers (fire-and-forget) ───────────────────────────────────────

const syncCartAdd = async (userId: string, productId: string, variantId?: string, quantity = 1) => {
  try {
    await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId, variantId, quantity }),
    });
  } catch (err) {
    console.warn("[store] Failed to sync cart add:", err);
  }
};

const syncCartRemove = async (userId: string, productId: string) => {
  try {
    await fetch("/api/cart/remove", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId }),
    });
  } catch (err) {
    console.warn("[store] Failed to sync cart remove:", err);
  }
};

const syncWishlistAdd = async (userId: string, productId: string) => {
  try {
    await fetch("/api/wishlist/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId }),
    });
  } catch (err) {
    console.warn("[store] Failed to sync wishlist add:", err);
  }
};

const syncWishlistRemove = async (userId: string, productId: string) => {
  try {
    await fetch("/api/wishlist/remove", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId }),
    });
  } catch (err) {
    console.warn("[store] Failed to sync wishlist remove:", err);
  }
};

const syncCartClear = async (userId: string) => {
  try {
    await fetch("/api/cart/clear", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
  } catch (err) {
    console.warn("[store] Failed to sync cart clear:", err);
  }
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      authRequired: false,

      setAuthRequired: (val) => set({ authRequired: val }),

      addToCart: (product, user, location, deviceInfo) => {
        console.log("Adding to cart:", { product, user, location, deviceInfo });
        if (!user?.id) { set({ authRequired: true }); return; }

        set((state) => {
          const existing = state.cart.find((item) => item.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: (item.quantity ?? 1) + 1 }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { ...product, quantity: product.quantity ?? 1 }] };
        });

        syncCartAdd(user.id, product.id, product.selectedVariant?.id, product.quantity ?? 1);
      },

      removeFromCart: (id, user, location, deviceInfo) => {
        if (!user?.id) { set({ authRequired: true }); return; }

        const removedProduct = get().cart.find((item) => item.id === id);
        set((state) => ({ cart: state.cart.filter((item) => item.id !== id) }));
        if (removedProduct) syncCartRemove(user.id, removedProduct.id);
      },

      addToWishList: (product, user, location, deviceInfo) => {
        if (!user?.id) { set({ authRequired: true }); return; }

        set((state) => {
          if (state.wishlist.find((item) => item.id === product.id)) return state;
          return { wishlist: [...state.wishlist, product] };
        });

        syncWishlistAdd(user.id, product.id);
      },

      removeFromWishList: (id, user, location, deviceInfo) => {
        if (!user?.id) { set({ authRequired: true }); return; }

        const removedProduct = get().wishlist.find((item) => item.id === id);
        set((state) => ({ wishlist: state.wishlist.filter((item) => item.id !== id) }));
        if (removedProduct) syncWishlistRemove(user.id, removedProduct.id);
      },

      clearCart: (user, location, deviceInfo) => {
  console.log("Clearing entire cart", { user, location, deviceInfo });

  

  if (!user?.id) {
    set({ authRequired: true });
    return;
  }

  set({ cart: [] });


  // Sync with backend
  syncCartClear(user.id);
},



    }),
    {
      name: "store-storage",
      // Never persist authRequired — always false on fresh load
      partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist }),
    }
  )
);