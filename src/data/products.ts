import type { LocalProductInput, ProductSpec } from '../types';

/**
 * PRODUCT CATALOGUE (your real products)
 * ---------------------------------------
 * One line per product, in the order of your photos in public/images/products/ (img1.jpeg ... img26.jpeg).
 *
 *   n         = the photo number (img7.jpeg -> 7)
 *   name      = the product name shown on the website
 *   price     = the price in Naira (just the number, no commas). Use 0 when the price is not decided:
 *               the website then shows "Price on request" and the customer asks on WhatsApp.
 *   category  = necklaces | earrings | rings | bracelets | watches
 *
 * To change a name or a price, edit it below and save. To add a product, add a new line at the end
 * (use the next free photo number) and put the photo in public/images/products/.
 *
 * Rules: this file is never modified by the admin dashboard. Products you add in /admin
 * (Supabase) are shown together with these.
 */

interface Row {
  n: number;
  name: string;
  price: number;
  category: 'necklaces' | 'earrings' | 'rings' | 'bracelets' | 'watches';
}

const rows: Row[] = [
  // NECKLACES (photos 1-7)
  { n: 1, name: 'Titanium Steel Necklace and Bracelet', price: 7000, category: 'necklaces' },
  { n: 2, name: 'Titanium Steel Necklace and Bracelet', price: 7000, category: 'necklaces' },
  { n: 3, name: 'Layered Necklace', price: 4000, category: 'necklaces' },
  { n: 4, name: 'Stainless Steel Necklace and Earrings', price: 3000, category: 'necklaces' },
  { n: 5, name: 'Ankle Chain', price: 2500, category: 'necklaces' },
  { n: 6, name: 'Zirconia Quality Necklace', price: 3500, category: 'necklaces' },
  { n: 7, name: 'Necklace and Earrings', price: 3500, category: 'necklaces' },

  // EARRINGS (photos 8-16)
  { n: 8, name: 'Earrings', price: 1500, category: 'earrings' },
  { n: 9, name: 'Stainless Steel Earrings', price: 2000, category: 'earrings' },
  { n: 10, name: 'Quality Earrings', price: 4500, category: 'earrings' },
  { n: 11, name: 'Earrings', price: 3500, category: 'earrings' },
  { n: 12, name: 'Earrings', price: 4000, category: 'earrings' },
  { n: 13, name: 'Earrings', price: 4000, category: 'earrings' },
  { n: 14, name: 'Earrings', price: 1500, category: 'earrings' },
  { n: 15, name: 'Earrings', price: 4000, category: 'earrings' },
  { n: 16, name: 'Earrings', price: 4000, category: 'earrings' },

  // RINGS (photos 17-18)
  { n: 17, name: 'Rings', price: 2500, category: 'rings' },
  { n: 18, name: 'Arm Ring', price: 2500, category: 'rings' },

  // BRACELETS (photos 19-22)
  { n: 19, name: 'Bracelet', price: 5500, category: 'bracelets' },
  { n: 20, name: 'Quality Ball Bracelet All in 1', price: 7000, category: 'bracelets' },
  { n: 21, name: 'Bracelet', price: 2500, category: 'bracelets' },
  { n: 22, name: 'Floral Bracelets', price: 2500, category: 'bracelets' },

  // WRISTWATCHES (photos 23-26)
  { n: 23, name: 'Wristwatch', price: 12000, category: 'watches' },
  { n: 24, name: 'Wristwatch', price: 12000, category: 'watches' },
  { n: 25, name: 'Wristwatch', price: 10000, category: 'watches' },
  { n: 26, name: 'Wristwatch', price: 10000, category: 'watches' },
];

/** Photos shown in "Featured Pieces" on the homepage. */
const featured = new Set([1, 3, 6, 10, 17, 19, 20, 23]);
/** Photos marked "New". */
const newArrivals = new Set([2, 4, 9, 11, 22, 24]);

const descriptions: Record<Row['category'], string> = {
  necklaces: 'A polished piece for everyday wear, gifting and special days.',
  earrings: 'Light, comfortable earrings that finish any look beautifully.',
  rings: 'A neat ring made to be worn daily or for special occasions.',
  bracelets: 'A bracelet that sits comfortably and adds a quiet sparkle to your wrist.',
  watches: 'A stylish wristwatch that is as pretty as it is practical.',
};

const keywordsFor: Record<Row['category'], string[]> = {
  necklaces: ['necklace', 'chain', 'gift'],
  earrings: ['earrings', 'ear', 'gift'],
  rings: ['ring', 'rings', 'gift'],
  bracelets: ['bracelet', 'bangle', 'gift'],
  watches: ['watch', 'wristwatch', 'time', 'gift'],
};

function specsFor(name: string): ProductSpec[] {
  const specs: ProductSpec[] = [];
  if (/titanium/i.test(name)) specs.push({ label: 'Material', value: 'Titanium steel' });
  else if (/stainless/i.test(name)) specs.push({ label: 'Material', value: 'Stainless steel' });
  if (/zirconia/i.test(name)) specs.push({ label: 'Stones', value: 'Zirconia' });
  specs.push({ label: 'Care', value: 'Keep dry; store in a pouch when not worn' });
  return specs;
}

const pad = (n: number) => String(n).padStart(3, '0');

export const initialProducts: LocalProductInput[] = rows.map((r) => ({
  id: `jv-${pad(r.n)}`,
  name: r.name,
  description: `${r.name}. ${descriptions[r.category]} Message us on WhatsApp to confirm availability and delivery.`,
  price: r.price,
  category: r.category,
  image: `/images/products/img${r.n}.jpeg`,
  additionalImages: [],
  keywords: [...keywordsFor[r.category], ...r.name.toLowerCase().split(/\s+/)],
  specs: specsFor(r.name),
  isFeatured: featured.has(r.n),
  isNewArrival: newArrivals.has(r.n),
  isOnSale: false,
  isAvailable: true,
  // Photo 1 is the newest, so the "Newest" sort shows your first photos first.
  createdAt: new Date(Date.UTC(2026, 10, 24 - r.n, 9, 0, 0)).toISOString(),
}));
