import { Heart, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import SmartImage from '../components/SmartImage';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { SHOW_PRICES } from '../data/siteConfig';
import { hasPrice } from '../utils/format';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Wishlist() {
  const { products, remove } = useWishlist();
  const { addItem } = useCart();
  const { money } = useSettings();
  const { notify } = useToast();
  usePageMeta('Wishlist');

  if (products.length === 0) {
    return (
      <section className="container-x section text-center">
        <Heart size={44} className="mx-auto text-champagne" strokeWidth={1.2} aria-hidden />
        <h1 className="mt-6 text-4xl">Your wishlist is empty</h1>
        <p className="mx-auto mt-4 max-w-md text-ink/70">Tap the heart on any piece you love and it will be saved here.</p>
        <Link to="/shop" className="btn-primary mt-10">
          Explore Jewellery
        </Link>
      </section>
    );
  }

  return (
    <div className="container-x py-12 sm:py-16">
      <h1 className="text-center text-4xl sm:text-5xl">Your Wishlist</h1>
      <p className="mt-3 text-center text-sm text-ink/60">
        {products.length} saved {products.length === 1 ? 'piece' : 'pieces'}
      </p>

      <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
        {products.map((p) => {
          const needsOptions = p.variations.length > 0;
          return (
            <li key={p.id} className="group relative flex flex-col">
              <Link to={`/product/${p.id}`} className="relative block aspect-[4/5] overflow-hidden bg-cream">
                <SmartImage src={p.image} alt={p.name} className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${p.isAvailable ? '' : 'opacity-60'}`} />
                {!p.isAvailable && <span className="absolute left-3 top-3 bg-ink px-2.5 py-1 text-[10px] uppercase tracking-widest text-white">Sold out</span>}
              </Link>
              <button
                type="button"
                onClick={() => {
                  remove(p.id);
                  notify('Removed from your wishlist');
                }}
                aria-label={`Remove ${p.name} from wishlist`}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white hover:text-red-700"
              >
                <X size={16} aria-hidden />
              </button>
              <div className="mt-4 text-center">
                <h2 className="font-serif text-xl">
                  <Link to={`/product/${p.id}`} className="hover:text-champagne-dark">
                    {p.name}
                  </Link>
                </h2>
                {SHOW_PRICES && (hasPrice(p.price) ? <p className="mt-1 text-sm font-medium">{money(p.price)}</p> : <p className="mt-1 text-sm text-ink/60">Price on request</p>)}
                {needsOptions ? (
                  <Link to={`/product/${p.id}`} className="btn-outline mt-3 w-full py-2.5">
                    Choose options
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled={!p.isAvailable}
                    onClick={() => {
                      addItem(p, 1);
                      remove(p.id);
                      notify(`${p.name} moved to your bag`);
                    }}
                    className="btn-outline mt-3 w-full py-2.5"
                  >
                    {p.isAvailable ? 'Move to Cart' : 'Sold out'}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
