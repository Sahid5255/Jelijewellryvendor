import { initialCategories } from '../data/categories';
import { initialProducts } from '../data/products';
import type { Category, Product, ProductSpec, ProductVariation } from '../types';
import { mergeCatalogue, mergeCategories, normalizeLocal } from '../utils/catalog';
import { supabase, withTimeout } from './supabase';

/* ------------------------------------------------------------------ local */

/** The React catalogue. Available synchronously and always, regardless of Supabase. */
export const localProducts: Product[] = initialProducts.map(normalizeLocal);
export const localCategories: Category[] = initialCategories;

/* ------------------------------------------------------------- row mapping */

export interface ProductRow {
  id: string;
  legacy_id: string | null;
  name: string;
  description: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  category: string;
  image_url: string | null;
  additional_images: string[] | null;
  keywords: string[] | null;
  specs: unknown;
  variations: unknown;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  is_available: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number | null;
}

function asSpecs(value: unknown): ProductSpec[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is { label: unknown; value: unknown } => typeof v === 'object' && v !== null)
    .map((v) => ({ label: String(v.label ?? ''), value: String(v.value ?? '') }))
    .filter((v) => v.label && v.value);
}

function asVariations(value: unknown): ProductVariation[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is { label: unknown; options: unknown } => typeof v === 'object' && v !== null)
    .map((v) => ({
      label: String(v.label ?? ''),
      options: Array.isArray(v.options) ? v.options.map(String).filter(Boolean) : [],
    }))
    .filter((v) => v.label && v.options.length > 0);
}

export function rowToProduct(row: ProductRow): Product {
  const main = row.image_url ?? '';
  const images = [main, ...(row.additional_images ?? [])].filter(Boolean);
  return {
    id: `sb-${row.id}`,
    source: 'supabase',
    remoteId: row.id,
    legacyId: row.legacy_id,
    name: row.name,
    description: row.description ?? '',
    price: Number(row.price),
    compareAtPrice: row.compare_at_price == null ? null : Number(row.compare_at_price),
    category: row.category,
    image: main || '/images/placeholder.svg',
    images: images.length ? images : ['/images/placeholder.svg'],
    keywords: row.keywords ?? [],
    specs: asSpecs(row.specs),
    variations: asVariations(row.variations),
    isFeatured: row.is_featured,
    isNewArrival: row.is_new_arrival,
    isOnSale: row.is_on_sale,
    isAvailable: row.is_available,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToCategory(row: CategoryRow): Category {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    image: row.image_url || '/images/placeholder.svg',
    source: 'supabase',
    sortOrder: row.sort_order ?? 100,
  };
}

/* ----------------------------------------------------------- public fetch */

/** Throws if Supabase is missing, paused, offline or erroring. Callers must catch. */
export async function fetchRemoteProducts(): Promise<Product[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await withTimeout(
    supabase.from('products').select('*').eq('is_published', true).order('created_at', { ascending: false }),
  );
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(rowToProduct);
}

export async function fetchRemoteCategories(): Promise<Category[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await withTimeout(supabase.from('categories').select('*').order('sort_order'));
  if (error) throw error;
  return ((data ?? []) as CategoryRow[]).map(rowToCategory);
}

export interface RemoteCatalogue {
  products: Product[];
  categories: Category[];
}

export async function fetchRemoteCatalogue(): Promise<RemoteCatalogue> {
  const [products, categories] = await Promise.all([fetchRemoteProducts(), fetchRemoteCategories()]);
  return { products, categories };
}

/* ------------------------------------------------------ combined catalogue */

/** Combine React + Supabase products and categories (see utils/catalog.ts for dedupe rules). */
export function combineCatalogue(remote: RemoteCatalogue | null) {
  return {
    products: mergeCatalogue(localProducts, remote?.products ?? []),
    categories: mergeCategories(localCategories, remote?.categories ?? []),
  };
}
