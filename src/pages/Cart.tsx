import { MessageCircle, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import QuantitySelector from '../components/QuantitySelector';
import SmartImage from '../components/SmartImage';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { SHOW_PRICES } from '../data/siteConfig';
import { usePageMeta } from '../hooks/usePageMeta';
import { buildCartMessage, buildWhatsAppUrl, isValidWhatsAppNumber } from '../utils/whatsapp';

export default function Cart() {
  const { lines, subtotal, removeItem, setQuantity, hasSoldOut, count } = useCart();
  const { money, settings } = useSettings();
  const [notReady, setNotReady] = useState(false);
  usePageMeta('Your Bag');

  // Opens WhatsApp straight away with the items already written in the message.
  const orderOnWhatsApp = () => {
    if (!isValidWhatsAppNumber(settings.whatsappNumber)) {
      setNotReady(true);
      return;
    }
    setNotReady(false);
    const message = buildCartMessage(settings.storeName, lines, subtotal, settings.currency);
    window.open(buildWhatsAppUrl(settings.whatsappNumber, message), '_blank', 'noopener,noreferrer');
  };

  if (lines.length === 0) {
    return (
      <section className="container-x section text-center">
        <ShoppingBag size={44} className="mx-auto text-champagne" strokeWidth={1.2} aria-hidden />
        <h1 className="mt-6 text-4xl">Your bag is empty</h1>
        <p className="mx-auto mt-4 max-w-md text-ink/70">Discover pieces made to be treasured, and add your favourites here.</p>
        <Link to="/shop" className="btn-primary mt-10">
          Continue Shopping
        </Link>
      </section>
    );
  }

  return (
    <div className="container-x py-12 sm:py-16">
      <h1 className="text-center text-4xl sm:text-5xl">Your Bag</h1>
      <p className="mt-3 text-center text-sm text-ink/60">
        {count} {count === 1 ? 'item' : 'items'}
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-beige border-y border-beige">
          {lines.map(({ item, unitPrice, name, image, soldOut }) => (
            <li key={item.key} className="flex gap-4 py-6 sm:gap-6">
              <Link to={`/product/${item.productId}`} className="h-28 w-24 shrink-0 overflow-hidden bg-cream sm:h-36 sm:w-28">
                <SmartImage src={image} alt={name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-xl">
                      <Link to={`/product/${item.productId}`} className="hover:text-champagne-dark">
                        {name}
                      </Link>
                    </h2>
                    {item.variant && <p className="mt-1 text-sm text-ink/60">{item.variant}</p>}
                    {soldOut && <p className="mt-1 text-sm text-red-700">No longer available. Please remove it to continue.</p>}
                  </div>
                  {SHOW_PRICES && <p className="text-sm font-medium">{money(unitPrice * item.quantity)}</p>}
                </div>
                {SHOW_PRICES && <p className="mt-1 text-sm text-ink/60">{money(unitPrice)} each</p>}
                <div className="mt-auto flex items-center justify-between pt-4">
                  <QuantitySelector size="sm" value={item.quantity} onChange={(n) => setQuantity(item.key, n)} />
                  <button type="button" onClick={() => removeItem(item.key)} className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-ink/60 hover:text-red-700">
                    <Trash2 size={14} aria-hidden /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit bg-cream p-6 sm:p-8" aria-labelledby="summary-title">
          <h2 id="summary-title" className="font-serif text-2xl">
            Order Summary
          </h2>
          <dl className="mt-6 space-y-3 text-sm">
            {SHOW_PRICES ? (
              <div className="flex justify-between">
                <dt className="text-ink/70">Subtotal</dt>
                <dd>{money(subtotal)}</dd>
              </div>
            ) : (
              <div className="flex justify-between">
                <dt className="text-ink/70">Price</dt>
                <dd className="text-ink/70">Confirmed on WhatsApp</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink/70">Delivery</dt>
              <dd className="text-ink/70">Confirmed on WhatsApp</dd>
            </div>
            {SHOW_PRICES && (
              <div className="flex justify-between border-t border-beige pt-4 text-base font-medium">
                <dt>Total</dt>
                <dd>{money(subtotal)}</dd>
              </div>
            )}
          </dl>
          <button type="button" className="btn-primary mt-8 w-full gap-2" disabled={hasSoldOut} onClick={orderOnWhatsApp}>
            <MessageCircle size={16} aria-hidden /> Order on WhatsApp
          </button>
          {notReady && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              WhatsApp ordering isn’t available right now. Please try again later or contact us from the Contact page.
            </p>
          )}
          <Link to="/shop" className="mt-4 block text-center text-xs uppercase tracking-widest text-champagne-dark link-underline">
            Continue Shopping
          </Link>
          <p className="mt-6 text-xs leading-relaxed text-ink/60">
            No payment is taken on this website. Tapping Order on WhatsApp opens a chat with us with your items already written. Your order is only confirmed once we reply and agree availability, price, delivery and payment with you.
          </p>
        </aside>
      </div>
    </div>
  );
}
