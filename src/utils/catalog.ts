import type { Category, LocalProductInput, Product, SortKey } from '../types';

/* Pure catalogue logic (no browser or Supabase imports) so it is easy to test. */

export function normalizeLocal(input: LocalProductInput): Product {
  const images = [input.image, ...input.additionalImages].filter(Boolean);
  return {
    id: input.id,
    source: 'local',
    name: input.name,
    description: input.description,
    price: input.price,
    compareAtPrice: input.compareAtPrice ?? null,
    category: input.category,
    image: input.image,
    images,
    keywords: input.keywords,
    specs: input.specs,
    variations: input.variations ?? [],
    isFeatured: input.isFeatured,
    isNewArrival: input.isNewArrival,
    isOnSale: input.isOnSale,
    isAvailable: input.isAvailable,
    isPublished: true,
    createdAt: input.createdAt,
  };
}

/**
 * Combine React and Supabase products.
 *  - Ids are unique across sources ("sb-" prefix), so nothing collides.
 *  - If a Supabase row records `legacyId` of a React product (it was migrated),
 *    the Supabase copy replaces the React one in the storefront so the product is
 *    never listed twice. The React data itself is never changed; if Supabase
 *    goes down, the React original shows again.
 */
export function mergeCatalogue(local: Product[], remote: Product[]): Product[] {
  const replaced = new Set(remote.map((p) => p.legacyId).filter((v): v is string => Boolean(v)));
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const p of [...remote, ...local]) {
    if (p.source === 'local' && replaced.has(p.id)) continue;
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}

export function mergeCategories(local: Category[], remote: Category[]): Category[] {
  const seen = new Set(local.map((c) => c.slug));
  const extra = remote.filter((c) => !seen.has(c.slug));
  return [...local, ...extra].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** True when some word in `text` starts with the token (so "ring" matches "rings" but not "earrings"). Trailing plural "s" on the token is tolerated. */
function hasWord(text: string, token: string): boolean {
  const words = text.split(/[^a-z0-9]+/).filter(Boolean);
  const singular = token.length > 3 && token.endsWith('s') ? token.slice(0, -1) : token;
  return words.some((w) => w.startsWith(token) || w.startsWith(singular));
}

/** Search by product name, category and keywords (and description as a weaker signal). Every word must match. */
export function searchProducts(products: Product[], categories: Category[], query: string): Product[] {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return products;
  const catName = new Map(categories.map((c) => [c.slug, c.name]));
  const scored: { p: Product; score: number }[] = [];
  for (const p of products) {
    const name = norm(p.name);
    const cat = norm(`${catName.get(p.category) ?? ''} ${p.category}`);
    const kw = norm(p.keywords.join(' '));
    const desc = norm(p.description);
    let total = 0;
    let ok = true;
    for (const t of tokens) {
      let s = 0;
      if (hasWord(name, t)) s += 5;
      if (hasWord(cat, t)) s += 3;
      if (hasWord(kw, t)) s += 3;
      if (hasWord(desc, t)) s += 1;
      if (s === 0) {
        ok = false;
        break;
      }
      total += s;
    }
    if (ok) scored.push({ p, score: total });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.p);
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    default:
      return copy.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }
}

export function filterByCategory(products: Product[], slug?: string | null): Product[] {
  return slug ? products.filter((p) => p.category === slug) : products;
}

export function relatedProducts(product: Product, all: Product[], limit = 4): Product[] {
  const others = all.filter((p) => p.id !== product.id);
  const same = others.filter((p) => p.category === product.category);
  const rest = others.filter((p) => p.category !== product.category);
  return [...same, ...rest].slice(0, limit);
}

export function parseSortKey(value: string | null): SortKey {
  return value === 'price-asc' || value === 'price-desc' ? value : 'newest';
}
