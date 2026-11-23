/**
 * ONE PLACE TO CHOOSE WHICH PHOTO IS USED WHERE.
 * Your photos are in public/images/products/ named img1.jpeg ... img34.jpeg.
 * Below, write the NUMBER of the photo (img7.jpeg -> 7).
 * Tip: open http://localhost:5173/image-guide.html to see every photo with its number.
 */

const FOLDER = '/images/products';
const EXT = 'jpeg';

/** Photo number -> web path. */
export const img = (n: number): string => `${FOLDER}/img${n}.${EXT}`;

/** Not used any more: product photos are set directly in src/data/products.ts. */
export const productPhotos: Record<string, number[]> = {};

/** Category card photos (any photo number). */
export const categoryPhotos: Record<string, number> = {
  necklaces: 1,
  earrings: 12,
  bracelets: 21,
  // rings and jewellery-sets: add a photo number here once you have photos for them
};

/** Homepage / About banners (any photo number). */
export const bannerPhotos = {
  hero: 5, // big image at the top of the homepage
  promo: 9, // background of the promotional banner
  about: 7, // "Beauty That Lasts Beyond Trends" and About page
};