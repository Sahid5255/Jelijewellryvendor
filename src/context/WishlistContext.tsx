import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '../types';
import { readJSON, writeJSON } from '../utils/storage';
import { useCatalog } from './CatalogContext';

const KEY = 'veloura.wishlist.v1';

interface WishlistContextValue {
  /** Saved products, using live catalogue data when available and the saved copy otherwise. */
  products: Product[];
  count: number;
  has: (id: string) => boolean;
  toggle: (product: Product) => boolean;
  remove: (id: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function isProduct(v: unknown): v is Product {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.name === 'string' && typeof o.price === 'number' && typeof o.image === 'string';
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { getProduct } = useCatalog();
  const [saved, setSaved] = useState<Product[]>(() => {
    const stored = readJSON<unknown>(KEY, []);
    return Array.isArray(stored) ? stored.filter(isProduct) : [];
  });

  useEffect(() => writeJSON(KEY, saved), [saved]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      const stored = readJSON<unknown>(KEY, []);
      setSaved(Array.isArray(stored) ? stored.filter(isProduct) : []);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const has = useCallback((id: string) => saved.some((p) => p.id === id), [saved]);

  /** Returns true when the product was added, false when removed. */
  const toggle = useCallback(
    (product: Product) => {
      const exists = saved.some((p) => p.id === product.id);
      setSaved((prev) => (exists ? prev.filter((p) => p.id !== product.id) : [...prev, product]));
      return !exists;
    },
    [saved],
  );

  const remove = useCallback((id: string) => setSaved((prev) => prev.filter((p) => p.id !== id)), []);

  const value = useMemo<WishlistContextValue>(
    () => ({
      products: saved.map((p) => getProduct(p.id) ?? p),
      count: saved.length,
      has,
      toggle,
      remove,
    }),
    [saved, getProduct, has, toggle, remove],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}
