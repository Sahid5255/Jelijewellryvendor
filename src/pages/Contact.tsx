import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useSettings } from '../context/SettingsContext';
import { mapUrl } from '../data/siteConfig';
import { usePageMeta } from '../hooks/usePageMeta';
import { buildWhatsAppUrl, isValidWhatsAppNumber } from '../utils/whatsapp';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Contact() {
  const { settings } = useSettings();
  usePageMeta('Contact', 'Get in touch with Jeli Jewellery Vendor by WhatsApp or email.');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const ready = isValidWhatsAppNumber(settings.whatsappNumber);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your name.';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Please enter a valid email address.';
    if (form.message.trim().length < 10) next.message = 'Please write a message (at least 10 characters).';
    setErrors(next);
    if (Object.keys(next).length > 0 || !ready) return;
    // There is no contact backend: the message is handed to WhatsApp, not stored anywhere.
    const text = `Hello ${settings.storeName}, my name is ${form.name.trim()} (${form.email.trim()}).\n\n${form.message.trim()}`;
    window.open(buildWhatsAppUrl(settings.whatsappNumber, text), '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  const err = (k: string) =>
    errors[k] ? (
      <p id={`ct-${k}-err`} className="field-error" role="alert">
        {errors[k]}
      </p>
    ) : null;

  return (
    <>
      <section className="bg-cream">
        <div className="container-x py-14 text-center sm:py-20">
          <p className="eyebrow mb-3">We’d love to hear from you</p>
          <h1 className="text-4xl sm:text-5xl">Contact</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink/70">Questions about a piece, sizing or an order? Message us and we’ll be glad to help.</p>
        </div>
      </section>

      <div className="container-x section grid gap-14 lg:grid-cols-[1fr_400px]">
        <div>
          <h2 className="text-3xl">Send us a message</h2>
          <p className="mt-3 text-sm text-ink/65">
            There is no contact inbox on this website yet, so your message is sent through WhatsApp. Nothing you type here is stored.
          </p>

          {!ready && (
            <p className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
              WhatsApp isn’t configured yet (set <code>VITE_WHATSAPP_NUMBER</code>). Please use the email address shown instead.
            </p>
          )}
          {sent && (
            <p className="mt-6 border border-champagne bg-champagne-soft/50 p-4 text-sm" role="status">
              WhatsApp should have opened with your message ready. We have not received it until you press send there.
            </p>
          )}

          <form onSubmit={submit} noValidate className="mt-8 space-y-6">
            <div>
              <label htmlFor="ct-name" className="label">Name</label>
              <input id="ct-name" className="input" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'ct-name-err' : undefined} />
              {err('name')}
            </div>
            <div>
              <label htmlFor="ct-email" className="label">Email</label>
              <input id="ct-email" type="email" className="input" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'ct-email-err' : undefined} />
              {err('email')}
            </div>
            <div>
              <label htmlFor="ct-message" className="label">Message</label>
              <textarea id="ct-message" rows={5} className="input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'ct-message-err' : undefined} />
              {err('message')}
            </div>
            <button type="submit" className="btn-primary gap-3" disabled={!ready}>
              <MessageCircle size={16} aria-hidden /> Send via WhatsApp
            </button>
          </form>
        </div>

        <aside className="h-fit bg-cream p-8">
          <h2 className="font-serif text-2xl">Business information</h2>
          <ul className="mt-6 space-y-5 text-sm">
            <li className="flex gap-3">
              <MessageCircle size={18} className="mt-0.5 shrink-0 text-champagne-dark" aria-hidden />
              <div>
                <p className="font-medium">WhatsApp</p>
                {ready ? (
                  <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-champagne-dark underline">
                    Chat with us
                  </a>
                ) : (
                  <p className="text-ink/60">Number to be added</p>
                )}
              </div>
            </li>
            <li className="flex gap-3">
              <Mail size={18} className="mt-0.5 shrink-0 text-champagne-dark" aria-hidden />
              <div>
                <p className="font-medium">Email</p>
                <a href={`mailto:${settings.email}`} className="text-ink/70 hover:text-champagne-dark">{settings.email}</a>
              </div>
            </li>
            <li className="flex gap-3">
              <Phone size={18} className="mt-0.5 shrink-0 text-champagne-dark" aria-hidden />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-ink/70">{settings.phone || 'Phone number to be added'}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-champagne-dark" aria-hidden />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-ink/70">{settings.address}</p>
                {settings.address && (
                  <a href={mapUrl(settings.address)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs uppercase tracking-widest text-champagne-dark link-underline">
                    View on map
                  </a>
                )}
              </div>
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-4 border-t border-beige pt-6 text-xs uppercase tracking-widest">
            {settings.instagram && <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="link-underline">Instagram</a>}
            {settings.facebook && <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="link-underline">Facebook</a>}
            {settings.tiktok && <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" className="link-underline">TikTok</a>}
          </div>
        </aside>
      </div>
    </>
  );
}
