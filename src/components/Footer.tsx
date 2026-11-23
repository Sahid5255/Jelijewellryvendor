import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import { useSettings } from '../context/SettingsContext';
import { mapUrl } from '../data/siteConfig';
import Logo from './Logo';

export default function Footer() {
  const { settings } = useSettings();
  const { categories } = useCatalog();
  const year = new Date().getFullYear();
  const col = 'mb-5 text-[11px] font-medium uppercase tracking-luxe text-champagne-light';
  const link = 'text-sm text-white/70 transition-colors hover:text-white';

  return (
    <footer className="bg-ink text-white">
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/70">
            Modern luxury jewellery designed to celebrate your beauty, confidence and individuality. Elegance in every detail.
          </p>
          <div className="mt-6 flex gap-3">
            {settings.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full border border-white/20 p-2.5 transition hover:border-champagne-light hover:text-champagne-light">
                <Instagram size={16} aria-hidden />
              </a>
            )}
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full border border-white/20 p-2.5 transition hover:border-champagne-light hover:text-champagne-light">
                <Facebook size={16} aria-hidden />
              </a>
            )}
            {settings.tiktok && (
              <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="flex h-[34px] items-center rounded-full border border-white/20 px-3 text-[11px] font-medium uppercase tracking-wider transition hover:border-champagne-light hover:text-champagne-light">
                TikTok
              </a>
            )}
            {settings.whatsappNumber && (
              <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="rounded-full border border-white/20 p-2.5 transition hover:border-champagne-light hover:text-champagne-light">
                <MessageCircle size={16} aria-hidden />
              </a>
            )}
          </div>
        </div>

        <nav aria-label="Quick links">
          <h3 className={col}>Quick Links</h3>
          <ul className="space-y-3">
            {[
              ['/', 'Home'],
              ['/shop', 'Shop'],
              ['/about', 'About Us'],
              ['/contact', 'Contact'],
              ['/faq', 'FAQ'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className={link}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Jewellery categories">
          <h3 className={col}>Jewellery</h3>
          <ul className="space-y-3">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to={`/category/${c.slug}`} className={link}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className={col}>Contact</h3>
          <ul className="space-y-3 text-sm text-white/70">
            {settings.email && (
              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-champagne-light" aria-hidden />
                <a href={`mailto:${settings.email}`} className="hover:text-white">
                  {settings.email}
                </a>
              </li>
            )}
            <li className="flex items-start gap-3">
              <Phone size={16} className="mt-0.5 shrink-0 text-champagne-light" aria-hidden />
              <span>{settings.phone || (settings.whatsappNumber ? `+${settings.whatsappNumber} (WhatsApp)` : 'Phone number coming soon')}</span>
            </li>
            {settings.address && (
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-champagne-light" aria-hidden />
                <a href={mapUrl(settings.address)} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  {settings.address}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/50 sm:flex-row">
          <p>
            © {year} {settings.storeName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
