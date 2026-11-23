import type { Category, Product, ProductInput } from '../types';
import { localProducts, rowToCategory, rowToProduct, type CategoryRow, type ProductRow } from './productService';
import { PRODUCT_BUCKET, requireSupabase, withTimeout } from './supabase';

/* All functions here are only reachable from /admin. Real protection is enforced by
   Row Level Security in Supabase (see supabase/schema.sql), not by this UI code. */

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_IMAGES_PER_PRODUCT = 8;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return `"${file.name}" is not a JPG, PNG or WebP image.`;
  if (file.size > MAX_IMAGE_BYTES) return `"${file.name}" is larger than 5 MB.`;
  return null;
}

/* ------------------------------------------------------------------ auth */

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const sb = requireSupabase();
  const { data, error } = await withTimeout(sb.from('admin_users').select('user_id').eq('user_id', userId).maybeSingle());
  if (error) throw error;
  return Boolean(data);
}

/* -------------------------------------------------------------- products */

export async function listAllRemoteProducts(): Promise<Product[]> {
  const sb = requireSupabase();
  const { data, error } = await withTimeout(sb.from('products').select('*').order('updated_at', { ascending: false }));
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(rowToProduct);
}

function toRow(input: ProductInput) {
  const [main, ...rest] = input.images;
  return {
    name: input.name.trim(),
    description: input.description.trim(),
    price: input.price,
    compare_at_price: input.compareAtPrice,
    category: input.category,
    image_url: main ?? null,
    additional_images: rest,
    keywords: input.keywords,
    specs: input.specs,
    variations: input.variations,
    is_featured: input.isFeatured,
    is_new_arrival: input.isNewArrival,
    is_on_sale: input.isOnSale,
    is_available: input.isAvailable,
    is_published: input.isPublished,
  };
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const sb = requireSupabase();
  const { data, error } = await withTimeout(sb.from('products').insert(toRow(input)).select('*').single());
  if (error) throw error;
  return rowToProduct(data as ProductRow);
}

export async function updateProduct(remoteId: string, input: ProductInput): Promise<Product> {
  const sb = requireSupabase();
  const { data, error } = await withTimeout(sb.from('products').update(toRow(input)).eq('id', remoteId).select('*').single());
  if (error) throw error;
  return rowToProduct(data as ProductRow);
}

/** Only Supabase rows can be deleted. React products are not reachable from here by design. */
export async function deleteProduct(product: Product): Promise<void> {
  if (product.source !== 'supabase' || !product.remoteId) {
    throw new Error('React catalogue products are protected and cannot be deleted from the dashboard.');
  }
  const sb = requireSupabase();
  const { error } = await withTimeout(sb.from('products').delete().eq('id', product.remoteId));
  if (error) throw error;
  await removeStoredImages(product.images).catch(() => undefined);
}

/* ---------------------------------------------------------------- images */

/** Extract the storage object path from a public URL of our bucket, or null for external/React images. */
export function storagePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${PRODUCT_BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split('?')[0]);
}

export async function uploadImage(file: File, folder = 'products'): Promise<string> {
  const problem = validateImageFile(file);
  if (problem) throw new Error(problem);
  const sb = requireSupabase();
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await withTimeout(
    sb.storage.from(PRODUCT_BUCKET).upload(path, file, { cacheControl: '31536000', contentType: file.type, upsert: false }),
    30000,
  );
  if (error) throw error;
  return sb.storage.from(PRODUCT_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Best-effort cleanup of images in our bucket. External and /images/... URLs are left untouched. */
export async function removeStoredImages(urls: string[]): Promise<void> {
  const paths = urls.map(storagePathFromUrl).filter((p): p is string => Boolean(p));
  if (paths.length === 0) return;
  const sb = requireSupabase();
  await withTimeout(sb.storage.from(PRODUCT_BUCKET).remove(paths));
}

/* ------------------------------------------------------------ categories */

export async function listRemoteCategories(): Promise<Category[]> {
  const sb = requireSupabase();
  const { data, error } = await withTimeout(sb.from('categories').select('*').order('sort_order'));
  if (error) throw error;
  return ((data ?? []) as CategoryRow[]).map(rowToCategory);
}

export async function saveCategory(
  c: { slug: string; name: string; description: string; image: string; sortOrder: number },
  isNew: boolean,
): Promise<void> {
  const sb = requireSupabase();
  const row = {
    name: c.name.trim(),
    description: c.description.trim(),
    image_url: c.image || null,
    sort_order: c.sortOrder,
  };
  const { error } = await withTimeout(
    isNew ? sb.from('categories').insert({ slug: c.slug, ...row }) : sb.from('categories').update(row).eq('slug', c.slug),
  );
  if (error) throw error;
}

export async function deleteCategory(slug: string): Promise<void> {
  const sb = requireSupabase();
  const { count, error: countError } = await withTimeout(
    sb.from('products').select('id', { count: 'exact', head: true }).eq('category', slug),
  );
  if (countError) throw countError;
  if ((count ?? 0) > 0) throw new Error(`This category still has ${count} product(s). Move or delete them first.`);
  const { error } = await withTimeout(sb.from('categories').delete().eq('slug', slug));
  if (error) throw error;
}

/* ------------------------------------------------------------- migration */

/**
 * Optional, one-way copy of the React catalogue into Supabase.
 *  - Each copy stores the React id in `legacy_id` (unique) so re-running never duplicates.
 *  - Existing rows are skipped, never overwritten.
 *  - src/data/products.ts is not touched. Once a copy exists the storefront shows the
 *    Supabase version instead of the React original (see mergeCatalogue).
 */
export async function importReactProducts(ids?: string[]): Promise<{ imported: number; skipped: number }> {
  const sb = requireSupabase();
  const candidates = localProducts.filter((p) => !ids || ids.includes(p.id));
  const { data: existing, error: readError } = await withTimeout(
    sb.from('products').select('legacy_id').not('legacy_id', 'is', null),
  );
  if (readError) throw readError;
  const have = new Set((existing ?? []).map((r: { legacy_id: string | null }) => r.legacy_id));
  const fresh = candidates.filter((p) => !have.has(p.id));
  if (fresh.length > 0) {
    const rows = fresh.map((p) => ({
      legacy_id: p.id,
      ...toRow({
        name: p.name,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        category: p.category,
        images: p.images,
        keywords: p.keywords,
        specs: p.specs,
        variations: p.variations,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        isOnSale: p.isOnSale,
        isAvailable: p.isAvailable,
        isPublished: true,
      }),
      created_at: p.createdAt,
    }));
    const { error } = await withTimeout(sb.from('products').upsert(rows, { onConflict: 'legacy_id', ignoreDuplicates: true }));
    if (error) throw error;
  }
  return { imported: fresh.length, skipped: candidates.length - fresh.length };
}
