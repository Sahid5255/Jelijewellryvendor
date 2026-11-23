import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  combineCatalogue,
  fetchRemoteCatalogue,
  type RemoteCatalogue,
} from '../services/productService';
import { isSupabaseConfigured } from '../services/supabase';
import type { Category, Product, SupabaseStatus } from '../types';

interface CatalogContextValue {
  products: Product[];
  /** Products that can be bought right now (not sold out). */
  availableProducts: Product[];
  categories: Category[];
  status: SupabaseStatus;
  /** True until the first Supabase attempt finishes; React products are already shown meanwhile. */
  isSyncing: boolean;
  getProduct: (id: string) => Product | undefined;
  getCategory: (slug: string) => Category | undefined;
  refresh: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

const RETRY_MS = 60_000;

export function CatalogProvider({ children }: { children: ReactNode }) {
  // React products are available from the very first render: no loading gate, no Supabase dependency.
  const [remote, setRemote] = useState<RemoteCatalogue | null>(null);
  const [status, setStatus] = useState<SupabaseStatus>(isSupabaseConfigured ? 'loading' : 'disabled');
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || inFlight.current) return;
    inFlight.current = true;
    try {
      const data = await fetchRemoteCatalogue();
      setRemote(data);
      setStatus('ok');
    } catch (err) {
      // Keep whatever Supabase data we already had (if any) so a blip doesn't make products vanish.
      console.warn('[veloura] Supabase unavailable; showing React catalogue.', err);
      setStatus('unavailable');
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Automatically pick Supabase products up again when it comes back.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const retry = () => void refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') retry();
    };
    window.addEventListener('online', retry);
    document.addEventListener('visibilitychange', onVisible);
    const timer = status === 'unavailable' ? window.setInterval(retry, RETRY_MS) : undefined;
    return () => {
      window.removeEventListener('online', retry);
      document.removeEventListener('visibilitychange', onVisible);
      if (timer) window.clearInterval(timer);
    };
  }, [refresh, status]);

  const value = useMemo<CatalogContextValue>(() => {
    const { products, categories } = combineCatalogue(remote);
    const byId = new Map(products.map((p) => [p.id, p]));
    const bySlug = new Map(categories.map((c) => [c.slug, c]));
    return {
      products,
      availableProducts: products.filter((p) => p.isAvailable),
      categories,
      status,
      isSyncing: status === 'loading',
      getProduct: (id) => byId.get(id),
      getCategory: (slug) => bySlug.get(slug),
      refresh,
    };
  }, [remote, status, refresh]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside CatalogProvider');
  return ctx;
}
