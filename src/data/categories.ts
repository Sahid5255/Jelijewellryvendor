import type { Category } from '../types';

/**
 * Built-in categories. These always exist, even if Supabase is unavailable.
 * Extra categories added by the admin live in Supabase and are merged in at runtime.
 */
export const initialCategories: Category[] = [
  {
    slug: 'necklaces',
    name: 'Necklaces',
    description: 'Pendants, chains and pearl strands for every neckline.',
    image: '/images/categories/necklaces.svg',
    source: 'local',
    sortOrder: 1,
  },
  {
    slug: 'earrings',
    name: 'Earrings',
    description: 'Drops, hoops and studs with quiet, polished presence.',
    image: '/images/categories/earrings.svg',
    source: 'local',
    sortOrder: 2,
  },
  {
    slug: 'rings',
    name: 'Rings',
    description: 'Solitaires, pearls and stacking bands made to be worn daily.',
    image: '/images/categories/rings.svg',
    source: 'local',
    sortOrder: 3,
  },
  {
    slug: 'bracelets',
    name: 'Bracelets',
    description: 'Delicate chains, beaded strands and sculpted bangles.',
    image: '/images/categories/bracelets.svg',
    source: 'local',
    sortOrder: 4,
  },
  {
    slug: 'jewellery-sets',
    name: 'Jewellery Sets',
    description: 'Coordinated pieces, thoughtfully paired for occasions and gifting.',
    image: '/images/categories/sets.svg',
    source: 'local',
    sortOrder: 5,
  },
];
