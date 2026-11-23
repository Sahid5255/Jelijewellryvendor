import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import { useCatalog } from '../context/CatalogContext';
import { usePageMeta } from '../hooks/usePageMeta';
import type { SortKey } from '../types';
import { SHOW_PRICES } from '../data/siteConfig';
import { filterByCategory, parseSortKey, searchProducts, sortProducts } from '../utils/catalog';

const ALL_SORTS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];
// Price sorting is only offered while prices are shown.
const SORTS = ALL_SORTS.filter((s) => SHOW_PRICES || !s.value.startsWith('price'));

/** Used for both /shop (optional ?category=&q=&sort=) and /category/:slug. */
export default function Shop() {
  const { slug } = useParams<{ slug?: string }>();
  const [params, setParams] = useSearchParams();
  const { products, categories, isSyncing } = useCatalog();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCategory = slug ?? params.get('category') ?? '';
  const q = params.get('q') ?? '';
  const sort = SHOW_PRICES ? parseSortKey(params.get('sort')) : 'newest';
  const category = categories.find((c) => c.slug === activeCategory);
  const unknownCategory = Boolean(activeCategory) && !category && !isSyncing;

  usePageMeta(
    category ? category.name : q ? `Search: ${q}` : 'Shop Jewellery',
    category ? `Shop ${category.name.toLowerCase()} at Jeli Jewellery Vendor. ${category.description}` : 'Browse the full Jeli Jewellery Vendor collection: necklaces, earrings, rings, bracelets and jewellery sets.',
  );

  const visible = useMemo(() => {
    const searched = searchProducts(products, categories, q);
    const filtered = filterByCategory(searched, activeCategory || null);
    // Search results keep relevance order unless the shopper picks a sort explicitly.
    return q && !params.get('sort') ? filtered : sortProducts(filtered, sort);
  }, [products, categories, q, activeCategory, sort, params]);

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setParams(next, { replace: true });
  };

  const categoryLink = (s: string) => {
    const next = new URLSearchParams(params);
    next.delete('category');
    const qs = next.toString();
    return `${s ? `/category/${s}` : '/shop'}${qs ? `?${qs}` : ''}`;
  };

  const hasFilters = Boolean(q || activeCategory || params.get('sort'));
  const pill = (active: boolean) =>
    `whitespace-nowrap border px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
      active ? 'border-ink bg-ink text-white' : 'border-beige hover:border-champagne-dark hover:text-champagne-dark'
    }`;

  return (
    <>
      <section className="bg-cream">
        <div className="container-x py-14 text-center sm:py-20">
          <p className="eyebrow mb-3">{category ? 'Collection' : 'The Collection'}</p>
          <h1 className="text-4xl sm:text-5xl">{category ? category.name : q ? 'Search Results' : 'All Jewellery'}</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink/70">
            {category?.description ?? (q ? `Showing pieces matching “${q}”.` : 'Timeless pieces, designed to be worn and treasured.')}
          </p>
        </div>
      </section>

      <div className="container-x py-10 sm:py-14">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-ink/70" aria-live="polite">
              {visible.length} {visible.length === 1 ? 'piece' : 'pieces'}
            </p>
            <button
              type="button"
              className="btn-outline px-4 py-2.5 lg:hidden"
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              aria-controls="shop-filters"
            >
              <SlidersHorizontal size={14} aria-hidden /> Filters
            </button>
          </div>

          <div id="shop-filters" className={`${filtersOpen ? 'flex' : 'hidden'} flex-col gap-4 lg:flex lg:flex-row lg:items-center`}>
            <form role="search" onSubmit={(e) => e.preventDefault()} className="relative lg:w-72">
              <label htmlFor="shop-search" className="sr-only">
                Search products
              </label>
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" aria-hidden />
              <input
                id="shop-search"
                type="search"
                value={q}
                onChange={(e) => update({ q: e.target.value })}
                placeholder="Search name, category, keyword"
                className="input pl-10"
              />
            </form>
            <div>
              <label htmlFor="shop-sort" className="sr-only">
                Sort by
              </label>
              <select id="shop-sort" value={sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })} className="input lg:w-56">
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category pills */}
        <nav aria-label="Filter by category" className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <Link to={categoryLink('')} className={pill(!activeCategory)} aria-current={!activeCategory ? 'page' : undefined}>
            All
          </Link>
          {categories.map((c) => (
            <Link key={c.slug} to={categoryLink(c.slug)} className={pill(c.slug === activeCategory)} aria-current={c.slug === activeCategory ? 'page' : undefined}>
              {c.name}
            </Link>
          ))}
          {hasFilters && (
            <Link to="/shop" className="ml-auto inline-flex items-center gap-1 whitespace-nowrap px-2 py-2 text-xs uppercase tracking-widest text-champagne-dark">
              <X size={12} aria-hidden /> Clear
            </Link>
          )}
        </nav>

        {/* Results */}
        <div className="mt-10">
          {unknownCategory ? (
            <div className="py-20 text-center">
              <h2 className="text-3xl">We couldn’t find that category</h2>
              <p className="mt-3 text-ink/70">It may have been renamed or removed.</p>
              <Link to="/shop" className="btn-primary mt-8">
                Browse all jewellery
              </Link>
            </div>
          ) : visible.length > 0 ? (
            <ProductGrid products={visible} />
          ) : (
            <div className="py-20 text-center">
              <h2 className="text-3xl">No pieces found</h2>
              <p className="mx-auto mt-3 max-w-md text-ink/70">
                {q
                  ? `Nothing matches “${q}”${category ? ` in ${category.name}` : ''}. Check the spelling or try a broader word such as “pearl” or “gold”.`
                  : 'There are no pieces in this category yet. Please check back soon.'}
              </p>
              <Link to="/shop" className="btn-primary mt-8">
                Clear filters
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
