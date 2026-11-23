import { Check, ChevronRight, Heart, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import QuantitySelector from '../components/QuantitySelector';
import SmartImage from '../components/SmartImage';
import PageLoader from '../components/PageLoader';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { SHOW_PRICES } from '../data/siteConfig';
import { usePageMeta } from '../hooks/usePageMeta';
import { relatedProducts } from '../utils/catalog';
import NotFound from './NotFound';

export default function ProductDetails() {
  const { id = '' } = useParams<{ id: string }>();
  const { getProduct, getCategory, products, isSyncing } = useCatalog();
  const product = getProduct(id);
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const { money } = useSettings();
  const { notify } = useToast();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, string>>({});

  // Reset when navigating between products (e.g. via "You may also like").
  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setSelected({});
  }, [id]);

  usePageMeta(product?.name ?? null, product ? product.description.slice(0, 155) : undefined);

  const related = useMemo(() => (product ? relatedProducts(product, products, 4) : []), [product, products]);

  // A Supabase product may simply not have arrived yet: wait before declaring it missing.
  if (!product) {
    if (isSyncing && id.startsWith('sb-')) return <PageLoader />;
    return <NotFound message="We couldn’t find that piece. It may have been removed or is temporarily unavailable." />;
  }

  const category = getCategory(product.category);
  const saved = has(product.id);
  const onSale = SHOW_PRICES && (product.isOnSale || (product.compareAtPrice ?? 0) > product.price);
  const missing = product.variations.filter((v) => !selected[v.label]);
  const variantText = product.variations
    .map((v) => (selected[v.label] ? `${v.label}: ${selected[v.label]}` : ''))
    .filter(Boolean)
    .join(', ');

  const handleAdd = () => {
    if (!product.isAvailable) return;
    if (missing.length > 0) {
      notify(`Please select: ${missing.map((m) => m.label).join(', ')}`, 'error');
      return;
    }
    addItem(product, quantity, variantText || undefined);
    notify(`${product.name} added to your bag`);
  };

  return (
    <div className="container-x py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-1 text-xs uppercase tracking-widest text-ink/60">
        <Link to="/" className="hover:text-champagne-dark">Home</Link>
        <ChevronRight size={12} aria-hidden />
        <Link to="/shop" className="hover:text-champagne-dark">Shop</Link>
        <ChevronRight size={12} aria-hidden />
        <Link to={`/category/${product.category}`} className="hover:text-champagne-dark">{category?.name ?? product.category}</Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[4/5] overflow-hidden bg-cream">
            <SmartImage key={product.images[activeImage]} src={product.images[activeImage]} alt={product.name} loading="eager" className="h-full w-full animate-fade-in object-cover" />
            <div className="absolute left-4 top-4 flex flex-col items-start gap-1.5">
              {!product.isAvailable && <span className="bg-ink px-3 py-1 text-[10px] uppercase tracking-widest text-white">Sold out</span>}
              {product.isAvailable && onSale && <span className="bg-champagne px-3 py-1 text-[10px] uppercase tracking-widest text-ink">Sale</span>}
              {product.isAvailable && product.isNewArrival && <span className="bg-white px-3 py-1 text-[10px] uppercase tracking-widest">New</span>}
            </div>
          </div>
          {product.images.length > 1 && (
            <ul className="mt-3 grid grid-cols-5 gap-3" aria-label="Product images">
              {product.images.map((img, i) => (
                <li key={img + i}>
                  <button
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`Show image ${i + 1}`}
                    aria-current={i === activeImage}
                    className={`block aspect-square w-full overflow-hidden border-2 bg-cream transition ${i === activeImage ? 'border-champagne-dark' : 'border-transparent hover:border-champagne-light'}`}
                  >
                    <SmartImage src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Info */}
        <div className="lg:py-4">
          <p className="eyebrow">{category?.name ?? product.category}</p>
          <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">{product.name}</h1>
          {SHOW_PRICES ? (
            <p className="mt-5 text-2xl">
              <span className="font-medium">{money(product.price)}</span>
              {(product.compareAtPrice ?? 0) > product.price && (
                <span className="ml-3 text-lg text-ink/45 line-through">{money(product.compareAtPrice as number)}</span>
              )}
            </p>
          ) : (
            <p className="mt-5 text-xs font-medium uppercase tracking-widest text-champagne-dark">Message us on WhatsApp to confirm the price</p>
          )}
          <p className="mt-6 leading-relaxed text-ink/75">{product.description}</p>

          {product.variations.map((v) => (
            <fieldset key={v.label} className="mt-7">
              <legend className="label">
                {v.label}
                {selected[v.label] && <span className="ml-2 normal-case tracking-normal text-ink">{selected[v.label]}</span>}
              </legend>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt) => {
                  const active = selected[v.label] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelected((s) => ({ ...s, [v.label]: opt }))}
                      aria-pressed={active}
                      className={`min-w-12 border px-4 py-2.5 text-sm transition ${active ? 'border-ink bg-ink text-white' : 'border-beige hover:border-champagne-dark'}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <button type="button" onClick={handleAdd} disabled={!product.isAvailable} className="btn-primary min-w-[200px] flex-1 sm:flex-none">
              <ShoppingBag size={16} aria-hidden /> {product.isAvailable ? 'Add to Cart' : 'Sold out'}
            </button>
            <button
              type="button"
              onClick={() => notify(toggle(product) ? 'Saved to your wishlist' : 'Removed from your wishlist')}
              aria-pressed={saved}
              className="btn-outline px-4"
              aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={18} className={saved ? 'fill-champagne-dark text-champagne-dark' : ''} aria-hidden />
              <span className="sr-only sm:not-sr-only">{saved ? 'Saved' : 'Wishlist'}</span>
            </button>
          </div>

          {product.isAvailable && (
            <p className="mt-5 flex items-center gap-2 text-sm text-ink/60">
              <Check size={14} className="text-champagne-dark" aria-hidden /> Orders are completed with our team on WhatsApp.
            </p>
          )}

          {product.specs.length > 0 && (
            <div className="mt-10 border-t border-beige pt-8">
              <h2 className="mb-4 font-serif text-2xl">Specifications</h2>
              <dl className="divide-y divide-beige text-sm">
                {product.specs.map((s) => (
                  <div key={s.label} className="grid grid-cols-3 gap-4 py-3">
                    <dt className="text-ink/60">{s.label}</dt>
                    <dd className="col-span-2">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-beige pt-14" aria-labelledby="related-title">
          <h2 id="related-title" className="mb-10 text-center text-3xl sm:text-4xl">
            You May Also Like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
