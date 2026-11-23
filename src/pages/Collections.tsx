import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SmartImage from '../components/SmartImage';
import { useCatalog } from '../context/CatalogContext';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Collections() {
  const { categories, products } = useCatalog();
  usePageMeta('Collections', 'Explore Jeli Jewellery Vendor collections: necklaces, earrings, rings, bracelets and jewellery sets.');

  return (
    <>
      <section className="bg-cream">
        <div className="container-x py-14 text-center sm:py-20">
          <p className="eyebrow mb-3">Explore</p>
          <h1 className="text-4xl sm:text-5xl">Collections</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink/70">Every piece, organised the way you shop: by what you love to wear.</p>
        </div>
      </section>
      <div className="container-x section grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const n = products.filter((p) => p.category === c.slug).length;
          return (
            <Link key={c.slug} to={`/category/${c.slug}`} className="group block">
              <div className="aspect-[4/5] overflow-hidden bg-cream">
                <SmartImage src={c.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl">{c.name}</h2>
                  <p className="mt-1 text-sm text-ink/65">{c.description}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs uppercase tracking-widest text-champagne-dark">
                  {n} {n === 1 ? 'piece' : 'pieces'} <ArrowRight size={14} aria-hidden />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
