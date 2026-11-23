export type ProductSource = 'local' | 'supabase';

export interface ProductVariation {
  label: string;
  options: string[];
}

export interface ProductSpec {
  label: string;
  value: string;
}

/** The single product shape used everywhere in the storefront, whatever the source. */
export interface Product {
  /** Globally unique. React products keep their own id (e.g. "vl-n-001"); Supabase products are "sb-<uuid>". */
  id: string;
  source: ProductSource;
  /** Supabase row id (only for source === 'supabase'). */
  remoteId?: string;
  /** For Supabase rows copied from a React product: the React product id they replace. */
  legacyId?: string | null;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  /** Category slug. */
  category: string;
  /** Main image. */
  image: string;
  /** Full gallery, main image first. */
  images: string[];
  keywords: string[];
  specs: ProductSpec[];
  variations: ProductVariation[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  isAvailable: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

/** Shape of the hand-written products in src/data/products.ts. */
export interface LocalProductInput {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  image: string;
  additionalImages: string[];
  keywords: string[];
  specs: ProductSpec[];
  variations?: ProductVariation[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  isAvailable: boolean;
  createdAt: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  image: string;
  source: ProductSource;
  sortOrder: number;
}

export interface StoreSettings {
  storeName: string;
  logoUrl: string;
  whatsappNumber: string;
  email: string;
  phone: string;
  address: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  currency: string;
  announcement: string;
}

/**
 * disabled    – Supabase env vars are not set (React catalogue only)
 * loading     – first fetch in progress (React products are already visible)
 * ok          – Supabase products merged in
 * unavailable – Supabase configured but unreachable / paused / erroring
 */
export type SupabaseStatus = 'disabled' | 'loading' | 'ok' | 'unavailable';

export type SortKey = 'newest' | 'price-asc' | 'price-desc';

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  variant?: string;
}

/** Input used by the admin form to create or update a Supabase product. */
export interface ProductInput {
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  images: string[];
  keywords: string[];
  specs: ProductSpec[];
  variations: ProductVariation[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  isAvailable: boolean;
  isPublished: boolean;
}
