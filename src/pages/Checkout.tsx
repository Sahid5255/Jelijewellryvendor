import { AlertTriangle, MessageCircle } from 'lucide-react';
import { useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import SmartImage from '../components/SmartImage';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { SHOW_PRICES } from '../data/siteConfig';
import { usePageMeta } from '../hooks/usePageMeta';
import { buildOrderMessage, buildWhatsAppUrl, isValidWhatsAppNumber } from '../utils/whatsapp';

interface Form {
  name: string;
  phone: string;
  address: string;
  notes: string;
}
type Errors = Partial<Record<keyof Form, string>>;

export default function Checkout() {
  const { lines, subtotal, hasSoldOut, clear } = useCart();
  const { settings, money } = useSettings();
  const [form, setForm] = useState<Form>({ name: '', phone: '', address: '', notes: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [opened, setOpened] = useState(false);
  usePageMeta('Checkout');

  const whatsappReady = isValidWhatsAppNumber(settings.whatsappNumber);

  const validate = (): Errors => {
    const e: Errors = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your full name.';
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) e.phone = 'Please enter a valid phone number.';
    if (form.address.trim().length < 8) e.address = 'Please enter your full delivery address.';
    if (form.notes.length > 500) e.notes = 'Notes must be 500 characters or fewer.';
    return e;
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0 || !whatsappReady || hasSoldOut) return;
    const message = buildOrderMessage(
      settings.storeName,
      form,
      lines.map(({ item, unitPrice, name }) => ({ item: { ...item, name }, unitPrice })),
      subtotal,
      settings.currency,
    );
    window.open(buildWhatsAppUrl(settings.whatsappNumber, message), '_blank', 'noopener,noreferrer');
    setOpened(true);
  };

  if (lines.length === 0 && !opened) {
    return (
      <section className="container-x section text-center">
        <h1 className="text-4xl">Your bag is empty</h1>
        <p className="mt-4 text-ink/70">Add a few pieces before checking out.</p>
        <Link to="/shop" className="btn-primary mt-8">
          Shop Jewellery
        </Link>
      </section>
    );
  }

  const field = (id: keyof Form, label: string, props: InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`co-${id}`} className="label">
        {label}
      </label>
      <input
        id={`co-${id}`}
        className="input"
        value={form[id]}
        onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
        aria-invalid={Boolean(errors[id])}
        aria-describedby={errors[id] ? `co-${id}-err` : undefined}
        {...props}
      />
      {errors[id] && (
        <p id={`co-${id}-err`} className="field-error" role="alert">
          {errors[id]}
        </p>
      )}
    </div>
  );

  return (
    <div className="container-x py-12 sm:py-16">
      <h1 className="text-center text-4xl sm:text-5xl">Checkout</h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm text-ink/60">
        Share your details below and we will open WhatsApp with your order request ready to send.
      </p>

      {opened && (
        <div className="mx-auto mt-8 max-w-3xl border border-champagne bg-champagne-soft/50 p-5 text-sm" role="status">
          <p className="font-medium">WhatsApp should have opened with your order request.</p>
          <p className="mt-1 text-ink/75">
            Your order is <strong>not confirmed</strong> until you send the message and our team replies to confirm availability, delivery and payment. If WhatsApp didn’t open, check your pop-up blocker and try again.
          </p>
          <button type="button" className="mt-3 text-xs uppercase tracking-widest text-champagne-dark underline" onClick={() => { clear(); setOpened(false); }}>
            I’ve sent my order: clear my bag
          </button>
        </div>
      )}

      {!whatsappReady && (
        <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 border border-red-200 bg-red-50 p-5 text-sm text-red-800" role="alert">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden />
          <p>
            WhatsApp checkout isn’t set up yet. The store owner needs to set <code>VITE_WHATSAPP_NUMBER</code> (or the number in Admin → Settings).
          </p>
        </div>
      )}

      {hasSoldOut && (
        <div className="mx-auto mt-8 max-w-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-800" role="alert">
          Some items in your bag are no longer available. Please <Link to="/cart" className="underline">review your bag</Link>.
        </div>
      )}

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} noValidate className="space-y-6" aria-label="Customer details">
          {field('name', 'Full name', { autoComplete: 'name', required: true })}
          {field('phone', 'Phone number', { type: 'tel', autoComplete: 'tel', required: true, placeholder: 'Include country code' })}
          <div>
            <label htmlFor="co-address" className="label">
              Delivery address
            </label>
            <textarea
              id="co-address"
              rows={3}
              className="input"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              autoComplete="street-address"
              required
              aria-invalid={Boolean(errors.address)}
              aria-describedby={errors.address ? 'co-address-err' : undefined}
            />
            {errors.address && (
              <p id="co-address-err" className="field-error" role="alert">
                {errors.address}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="co-notes" className="label">
              Order notes <span className="normal-case tracking-normal text-ink/50">(optional)</span>
            </label>
            <textarea id="co-notes" rows={3} maxLength={500} className="input" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary w-full gap-3 sm:w-auto" disabled={!whatsappReady || hasSoldOut}>
            <MessageCircle size={16} aria-hidden /> Send Order on WhatsApp
          </button>
          <p className="text-xs leading-relaxed text-ink/60">
            Your details are only placed in the WhatsApp message you choose to send. They are not stored on this website.
          </p>
        </form>

        <aside className="h-fit bg-cream p-6 sm:p-8" aria-labelledby="co-summary">
          <h2 id="co-summary" className="font-serif text-2xl">
            Order Summary
          </h2>
          <ul className="mt-6 divide-y divide-beige">
            {lines.map(({ item, unitPrice, name, image }) => (
              <li key={item.key} className="flex gap-3 py-4">
                <SmartImage src={image} alt="" className="h-16 w-14 object-cover" />
                <div className="flex-1 text-sm">
                  <p className="font-serif text-base">{name}</p>
                  {item.variant && <p className="text-ink/60">{item.variant}</p>}
                  <p className="text-ink/60">Qty {item.quantity}</p>
                </div>
                {SHOW_PRICES && <p className="text-sm">{money(unitPrice * item.quantity)}</p>}
              </li>
            ))}
          </ul>
          {SHOW_PRICES ? (
            <div className="mt-2 flex justify-between border-t border-beige pt-4 font-medium">
              <span>Total</span>
              <span>{money(subtotal)}</span>
            </div>
          ) : (
            <p className="mt-2 border-t border-beige pt-4 text-sm font-medium">Price: confirmed with you on WhatsApp.</p>
          )}
          <p className="mt-2 text-xs text-ink/60">Delivery fees, if any, are confirmed with you on WhatsApp.</p>
        </aside>
      </div>
    </div>
  );
}
