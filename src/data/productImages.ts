/**
 * ONE PLACE TO CHOOSE WHICH PHOTO IS USED WHERE.
 * ------------------------------------------------
 * Your photos are in public/images/products/ named img1.jpeg ... img34.jpeg.
 * Below, write the NUMBER of the photo (img7.jpeg -> 7).
 *
 * Tip: open http://localhost:5173/image-guide.html to see every photo with its number.
 *
 * The first number of each product is its MAIN photo; the rest appear in its gallery.
 * The numbers below are a first guess (in order). Change them to match your photos.
 */

const FOLDER = '/images/products';
const EXT = 'jpeg';

/** Photo number -> web path. */
export const img = (n: number): string => `${FOLDER}/img${n}.${EXT}`;

/** Not used any more: product photos are set directly in src/data/products.ts (the image paths there). */
export const productPhotos: Record<string, number[]> = {};

/** Category card photos (any photo number). */
export const categoryPhotos: Record<string, number> = {
  necklaces: 1,
  earrings: 8,
  rings: 17,
  bracelets: 19,
  watches: 23,
};

/** Homepage / About banners (any photo number). Temporarily reusing photos until you choose. */
export const bannerPhotos = {
  hero: 1, // big image at the top of the homepage
  promo: 10, // background of the promotional banner
  about: 7, // "Beauty That Lasts Beyond Trends" and About page
};
