/**
 * HOMEPAGE HERO "SHORT ADVERTISEMENT"
 * ------------------------------------
 * The big "Elegance in Every Detail." section plays a short slideshow ad of your jewellery.
 * Everything you may want to change is in this file.
 *
 * 1) SLIDES: each slide shows one of your photos (the NUMBER of imgN.jpeg), a small label
 *    and where the label links to. Add, remove or reorder slides freely (2 to 6 look best).
 *    Open http://localhost:5173/image-guide.html to see your photo numbers.
 *
 * 2) OPTIONAL REAL VIDEO: if you have a short advert video (MP4, ideally under 8 MB, 10-20
 *    seconds, no sound needed), put it in public/videos/ and set heroVideo below, for example:
 *       export const heroVideo = '/videos/hero.mp4';
 *    The video then plays (muted, looping) instead of the slideshow. If the video cannot load,
 *    the slideshow is shown automatically. Leave it '' to use the slideshow.
 */

export interface HeroSlide {
  /** Photo number: 5 means /images/products/img5.jpeg */
  photo: number;
  /** Small label shown at the bottom of the ad */
  label: string;
  /** Page the label links to */
  to: string;
}

export const heroSlides: HeroSlide[] = [
  { photo: 5, label: 'Necklaces', to: '/category/necklaces' },
  { photo: 12, label: 'Earrings', to: '/category/earrings' },
  { photo: 20, label: 'Watches', to: '/shop?q=watch' },
  { photo: 21, label: 'Bracelets', to: '/category/bracelets' },
];

/** '' = use the slideshow. Example: '/videos/hero.mp4' */
export const heroVideo = '';

/** How long each slide stays on screen (milliseconds). */
export const SLIDE_MS = 5000;
