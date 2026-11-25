import type { StoreSettings } from '../types';

const env = import.meta.env;

/**
 * Built-in store settings. Environment variables override these defaults and,
 * when Supabase is connected, values saved in Admin > Settings override both.
 * Replace the placeholder contact details before launch.
 */
export const defaultSettings: StoreSettings = {
  storeName: 'Jeli Jewellery Vendor',
  logoUrl: '',
  // Nigeria (+234) 906 488 0687, digits only, as WhatsApp needs it. A .env value, if set, overrides this.
  whatsappNumber: String(env.VITE_WHATSAPP_NUMBER || '2349064880687').replace(/\D/g, ''),
  email: 'daramolajelilat101@gmail.com',
  phone: '+234 906 488 0687',
  address: 'Basorun, Ibadan, Oyo State, Nigeria',
  instagram: 'https://www.instagram.com/jeli_jewelery_vendor',
  facebook: '', // add your Facebook page link here when you have one; it is hidden while empty
  tiktok: 'https://www.tiktok.com/@jelijewelery',
  currency: String(env.VITE_CURRENCY || 'NGN').toUpperCase(),
  announcement: 'Discover Timeless Elegance with Jeli Jewellery Vendor.',
};

export const TAGLINE = 'Elegance in Every Detail.';

/**
 * PRICE DISPLAY SWITCH
 * false = prices are hidden everywhere on the website. Customers message you on WhatsApp
 *         and you confirm the price with them.
 * true  = prices, sale prices, totals and the price sort are shown again.
 */
export const SHOW_PRICES: boolean = true;

/** Opens the store address in Google Maps (works on phones and computers). */
export const mapUrl = (address: string): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
