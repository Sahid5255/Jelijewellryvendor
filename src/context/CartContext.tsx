import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '../types';
import { readJSON, writeJSON } from '../utils/storage';
import { useCatalog } from './CatalogContext';

const KEY = 'veloura.cart.v1';
const MAX_QTY = 20;

export interface CartLine {
  item: CartItem;
  /** Current catalogue price when the product is known, otherwise the price saved when it was added. */
  unitPrice: number;
  /** Current name/image (falls back to the saved ones). */
  name: string;
  image: string;
  /** True when the live catalogue says the product is sold out. Blocks checkout. */
  soldOut: boolean;
}

interface CartContextValue {
  items: CartItem[];
  lines: CartLine[];
  count: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number, variant?: string) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  hasSoldOut: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(v: unknown): v is CartItem {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.key === 'string' &&
    typeof o.productId === 'string' &&
    typeof o.name === 'string' &&
    typeof o.price === 'number' &&
    typeof o.quantity === 'number' &&
    o.quantity > 0
  );
}

const clampQty = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.floor(n) || 1));

export function CartProvider({ children }: { children: ReactNode }) {
  const { getProduct, status } = useCatalog();
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = readJSON<unknown>(KEY, []);
    return Array.isArray(stored) ? stored.filter(isCartItem).map((i) => ({ ...i, quantity: clampQty(i.quantity) })) : [];
  });

  useEffect(() => writeJSON(KEY, items), [items]);

  // Keep tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      const stored = readJSON<unknown>(KEY, []);
      setItems(Array.isArray(stored) ? stored.filter(isCartItem) : []);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem = useCallback((product: Product, quantity = 1, variant?: string) => {
    const key = variant ? `${product.id}::${variant}` : product.id;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: clampQty(i.quantity + quantity) } : i));
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity: clampQty(quantity),
          variant,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), []);
  const setQuantity = useCallback(
    (key: string, quantity: number) => setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity: clampQty(quantity) } : i))),
    [],
  );
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const lines: CartLine[] = items.map((item) => {
      const live = getProduct(item.productId);
      if (live) {
        return { item, unitPrice: live.price, name: live.name, image: live.image, soldOut: !live.isAvailable };
      }
      // Not in the catalogue. If Supabase is down, a Supabase product is simply not loaded right now,
      // so keep the saved snapshot and let the customer proceed. If Supabase answered fine
      // and the product is still missing, it was deleted or unpublished, so block checkout.
      const removed = status === 'ok' && item.productId.startsWith('sb-');
      return { item, unitPrice: item.price, name: item.name, image: item.image, soldOut: removed };
    });
    return {
      items,
      lines,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: lines.reduce((sum, l) => sum + l.unitPrice * l.item.quantity, 0),
      addItem,
      removeItem,
      setQuantity,
      clear,
      hasSoldOut: lines.some((l) => l.soldOut),
    };
  }, [items, getProduct, status, addItem, removeItem, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
