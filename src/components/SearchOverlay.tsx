import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import { useSettings } from '../context/SettingsContext';
import { SHOW_PRICES } from '../data/siteConfig';
import { searchProducts } from '../utils/catalog';
import SmartImage from './SmartImage';

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products, categories } = useCatalog();
  const { money } = useSettings();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const results = useMemo(
    () => (query.trim() ? searchProducts(products, categories, query).slice(0, 5) : []),
    [query, products, categories],
  );

  if (!open) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    onClose();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  };

  return (
    <div className="fixed inset-0 z-[70] animate-fade-in bg-white/98" role="dialog" aria-modal="true" aria-label="Search products">
      <div className="container-x pt-6 sm:pt-10">
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="p-2 hover:text-champagne-dark" aria-label="Close search">
            <X size={24} aria-hidden />
          </button>
        </div>
        <form onSubmit={submit} className="mx-auto mt-4 max-w-2xl" role="search">
          <label htmlFor="site-search" className="sr-only">
            Search jewellery
          </label>
          <div className="flex items-center border-b border-ink pb-3">
            <Search size={20} className="mr-3 text-ink/50" aria-hidden />
            <input
              id="site-search"
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search necklaces, pearl, bridal…"
              className="w-full bg-transparent font-serif text-2xl placeholder:text-ink/30 focus:outline-none sm:text-3xl"
              autoComplete="off"
            />
          </div>
        </form>

        <div className="mx-auto mt-8 max-w-2xl">
          {query.trim() && results.length === 0 && (
            <p className="py-6 text-center text-ink/60">
              No pieces match “{query.trim()}”. Try “pearl”, “gold” or a category like “rings”.
            </p>
          )}
          <ul className="divide-y divide-beige">
            {results.map((p) => (
              <li key={p.id}>
                <Link to={`/product/${p.id}`} onClick={onClose} className="flex items-center gap-4 py-3 hover:bg-cream">
                  <SmartImage src={p.image} alt="" className="h-16 w-14 object-cover" />
                  <span className="flex-1 font-serif text-lg">{p.name}</span>
                  {SHOW_PRICES && <span className="text-sm">{money(p.price)}</span>}
                </Link>
              </li>
            ))}
          </ul>
          {query.trim() && results.length > 0 && (
            <button type="button" onClick={submit} className="mt-6 text-xs uppercase tracking-widest text-champagne-dark link-underline">
              View all results
            </button>
          )}
          {!query.trim() && (
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  to={`/category/${c.slug}`}
                  onClick={onClose}
                  className="border border-beige px-4 py-2 transition hover:border-champagne-dark hover:text-champagne-dark"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
