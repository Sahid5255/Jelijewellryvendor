import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroAd from '../components/HeroAd';
import Newsletter from '../components/Newsletter';
import ProductGrid from '../components/ProductGrid';
import Reviews from '../components/Reviews';
import SectionHeading from '../components/SectionHeading';
import SmartImage from '../components/SmartImage';
import { useCatalog } from '../context/CatalogContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { bannerPhotos, img } from '../data/productImages';

export default function Home() {
  const { products, categories } = useCatalog();
  usePageMeta(null, 'Jeli Jewellery Vendor — modern luxury necklaces, earrings, rings, bracelets and jewellery sets. Elegance in every detail.');

  const featured = products.filter((p) => p.isFeatured).slice(0, 8);

  // Each category card shows the main (first listed, available) product of that category.
  // To change which product is shown, move it to the top of its section in src/data/products.ts.
  const categoryCover = (slug: string, fallback: string) => {
    const main = products.find((p) => p.category === slug && p.isAvailable);
    return main ? main.image : fallback;
  };

  return (
    <>
      {/* Hero: short jewellery advert (edit slides in src/data/heroAd.ts) */}
      <HeroAd />

      {/* Shop by category */}
      <section className="container-x section" aria-labelledby="categories-title">
        <SectionHeading eyebrow="Browse" title="Shop by Category" />
        <h2 id="categories-title" className="sr-only">
          Shop by category
        </h2>
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link key={c.slug} to={`/category/${c.slug}`} className="group relative block aspect-[3/4] overflow-hidden bg-cream">
              <SmartImage src={categoryCover(c.slug, c.image)} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" aria-hidden />
              <div className="absolute inset-x-0 bottom-0 p-4 text-center text-white">
                <h3 className="font-serif text-xl text-white sm:text-2xl">{c.name}</h3>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest opacity-90 transition-all group-hover:gap-2">
                  Shop now <ArrowRight size={12} aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-cream" aria-labelledby="featured-title">
        <div className="container-x section">
          <SectionHeading eyebrow="Our Favourites" title="Featured Pieces" subtitle="Hand-picked jewellery to treasure, gift and wear on repeat." />
          <h2 id="featured-title" className="sr-only">
            Featured products
          </h2>
          <div className="mt-14">
            {featured.length > 0 ? (
              <ProductGrid products={featured} />
            ) : (
              <p className="text-center text-ink/60">New featured pieces are on their way.</p>
            )}
          </div>
          <div className="mt-14 text-center">
            <Link to="/shop" className="btn-outline">
              View All Jewellery
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="container-x section">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <SmartImage src={img(bannerPhotos.about)} alt="Jewellery set styled on a champagne backdrop" className="aspect-[4/5] w-full object-cover" />
            <div className="absolute -bottom-5 -right-5 -z-10 hidden h-full w-full border border-champagne sm:block" aria-hidden />
          </div>
          <div>
            <p className="eyebrow mb-3">About Jeli</p>
            <h2 className="text-4xl leading-tight sm:text-5xl">Beauty That Lasts Beyond Trends.</h2>
            <span className="mt-6 block h-px w-14 bg-champagne" aria-hidden />
            <p className="mt-6 leading-relaxed text-ink/75">
              Jeli was created for people who believe jewellery should feel personal. Every piece is designed with restraint: clean lines, a soft glow and details that reward a closer look.
            </p>
            <p className="mt-4 leading-relaxed text-ink/75">
              We favour timeless silhouettes over fleeting fashions, so what you choose today will still feel like you for years to come.
            </p>
            <Link to="/about" className="btn-outline mt-8">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Promo banner */}
      <section className="relative isolate overflow-hidden" aria-label="Promotion">
        <img src={img(bannerPhotos.promo)} alt="" aria-hidden loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/80 via-ink/55 to-transparent" aria-hidden />
        <div className="container-x py-20 sm:py-28">
          <div className="max-w-lg text-white">
            <p className="mb-3 text-[11px] uppercase tracking-luxe text-champagne-light">The Collection</p>
            <h2 className="text-4xl leading-tight text-white sm:text-5xl">Find the piece that feels like you.</h2>
            <p className="mt-5 leading-relaxed text-white/80">
              From everyday essentials to gifts worth remembering, explore the full Jeli collection.
            </p>
            <Link to="/shop" className="btn-light mt-8">
              Explore the Collection
            </Link>
          </div>
        </div>
      </section>

      <Reviews />
      <Newsletter />
    </>
  );
}
