import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { SHOW_PRICES } from '../data/siteConfig';
import { hasPrice } from '../utils/format';
import type { Product } from '../types';
import SmartImage from './SmartImage';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const { getCategory } = useCatalog();
  const { money } = useSettings();
  const { notify } = useToast();

  const saved = has(product.id);
  const needsOptions = product.variations.length > 0;
  const categoryName = getCategory(product.category)?.name ?? product.category;
  const secondImage = product.images[1];
  const onSale = SHOW_PRICES && (product.isOnSale || (product.compareAtPrice ?? 0) > product.price);

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-cream">
        <Link to={`/product/${product.id}`} className="block h-full w-full" aria-label={`View ${product.name}`}>
          <SmartImage
            src={product.image}
            alt={product.name}
            className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${
              secondImage ? 'group-hover:opacity-0' : ''
            } ${!product.isAvailable ? 'opacity-60' : ''}`}
          />
          {secondImage && (
            <SmartImage
              src={secondImage}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {!product.isAvailable && <span className="bg-ink px-2.5 py-1 text-[10px] uppercase tracking-widest text-white">Sold out</span>}
          {product.isAvailable && onSale && <span className="bg-champagne px-2.5 py-1 text-[10px] uppercase tracking-widest text-ink">Sale</span>}
          {product.isAvailable && product.isNewArrival && (
            <span className="bg-white px-2.5 py-1 text-[10px] uppercase tracking-widest text-ink">New</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => notify(toggle(product) ? 'Saved to your wishlist' : 'Removed from your wishlist')}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition hover:bg-white hover:text-champagne-dark"
        >
          <Heart size={17} className={saved ? 'fill-champagne-dark text-champagne-dark' : ''} aria-hidden />
        </button>

        <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0 max-md:hidden">
          {needsOptions ? (
            <Link to={`/product/${product.id}`} className="btn-primary w-full">
              Choose options
            </Link>
          ) : (
            <button
              type="button"
              disabled={!product.isAvailable}
              onClick={() => {
                addItem(product, 1);
                notify(`${product.name} added to your bag`);
              }}
              className="btn-primary w-full"
            >
              <ShoppingBag size={14} aria-hidden /> {product.isAvailable ? 'Add to Cart' : 'Sold out'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col text-center">
        <p className="eyebrow text-[10px]">
          <Link to={`/category/${product.category}`} className="hover:underline">
            {categoryName}
          </Link>
        </p>
        <h3 className="mt-1.5 font-serif text-xl leading-snug">
          <Link to={`/product/${product.id}`} className="hover:text-champagne-dark">
            {product.name}
          </Link>
        </h3>
        {SHOW_PRICES &&
          (hasPrice(product.price) ? (
            <p className="mt-1.5 text-sm">
              <span className="font-medium">{money(product.price)}</span>
              {(product.compareAtPrice ?? 0) > product.price && (
                <span className="ml-2 text-ink/45 line-through">{money(product.compareAtPrice as number)}</span>
              )}
            </p>
          ) : (
            <p className="mt-1.5 text-sm text-ink/60">Price on request</p>
          ))}

        {/* Touch devices have no hover, so the action is always visible on small screens. */}
        <div className="mt-3 md:hidden">
          {needsOptions ? (
            <Link to={`/product/${product.id}`} className="btn-outline w-full py-2.5">
              Choose options
            </Link>
          ) : (
            <button
              type="button"
              disabled={!product.isAvailable}
              onClick={() => {
                addItem(product, 1);
                notify(`${product.name} added to your bag`);
              }}
              className="btn-outline w-full py-2.5"
            >
              {product.isAvailable ? 'Add to Cart' : 'Sold out'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
