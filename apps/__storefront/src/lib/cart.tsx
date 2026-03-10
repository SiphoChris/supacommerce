import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Cart } from "@supacommerce/client";
import { commerce } from "./commerce";
import { useAuth } from "./auth";

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  applyPromotion: (code: string) => Promise<void>;
  removePromotion: (code: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const c = await commerce.cart.getOrCreate();
      setCart(c);
    } catch (e) {
      console.error("Cart refresh failed:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) refresh();
    else setCart(null);
  }, [user, refresh]);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      if (!cart) return;
      setLoading(true);
      try {
        const updated = await commerce.cart.addItem(cart.id, {
          variantId,
          quantity,
        });
        setCart(updated);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    },
    [cart],
  );

  const updateItem = useCallback(
    async (lineItemId: string, quantity: number) => {
      if (!cart) return;
      setLoading(true);
      try {
        const updated = await commerce.cart.updateItem(cart.id, lineItemId, {
          quantity,
        });
        setCart(updated);
      } finally {
        setLoading(false);
      }
    },
    [cart],
  );

  const removeItem = useCallback(
    async (lineItemId: string) => {
      if (!cart) return;
      setLoading(true);
      try {
        const updated = await commerce.cart.removeItem(cart.id, lineItemId);
        setCart(updated);
      } finally {
        setLoading(false);
      }
    },
    [cart],
  );

  const applyPromotion = useCallback(
    async (code: string) => {
      if (!cart) return;
      const updated = await commerce.cart.applyPromotion(cart.id, code);
      setCart(updated);
    },
    [cart],
  );

  const removePromotion = useCallback(
    async (code: string) => {
      if (!cart) return;
      const updated = await commerce.cart.removePromotion(cart.id, code);
      setCart(updated);
    },
    [cart],
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        open,
        openCart: () => setOpen(true),
        closeCart: () => setOpen(false),
        addItem,
        updateItem,
        removeItem,
        applyPromotion,
        removePromotion,
        refresh,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
